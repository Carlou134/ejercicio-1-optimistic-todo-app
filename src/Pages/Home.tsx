import { useEffect, useState } from 'react'
import { TodoInput } from '../components/Tasks/TodoInput'
import { TodoList } from '../components/Tasks/TodoList'
import { UndoToast } from '../components/Tasks/UndoToast'
import { useTasks } from '../hooks/useTasks'

export function Home() {
  const {
    tasks,
    isLoading,
    isError,

    createTask,
    isCreating,
    createError,

    toggleTask,
    toggleError,

    deleteTask,
    undoDelete,
    pendingDeleteTask,
    deleteError,

    isErrorArmed,
    armError,
  } = useTasks()

  const completedCount = tasks.filter(t => t.completed).length

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="max-w-lg mx-auto">

        {/* ── Header ───────────────────────────────────────────────────── */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Optimistic Todo App
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            React Query · Optimistic Updates · Undo · Error Manual
          </p>
        </div>

        <TodoInput onAdd={createTask} isAdding={isCreating} />

        <div className="mb-4 flex justify-end">
          <button
            onClick={armError}
            disabled={isErrorArmed}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium border transition-all
              ${isErrorArmed
                ? 'bg-red-100 border-red-300 text-red-700 cursor-not-allowed opacity-80'
                : 'bg-white border-amber-300 text-amber-700 hover:bg-amber-50 hover:border-amber-400'
              }
            `}
          >
            {isErrorArmed
              ? '⚡ Error preparado — haz cualquier acción'
              : 'Simular error'}
          </button>
        </div>

        {/* ── Banners de error ──────────────────────────────────────────
            Solo se montan mientras la mutación está en estado de error.
            React Query limpia el error en el siguiente intento.           */}
        {createError && <ErrorBanner key={createError} message={`Crear falló: ${createError}`} />}
        {toggleError && <ErrorBanner key={toggleError} message={`Toggle falló: ${toggleError}`} />}
        {deleteError && <ErrorBanner key={deleteError} message={`Eliminar falló (tarea restaurada): ${deleteError}`} />}

        {/* ── Lista de tareas ───────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

          {/* Barra de stats */}
          {!isLoading && !isError && tasks.length > 0 && (
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 text-xs text-gray-500 flex justify-between">
              <span>{tasks.length} tarea{tasks.length !== 1 ? 's' : ''}</span>
              <span>{completedCount} completada{completedCount !== 1 ? 's' : ''}</span>
            </div>
          )}

          <TodoList
            tasks={tasks}
            isLoading={isLoading}
            isError={isError}
            onToggle={toggleTask}
            onDelete={deleteTask}
          />
        </div>

        {/* ── Hint de latencia ─────────────────────────────────────────── */}
        <p className="mt-4 text-center text-xs text-gray-400">
          Latencia simulada: 800 ms · Usa "Simular error" para ver el rollback
        </p>
      </div>

      {/* ── Undo toast ── renderizado fuera de la card para flotar libremente */}
      {pendingDeleteTask && (
        <UndoToast task={pendingDeleteTask} onUndo={undoDelete} />
      )}
    </div>
  )
}

function ErrorBanner({ message }: { message: string }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 5000)
    return () => clearTimeout(timer)
  }, [])

  if (!visible) return null

  return (
    <div
      role="alert"
      className="
        mb-4 px-4 py-2.5 rounded-lg
        bg-red-50 border border-red-200
        text-red-700 text-sm
        flex items-center justify-between
      "
    >
      <span>{message}</span>
      <button
        onClick={() => setVisible(false)}
        aria-label="Cerrar"
        className="ml-3 text-red-400 hover:text-red-600 leading-none"
      >
        ✕
      </button>
    </div>
  )
}
