/**
 * TodoItem.tsx
 * ────────────
 * Renders a single todo row with:
 *   • a checkbox to toggle completion
 *   • the todo text (struck-through when completed)
 *   • a delete button
 *
 * Optimistic state is handled entirely in useTodos — this component
 * just receives data and callbacks; it has no async logic.
 */

import type { Todo } from '../types/todo'

interface Props {
  todo: Todo
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

export function TodoItem({ todo, onToggle, onDelete }: Props) {
  // Optimistic todos added by useTodos have an id starting with "optimistic-".
  // We dim them slightly to signal they're still being saved.
  const isOptimistic = todo.id.startsWith('optimistic-')

  return (
    <li
      className={`
        flex items-center gap-3 px-4 py-3
        border-b border-gray-100 last:border-b-0
        transition-opacity
        ${isOptimistic ? 'opacity-50' : 'opacity-100'}
      `}
    >
      {/* Toggle checkbox */}
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        disabled={isOptimistic}
        className="
          w-4 h-4 rounded border-gray-300
          text-indigo-600 cursor-pointer
          focus:ring-indigo-400 focus:ring-2
          disabled:cursor-not-allowed
        "
      />

      {/* Todo text */}
      <span
        className={`
          flex-1 text-sm
          ${todo.completed
            ? 'line-through text-gray-400'
            : 'text-gray-700'}
        `}
      >
        {todo.text}
      </span>

      {/* Delete button */}
      <button
        onClick={() => onDelete(todo.id)}
        disabled={isOptimistic}
        aria-label={`Delete "${todo.text}"`}
        className="
          p-1.5 rounded-md text-gray-400
          hover:text-red-500 hover:bg-red-50
          disabled:pointer-events-none disabled:opacity-40
          transition-colors
        "
      >
        {/* Trash icon (inline SVG, no external dependency) */}
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
