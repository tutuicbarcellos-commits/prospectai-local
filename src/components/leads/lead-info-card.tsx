import { Globe, Instagram, MapPin, Phone, Star, Wallet, CalendarClock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrencyBRL, formatDate, withFallback } from "@/lib/utils";
import type { Lead } from "@/types/database";

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Globe;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5 py-2 text-sm">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
      <div>
        <p className="text-xs text-muted">{label}</p>
        <p className="text-ink">{value}</p>
      </div>
    </div>
  );
}

export function LeadInfoCard({ lead }: { lead: Lead }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações da empresa</CardTitle>
      </CardHeader>
      <CardContent className="divide-y divide-border py-0">
        <InfoRow icon={MapPin} label="Endereço" value={withFallback(lead.address)} />
        <InfoRow icon={Phone} label="Telefone" value={withFallback(lead.phone)} />
        <InfoRow icon={Globe} label="Site" value={withFallback(lead.website)} />
        <InfoRow icon={Instagram} label="Instagram" value={withFallback(lead.instagram)} />
        <InfoRow
          icon={Star}
          label="Avaliação"
          value={lead.rating != null ? `${lead.rating}/5` : "Informação não encontrada"}
        />
        <InfoRow
          icon={Wallet}
          label="Valor potencial"
          value={lead.estimated_value != null ? formatCurrencyBRL(lead.estimated_value) : "Não definido"}
        />
        <InfoRow icon={CalendarClock} label="Criado em" value={formatDate(lead.created_at)} />
      </CardContent>
    </Card>
  );
}
