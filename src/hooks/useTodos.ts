/**
 * useTodos.ts
 * ───────────
 * Central hook that owns ALL todo logic:
 *   • fetching (useQuery)
 *   • add / toggle / delete mutations
 *   • optimistic updates  → immediate UI feedback before the server responds
 *   • rollback            → restores previous state when a mutation fails
 *   • undo delete         → 5-second window to cancel a deletion
 *
 * Components only call functions from this hook; they never touch
 * localStorage or React Query directly.
 */

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  addTodoAsync,
  deleteTodoAsync,
  fetchTodos,
  toggleTodoAsync,
} from '../services/todoStorage'
import type { Todo } from '../types/todo'

// ── Constants ─────────────────────────────────────────────────────────
const QUERY_KEY = ['todos'] as const
const UNDO_DELAY_MS = 5_000

// ── Types ─────────────────────────────────────────────────────────────

/**
 * While a deletion is in the undo window we store:
 *   todo     → the item that was removed (shown in the UndoToast)
 *   snapshot → the full list BEFORE the item was removed, used for rollback
 *   timeoutId→ so we can clearTimeout if the user clicks Undo
 */
interface PendingDelete {
  todo: Todo
  snapshot: Todo[]
  timeoutId: ReturnType<typeof setTimeout>
}

// ── Hook ──────────────────────────────────────────────────────────────

