/**
 * TodoInput.tsx
 * ─────────────
 * Controlled form for adding a new todo.
 * Calls `onAdd(text)` and clears itself on submit.
 * Shows a spinner while the add mutation is in-flight.
 */

import { useState } from 'react'

interface Props {
  onAdd: (text: string) => void
  isAdding: boolean
}

export function TodoInput({ onAdd, isAdding }: Props) {
  const [text, setText] = useState('')

  // Inline handler — TypeScript infers the event type from the JSX prop,
  // so no explicit FormEvent import is needed (deprecated in React 19).
  return (
    <form
      onSubmit={e => {
        e.preventDefault()
        const trimmed = text.trim()
        if (!trimmed) return
        onAdd(trimmed)
        setText('')
      }}
      className="flex gap-2 mb-6"
    >
      <input
        type="text"
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="What needs to be done?"
        disabled={isAdding}
        className="
          flex-1 px-4 py-2.5 rounded-lg border border-gray-200
          bg-white text-gray-800 placeholder-gray-400 text-sm
          focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent
          disabled:opacity-50 disabled:cursor-not-allowed
          transition
        "
      />
      <button
        type="submit"
        disabled={isAdding || !text.trim()}
        className="
          px-5 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium
          hover:bg-indigo-700 active:scale-95
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all flex items-center gap-2
        "
      >
        {isAdding ? (
          <>
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Adding…
          </>
        ) : (
          'Add'
        )}
      </button>
    </form>
  )
}
