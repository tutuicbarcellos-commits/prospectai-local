import { NextResponse } from "next/server";
import { requireUser, UnauthorizedError } from "@/lib/supabase/server";
import { prospectSearchSchema } from "@/lib/validations/ai";
import { rateLimit, RATE_LIMITS, rateLimitKey } from "@/lib/rate-limit";

export interface ProspectResult {
  company_name: string;
  category: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  instagram: string | null;
  rating: number | null;
}

/**
 * Real business search (Google Places / Maps) is on the roadmap (see
 * section 28 of the product brief) and is deliberately isolated behind
 * this one function. When GOOGLE_PLACES_API_KEY is configured, plug the
 * real provider call in here — everything else in the app (the search
 * page, the results list, "add to pipeline") already expects exactly
 * this shape and needs no changes.
 *
 * Until a provider is connected, this endpoint returns an empty result
 * with `providerConnected: false` rather than fabricating businesses —
 * the product's hard rule is to never invent company data.
 */
async function searchProvider(
  _category: string,
  _location: string
): Promise<{ results: ProspectResult[]; providerConnected: boolean }> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    return { results: [], providerConnected: false };
  }

  // TODO: call the Places API here and map its response into
  // ProspectResult[], using "Informação não encontrada"-style nulls for
  // any field the provider doesn't return — never guess a phone number,
  // website, or rating that wasn't in the response.
  return { results: [], providerConnected: true };
}

export async function POST(request: Request) {
  try {
    const { user } = await requireUser();

    const limited = rateLimit(rateLimitKey(user.id, "prospect:search"), RATE_LIMITS.prospectSearch);
    if (!limited.success) {
      return NextResponse.json({ error: "Muitas buscas em pouco tempo." }, { status: 429 });
    }

    const body = await request.json();
    const parsed = prospectSearchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Informe categoria e localização válidas." },
        { status: 400 }
      );
    }

    const { results, providerConnected } = await searchProvider(
      parsed.data.category,
      parsed.data.location
    );

    return NextResponse.json({ results, providerConnected });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    console.error("[POST /api/prospect/search]", err);
    return NextResponse.json({ error: "Erro ao buscar empresas." }, { status: 500 });
  }
}
