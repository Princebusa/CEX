import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/api/client";
import type { Market } from "@/api/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight } from "lucide-react";

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
    return <div className="p-8 text-muted-foreground">Loading markets...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">{error}</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Markets</h1>
        <p className="text-muted-foreground">Browse and trade available symbols</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {markets.map((market) => (
          <Link key={market.id} to={`/market/${market.symbol}`}>
            <Card className="transition-colors hover:border-primary/50 hover:bg-accent/30">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg">{market.symbol}</CardTitle>
                <ArrowUpRight className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Click to trade</p>
              </CardContent>
            </Card>
          </Link>
        ))}

        {markets.length === 0 && (
          <p className="col-span-full text-center text-muted-foreground">
            No markets found. Add markets in the database.
          </p>
        )}
      </div>
    </div>
  );
}
