/**
 * Home.tsx
 * ────────
 * The main page. Wires together useTodos (logic) with the UI components.
 * Also shows inline error banners when a mutation fails.
 *
 * Rule of thumb kept here:
 *   • No async logic — that lives in useTodos.
 *   • No styling decisions for individual items — those live in their components.
 *   • This file is just composition.
 */

import { useTodos } from '../hooks/useTodos'
import { TodoInput } from '../components/TodoInput'
import { TodoList } from '../components/TodoList'
import { UndoToast } from '../components/UndoToast'

export function Home() {
  const {
    todos,
    isLoading,
    isError,

    addTodo,
    isAdding,
    addError,

    toggleTodo,
    toggleError,

    deleteTodo,
    undoDelete,
    pendingDeleteTodo,
    deleteError,
  } = useTodos()

  const completedCount = todos.filter(t => t.completed).length

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="max-w-lg mx-auto">

        {/* ── Header ──────────────────────────────────────────── */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Optimistic Todo App
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            React Query · Optimistic Updates · Undo on Delete
          </p>
        </div>

        {/* ── Input ───────────────────────────────────────────── */}
        <TodoInput onAdd={addTodo} isAdding={isAdding} />

        {/* ── Error banners ───────────────────────────────────── */}
        {/* Each banner only mounts while the mutation is in its error state.
            React Query clears the error on the next mutation attempt. */}
        {addError && <ErrorBanner message={`Add failed: ${addError}`} />}
        {toggleError && <ErrorBanner message={`Toggle failed: ${toggleError}`} />}
        {deleteError && <ErrorBanner message={`Delete failed (item restored): ${deleteError}`} />}

        {/* ── Todo list ───────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

          {/* Stats bar */}
          {!isLoading && !isError && todos.length > 0 && (
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 text-xs text-gray-500 flex justify-between">
              <span>{todos.length} task{todos.length !== 1 ? 's' : ''}</span>
              <span>{completedCount} completed</span>
            </div>
          )}

          <TodoList
            todos={todos}
            isLoading={isLoading}
            isError={isError}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
          />
        </div>

        {/* ── Dev hint ────────────────────────────────────────── */}
        <p className="mt-4 text-center text-xs text-gray-400">
          20 % of operations fail on purpose — watch the rollbacks!
        </p>
      </div>

      {/* ── Undo toast (rendered outside the card so it floats freely) ── */}
      {pendingDeleteTodo && (
        <UndoToast todo={pendingDeleteTodo} onUndo={undoDelete} />
      )}
    </div>
  )
}

// ── Small helper component (local, not worth a separate file) ──────────

function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="
        mb-4 px-4 py-2.5 rounded-lg
        bg-red-50 border border-red-200
        text-red-700 text-sm
      "
    >
      {message}
    </div>
  )
}
