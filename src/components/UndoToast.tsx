/**
 * UndoToast.tsx
 * ─────────────
 * Fixed toast shown at the bottom of the screen when a todo is deleted.
 *
 * The user has 5 seconds to click "Undo". A CSS animation shrinks a
 * progress bar from full width to zero over those 5 seconds so the user
 * can see the remaining time at a glance.
 *
 * The animation is reset on each new deletion by keying the bar on the
 * todo's id — React will unmount and remount it, restarting the animation.
 */

import type { Todo } from '../types/todo'

interface Props {
  todo: Todo
  onUndo: () => void
}

const UNDO_DELAY_S = 5 // must match UNDO_DELAY_MS in useTodos.ts

export function UndoToast({ todo, onUndo }: Props) {
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
      {/* Main row */}
      <div className="flex items-center justify-between gap-4 px-4 py-3">
        <p className="text-sm truncate">
          <span className="text-gray-400 mr-1">Deleted:</span>
          <span className="font-medium">{todo.text}</span>
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
          Undo
        </button>
      </div>

      {/* Progress bar — shrinks from 100 % → 0 % over UNDO_DELAY_S seconds.
          Keyed on todo.id so the animation restarts for each new deletion. */}
      <div className="h-1 w-full bg-gray-700">
        <div
          key={todo.id}
          className="h-full bg-indigo-500 origin-left"
          style={{
            animation: `progress-shrink ${UNDO_DELAY_S}s linear forwards`,
          }}
        />
      </div>
    </div>
  )
}
