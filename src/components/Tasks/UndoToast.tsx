import type { Task } from "../../types/task"

interface Props {
  task: Task
  onUndo: () => void
}

const UNDO_DELAY_S = 5

export function UndoToast({ task, onUndo }: Props) {
  return (
    <div
      role="alert"
      aria-live="polite"
      className="
        fixed bottom-6 left-1/2 -translate-x-1/2 z-50
        w-[min(90vw,420px)]
        bg-gray-900 text-white rounded-xl shadow-2xl
        overflow-hidden
      "
    >
      <div className="flex items-center justify-between gap-4 px-4 py-3">
        <p className="text-sm truncate">
          <span className="text-gray-400 mr-1">Eliminada:</span>
          <span className="font-medium">{task.text}</span>
        </p>
        <button
          onClick={onUndo}
          className="
            shrink-0 px-3 py-1 rounded-md
            bg-indigo-500 hover:bg-indigo-400
            text-white text-xs font-semibold
            transition-colors
          "
        >
          Deshacer
        </button>
      </div>

      <div className="h-1 w-full bg-gray-700">
        <div
          key={task.id}
          className="h-full bg-indigo-500 origin-left"
          style={{ animation: `progress-shrink ${UNDO_DELAY_S}s linear forwards` }}
        />
      </div>
    </div>
  )
}
