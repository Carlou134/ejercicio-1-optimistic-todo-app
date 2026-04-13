import type { Task } from '../../types/task'
import { TodoItem } from './TodoItem'

interface Props {
  tasks: Task[]
  isLoading: boolean
  isError: boolean
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

export function TodoList({ tasks, isLoading, isError, onToggle, onDelete }: Props) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12 text-gray-400 text-sm gap-2">
        <span className="w-4 h-4 border-2 border-gray-300 border-t-indigo-500 rounded-full animate-spin" />
        Cargando tareas…
      </div>
    )
  }

  if (isError) {
    return (
      <p className="text-center py-10 text-red-500 text-sm">
        Error al cargar tareas. Recarga la página.
      </p>
    )
  }

  if (tasks.length === 0) {
    return (
      <p className="text-center py-10 text-gray-400 text-sm">
        Sin tareas. ¡Agrega una arriba!
      </p>
    )
  }

  return (
    <ul className="divide-y divide-gray-100">
      {tasks.map(task => (
        <TodoItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </ul>
  )
}
