/**
 * App.tsx
 * ───────
 * Root of the React tree.
 *
 * Responsibilities:
 *   1. Create the QueryClient and provide it to the whole tree via
 *      QueryClientProvider — every useTodos call shares this single client.
 *   2. Render the Home page.
 *
 * QueryClient config:
 *   • retry: 0  → don't auto-retry failed mutations (we want to see rollbacks)
 *   • refetchOnWindowFocus: false → prevent surprise refetches in development
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Home } from './pages/Home'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0,
      refetchOnWindowFocus: false,
    },
    mutations: {
      // No retries — failed mutations should trigger rollback immediately
      retry: 0,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Home />
    </QueryClientProvider>
  )
}
