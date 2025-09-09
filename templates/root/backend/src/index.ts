import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { createTRPCContext } from '@/api/trpc'
import { appRouter } from '@/api'

const port = 3001

const app = new Hono()

app.all("/trpc/*", async (c) => {
  fetchRequestHandler({
    endpoint: "/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext: async () => await createTRPCContext(c)
  })
})

console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port,
})
