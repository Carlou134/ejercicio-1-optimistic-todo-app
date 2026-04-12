/**
 * TodoList.tsx
 * ────────────
 * Renders the list of todos or the appropriate empty/loading/error state.
 * Passes toggle and delete callbacks down to each TodoItem.
 */

import type { Todo } from '../types/todo'
import { TodoItem } from './TodoItem'

interface Props {
  todos: Todo[]
  isLoading: boolean
  isError: boolean
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

export function TodoList({ todos, isLoading, isError, onToggle, onDelete }: Props) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12 text-gray-400 text-sm gap-2">
        <span className="w-4 h-4 border-2 border-gray-300 border-t-indigo-500 rounded-full animate-spin" />
        Loading todos…
      </div>
    )
  }

  if (isError) {
    return (
      <p className="text-center py-10 text-red-500 text-sm">
        Failed to load todos. Refresh to try again.
      </p>
    )
  }

  if (todos.length === 0) {
    return (
      <p className="text-center py-10 text-gray-400 text-sm">
        No todos yet. Add one above!
      </p>
    )
  }

  return (
    <ul className="divide-y divide-gray-100">
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </ul>
  )
}
