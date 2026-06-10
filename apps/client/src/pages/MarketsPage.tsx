import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/api/client";
import type { Market } from "@/api/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, BarChart3 } from "lucide-react";

export function MarketsPage() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getMarkets()
      .then((res) => setMarkets(res.markets))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        Loading markets…
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-sm text-red-600">{error}</div>;
  }

  return (
    <div className="px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Markets</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Browse symbols and open the trading terminal
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {markets.map((market) => (
          <Link key={market.id} to={`/market/${market.symbol}`}>
            <Card className="group h-full transition-all hover:border-primary/30 hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <BarChart3 className="size-4" />
                  </div>
                  <CardTitle className="text-base font-semibold">{market.symbol}</CardTitle>
                </div>
                <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Open trading view</p>
              </CardContent>
            </Card>
          </Link>
        ))}

        {markets.length === 0 && (
          <p className="col-span-full rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
            No markets found. Add markets in the database.
          </p>
        )}
      </div>
    </div>
  );
}
