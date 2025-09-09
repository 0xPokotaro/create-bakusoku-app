import { router, publicProcedure } from '@/api/trpc'
import { z } from 'zod'

// Zod Schema for the input of the ping procedure
const pingInputSchema = z.object({
  greeting: z.string(),
})

// Router
export const appRouter = router({
  ping: publicProcedure
    .input(pingInputSchema)
    .query(({ input }) => `pong ${input.greeting}`),
})

// Export the router type
export type AppRouter = typeof appRouter