export function useTodos() {
  const queryClient = useQueryClient()

  // The single deletion waiting in the undo window (null = nothing pending)
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null)

  // ── Query: load todos ──────────────────────────────────────────────
  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchTodos,
    // We control the cache manually in mutations, so never treat it as stale
    // automatically. onSettled calls invalidateQueries to sync after each op.
    staleTime: Infinity,
  })

  // ── Mutation: add ──────────────────────────────────────────────────
  const addMutation = useMutation({
    mutationFn: addTodoAsync,

    /**
     * onMutate fires synchronously before the async mutationFn runs.
     *
     * What we do here:
     * 1. Cancel any in-flight refetch so it doesn't overwrite our
     *    optimistic update mid-flight.
     * 2. Read and save the current cache (our rollback snapshot).
     * 3. Inject a temporary "optimistic" todo into the cache so the
     *    UI updates instantly — no waiting for the server.
     * 4. Return the snapshot so onError can access it via `context`.
     */
    onMutate: async (text) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY })

      const previous = queryClient.getQueryData<Todo[]>(QUERY_KEY) ?? []

      const optimisticTodo: Todo = {
        id: `optimistic-${Date.now()}`,  // temp id, replaced on success
        text: text.trim(),
        completed: false,
        createdAt: Date.now(),
      }

      queryClient.setQueryData<Todo[]>(QUERY_KEY, [...previous, optimisticTodo])

      return { previous } // ← passed to onError as `context`
    },

    /**
     * onError: the server (or our simulation) rejected the mutation.
     *
     * Rollback: replace the cache with the snapshot we saved in onMutate.
     * The optimistic todo vanishes and the list looks exactly as before.
     */
    onError: (_err, _text, context) => {
      if (context?.previous) {
        queryClient.setQueryData(QUERY_KEY, context.previous)
      }
    },

    /**
     * onSettled runs after success OR error.
     * Invalidating forces a fresh fetch so the real server state wins.
     */
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })

  // ── Mutation: toggle ───────────────────────────────────────────────
  const toggleMutation = useMutation({
    mutationFn: toggleTodoAsync,

    // Same three-step pattern as add:
    // cancel → snapshot → optimistic update → return snapshot
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY })

      const previous = queryClient.getQueryData<Todo[]>(QUERY_KEY) ?? []

      // Flip the completed flag immediately in the cache
      queryClient.setQueryData<Todo[]>(
        QUERY_KEY,
        previous.map(t => (t.id === id ? { ...t, completed: !t.completed } : t)),
      )

      return { previous }
    },

    // Rollback: revert the checkbox to its original state
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(QUERY_KEY, context.previous)
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })

  // ── Mutation: delete ───────────────────────────────────────────────
  /**
   * This mutation is NOT called when the user clicks the delete button.
   * It is called AFTER the 5-second undo window expires (or when a second
   * delete is triggered while one is already pending).
   *
   * At the time this mutation fires, the item is already gone from the
   * React Query cache (we removed it optimistically in `deleteTodo`).
   * The snapshot we need for rollback is passed through the variables so
   * it stays bound to this specific deletion.
   */
  const deleteMutation = useMutation({
    mutationFn: ({ id }: { id: string; snapshot: Todo[] }) =>
      deleteTodoAsync(id),

    /**
     * onMutate for delete: the cache already has the item removed.
     * We just cancel in-flight queries and return the snapshot that
     * was captured when the user originally clicked delete.
     *
     * The snapshot travels with the mutation via `variables` so we never
     * need a separate ref — each mutation carries its own rollback data.
     */
    onMutate: async ({ snapshot }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY })
      return { previous: snapshot }
    },

    /**
     * onError for delete: the localStorage operation failed.
     * Restore the full list (item reappears in the UI).
     */
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(QUERY_KEY, context.previous)
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })

  // ── deleteTodo (public) ────────────────────────────────────────────
  /**
   * Called immediately when the user clicks the delete button.
   *
   * Flow:
   *  1. Capture a snapshot of the current list (before removal).
   *  2. Remove the item from the React Query cache RIGHT NOW (optimistic).
   *  3. Show an UndoToast for UNDO_DELAY_MS.
   *  4a. If the user clicks Undo: restore the snapshot, cancel the timer.
   *  4b. If the timer fires: call deleteMutation to commit the deletion
   *      to localStorage. If that fails, onError restores the snapshot.
   */
  const deleteTodo = (id: string) => {
    const current = queryClient.getQueryData<Todo[]>(QUERY_KEY) ?? []
    const todo = current.find(t => t.id === id)
    if (!todo) return

    // If there's already a pending delete, confirm it immediately
    // (the user is moving on — we commit that deletion without waiting)
    if (pendingDelete) {
      clearTimeout(pendingDelete.timeoutId)
      deleteMutation.mutate({
        id: pendingDelete.todo.id,
        snapshot: pendingDelete.snapshot,
      })
    }

    // Snapshot = full list WITH the item (used to rollback on error or undo)
    const snapshot = current

    // Optimistically remove the item from the cache NOW
    queryClient.setQueryData<Todo[]>(
      QUERY_KEY,
      current.filter(t => t.id !== id),
    )

    // After the undo window, commit to localStorage
    const timeoutId = setTimeout(() => {
      deleteMutation.mutate({ id, snapshot })
      setPendingDelete(null)
    }, UNDO_DELAY_MS)

    setPendingDelete({ todo, snapshot, timeoutId })
  }

  // ── undoDelete (public) ────────────────────────────────────────────
  /**
   * Called when the user clicks "Undo" in the UndoToast.
   * Cancels the pending timer and restores the snapshot to the cache.
   */
  const undoDelete = () => {
    if (!pendingDelete) return
    clearTimeout(pendingDelete.timeoutId)
    queryClient.setQueryData(QUERY_KEY, pendingDelete.snapshot)
    setPendingDelete(null)
  }

  // ── Public API ─────────────────────────────────────────────────────
  return {
    todos: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,

    addTodo: (text: string) => addMutation.mutate(text),
    isAdding: addMutation.isPending,
    addError: addMutation.error?.message ?? null,

    toggleTodo: (id: string) => toggleMutation.mutate(id),
    toggleError: toggleMutation.error?.message ?? null,

    deleteTodo,
    undoDelete,
    /** The todo currently in the undo window (null = no pending delete) */
    pendingDeleteTodo: pendingDelete?.todo ?? null,

    deleteError: deleteMutation.error?.message ?? null,
  }
}
