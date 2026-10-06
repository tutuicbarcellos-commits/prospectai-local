import { SignUpForm } from "@/components/auth/signup-form";

// Server Component wrapper: forces this route to render per-request
// instead of being statically prerendered at build time. The actual
// form (and its Supabase client) lives in SignUpForm, a Client
// Component, which only instantiates Supabase on submit — but this
// export also protects us if that ever changes.
export const dynamic = "force-dynamic";

export default function SignUpPage() {
  return <SignUpForm />;
}
