import { initTRPC } from '@trpc/server'

export type Context = {
  // Memo: Here you can add the context for the TRPC server
}

export async function createTRPCContext(c: Context) {
  // Memo: Here you can add the context for the TRPC server
  return { hono: c }
}

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>

const t = initTRPC.context<TRPCContext>().create()

// Router
export const router = t.router

// Without authed middleware
export const publicProcedure = t.procedure

const authed = t.middleware(({ ctx, next }) => {
  // Memo: Here you implement the authentication process
  return next({ ctx })
})

// With authed middleware
export const authProcedure = t.procedure.use(authed)
