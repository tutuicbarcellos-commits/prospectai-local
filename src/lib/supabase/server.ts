import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

/**
 * Server-side Supabase client, bound to the request's auth cookies.
 * Every query made with this client is automatically scoped by Postgres
 * Row Level Security to `auth.uid()` — there is no way for a route handler
 * to accidentally read another user's rows through this client.
 *
 * Never instantiate a client with the service role key here. If a future
 * admin-only job truly needs to bypass RLS, isolate it in a dedicated
 * server-only module and gate it behind an explicit role check.
 */
export function createClient() {
  const cookieStore = cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component with no request/response
            // pair to write to — safe to ignore because middleware.ts
            // refreshes the session on every navigation anyway.
          }
        },
      },
    }
  );
}

/**
 * Fetches the authenticated user from the session cookie and throws
 * a typed error if there isn't one. Route handlers should call this
 * first, before touching any data, and never trust a user id that
 * arrives via the request body or query string.
 */
export async function requireUser() {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new UnauthorizedError();
  }

  return { supabase, user };
}

export class UnauthorizedError extends Error {
  constructor() {
    super("Não autenticado");
    this.name = "UnauthorizedError";
  }
}
