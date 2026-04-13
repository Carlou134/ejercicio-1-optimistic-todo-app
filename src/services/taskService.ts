import type { Task } from "../types/task";
import { loadTasksFromStorage, saveTasksToStorage } from "./LocalStorageService";
import { maybeFail } from "./errorService";

export async function loadTasks(): Promise<Task[]> {
  maybeFail()
  return loadTasksFromStorage()
}

export async function createTask(text: string): Promise<Task> {
  maybeFail()

  const task: Task = {
    id: crypto.randomUUID(),
    text: text.trim(),
    completed: false,
    createdAt: Date.now(),
  }
  saveTasksToStorage([...loadTasksFromStorage(), task])
  return task
}

export async function toggleTask(id: string): Promise<Task> {
  maybeFail()

  const tasks = loadTasksFromStorage()
  const task = tasks.find(t => t.id === id)
  if (!task) throw new Error(`Tarea no encontrada: ${id}`)
  const updated: Task = { ...task, completed: !task.completed }
  saveTasksToStorage(tasks.map(t => (t.id === id ? updated : t)))
  return updated
}

export async function removeTask(id: string): Promise<string> {
  maybeFail()

  saveTasksToStorage(loadTasksFromStorage().filter(t => t.id !== id))
  return id
}