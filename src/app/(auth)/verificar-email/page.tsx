import Link from "next/link";
import { MailCheck } from "lucide-react";

export default function VerifyEmailPage() {
  return (
    <div className="animate-fade-in">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-brand-soft">
        <MailCheck className="h-5 w-5 text-brand" />
      </div>
      <h1 className="font-display text-xl font-semibold text-ink">Confirme seu e-mail</h1>
      <p className="mt-2 text-sm text-muted">
        Enviamos um link de confirmação para o seu e-mail. Clique no link para ativar sua
        conta e voltar a acessar o ProspectAI Local.
      </p>
      <Link href="/login" className="mt-6 inline-block text-sm font-medium text-brand hover:underline">
        Voltar para o login
      </Link>
    </div>
  );
}
