import type { Task } from "../../types/task"

interface Props {
  task: Task
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

export function TodoItem({ task, onToggle, onDelete }: Props) {
  const isOptimistic = task.id.startsWith('optimistic-')

  return (
    <li
      className={`
        flex items-center gap-3 px-4 py-3
        border-b border-gray-100 last:border-b-0
        transition-opacity
        ${isOptimistic ? 'opacity-50' : 'opacity-100'}
      `}
    >
      {/* Checkbox de toggle */}
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task.id)}
        disabled={isOptimistic}
        className="
          w-4 h-4 rounded border-gray-300
          text-indigo-600 cursor-pointer
          focus:ring-indigo-400 focus:ring-2
          disabled:cursor-not-allowed
        "
      />

      <span
        className={`
          flex-1 text-sm
          ${task.completed ? 'line-through text-gray-400' : 'text-gray-700'}
        `}
      >
        {task.text}
      </span>

      <button
        onClick={() => onDelete(task.id)}
        disabled={isOptimistic}
        aria-label={`Eliminar "${task.text}"`}
        className="
          p-1.5 rounded-md text-gray-400
          hover:text-red-500 hover:bg-red-50
          disabled:pointer-events-none disabled:opacity-40
          transition-colors
        "
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m2 0a2 2 0 00-2-2H9a2 2 0 00-2 2m10 0H5"
          />
        </svg>
      </button>
    </li>
  )
}
