import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Task } from '../types/task'
import { cancelForcedError, forceNextError } from '../services/errorService'
import { createTask, loadTasks, removeTask, toggleTask } from '../services/taskService'

const QUERY_KEY = ['tasks'] as const
const UNDO_DELAY_MS = 5_000

interface PendingDelete {
  task: Task
  snapshot: Task[]
  timeoutId: ReturnType<typeof setTimeout>
}

export function useTasks() {
  const queryClient = useQueryClient()
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null)
  const [isErrorArmed, setIsErrorArmed] = useState(false)

  const armError = () => {
    forceNextError() 
    setIsErrorArmed(true)
  }

  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: loadTasks,
    staleTime: Infinity,
  })

  const createMutation = useMutation({
    mutationFn: createTask,

    onMutate: async (text) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY })

      const previous = queryClient.getQueryData<Task[]>(QUERY_KEY) ?? []

      const optimisticTask: Task = {
        id: `optimistic-${Date.now()}`,
        text: text.trim(),
        completed: false,
        createdAt: Date.now(),
      }

      queryClient.setQueryData<Task[]>(QUERY_KEY, [...previous, optimisticTask])

      return { previous }
    },

    onError: (_err, _text, context) => {
      if (context?.previous) {
        queryClient.setQueryData(QUERY_KEY, context.previous)
      }
    },

    onSettled: () => {
      setIsErrorArmed(false)
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })

  const toggleMutation = useMutation({
    mutationFn: toggleTask,

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY })

      const previous = queryClient.getQueryData<Task[]>(QUERY_KEY) ?? []

      queryClient.setQueryData<Task[]>(
        QUERY_KEY,
        previous.map(t => (t.id === id ? { ...t, completed: !t.completed } : t)),
      )

      return { previous }
    },

    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(QUERY_KEY, context.previous)
      }
    },

    onSettled: () => {
      setIsErrorArmed(false)
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })

  const removeMutation = useMutation({
    mutationFn: ({ id }: { id: string; snapshot: Task[] }) => removeTask(id),

    onMutate: async ({ snapshot }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY })
      return { previous: snapshot }
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(QUERY_KEY, context.previous)
      }
    },

    onSettled: () => {
      setIsErrorArmed(false)
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })

  const deleteTask = (id: string) => {
    const current = queryClient.getQueryData<Task[]>(QUERY_KEY) ?? []
    const task = current.find(t => t.id === id)
    if (!task) return

    if (pendingDelete) {
      clearTimeout(pendingDelete.timeoutId)
      removeMutation.mutate({
        id: pendingDelete.task.id,
        snapshot: pendingDelete.snapshot,
      })
    }

    const snapshot = current

    queryClient.setQueryData<Task[]>(QUERY_KEY, current.filter(t => t.id !== id))

    const timeoutId = setTimeout(() => {
      removeMutation.mutate({ id, snapshot })
      setPendingDelete(null)
    }, UNDO_DELAY_MS)

    setPendingDelete({ task, snapshot, timeoutId })
  }

  const undoDelete = () => {
    if (!pendingDelete) return
    clearTimeout(pendingDelete.timeoutId)
    queryClient.setQueryData(QUERY_KEY, pendingDelete.snapshot)
    setPendingDelete(null)
    cancelForcedError()
    setIsErrorArmed(false)
  }

  return {
    tasks: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,

    createTask: (text: string) => createMutation.mutate(text),
    isCreating: createMutation.isPending,
    createError: createMutation.error?.message ?? null,

    toggleTask: (id: string) => toggleMutation.mutate(id),
    toggleError: toggleMutation.error?.message ?? null,

    deleteTask,
    undoDelete,
    pendingDeleteTask: pendingDelete?.task ?? null,
    deleteError: removeMutation.error?.message ?? null,

    isErrorArmed,
    armError,
  }
}
