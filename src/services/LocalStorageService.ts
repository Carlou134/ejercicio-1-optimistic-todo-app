import type { Task } from '../types/task'

const STORAGE_KEY = 'optimistic-tasks'

export function loadTasksFromStorage(): Task[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

export function saveTasksToStorage(tasks: Task[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}
