/**
 * todoStorage.ts
 * ──────────────
 * Fake "backend" that reads/writes from localStorage and simulates
 * network latency + random failures so we can test optimistic updates
 * and rollbacks without a real server.
 */

import type { Todo } from '../types/todo'

const STORAGE_KEY = 'optimistic-todos'

// ── Simulation knobs ──────────────────────────────────────────────────
// Increase ERROR_PROBABILITY (0–1) to trigger rollbacks more often.
const SIMULATED_LATENCY_MS = 800
const ERROR_PROBABILITY = 0.2

/**
 * Wraps a value in a Promise that resolves after SIMULATED_LATENCY_MS.
 * Has a ERROR_PROBABILITY chance of rejecting instead.
 */
function simulate<T>(value: T): Promise<T> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < ERROR_PROBABILITY) {
        reject(new Error('Simulated server error — please try again.'))
      } else {
        resolve(value)
      }
    }, SIMULATED_LATENCY_MS)
  })
}

// ── localStorage helpers ──────────────────────────────────────────────

function read(): Todo[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

function write(todos: Todo[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
}

// ── Public async API (mimics real API calls) ──────────────────────────

export async function fetchTodos(): Promise<Todo[]> {
  return simulate(read())
}

export async function addTodoAsync(text: string): Promise<Todo> {
  const todo: Todo = {
    id: crypto.randomUUID(),
    text: text.trim(),
    completed: false,
    createdAt: Date.now(),
  }
  write([...read(), todo])
  return simulate(todo)
}

export async function toggleTodoAsync(id: string): Promise<Todo> {
  const todos = read()
  const todo = todos.find(t => t.id === id)
  if (!todo) throw new Error(`Todo not found: ${id}`)
  const updated: Todo = { ...todo, completed: !todo.completed }
  write(todos.map(t => (t.id === id ? updated : t)))
  return simulate(updated)
}

export async function deleteTodoAsync(id: string): Promise<string> {
  write(read().filter(t => t.id !== id))
  return simulate(id)
}
