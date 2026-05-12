import { Router } from "express";

const router = Router();

router.get("/market-data", async (req, res) => {
  const { symbols } = req.query;
  const polygonKey = process.env.POLYGON_API_KEY;
  const finnhubKey = process.env.FINNHUB_API_KEY;

  if (!symbols) {
    return res.status(400).json({ error: "symbols query param required" });
  }

  const tickers = String(symbols)
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);

  const results: Record<string, unknown> = {};

  await Promise.allSettled(
    tickers.map(async (ticker) => {
      try {
        if (polygonKey) {
          const response = await fetch(
            `https://api.polygon.io/v2/aggs/ticker/${ticker}/prev?adjusted=true&apiKey=${polygonKey}`
          );
          if (response.ok) {
            const data = await response.json() as {
              results?: Array<{
                o?: number;
                c?: number;
                h?: number;
                l?: number;
                v?: number;
              }>;
            };
            const result = data.results?.[0];
            if (result) {
              results[ticker] = {
                open: result.o,
                close: result.c,
                high: result.h,
                low: result.l,
                volume: result.v,
                source: "polygon",
              };
              return;
            }
          }
        }

        if (finnhubKey) {
          const response = await fetch(
            `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${finnhubKey}`
          );
          if (response.ok) {
            const data = await response.json() as {
              o?: number;
              c?: number;
              h?: number;
              l?: number;
              v?: number;
            };
            results[ticker] = {
              open: data.o,
              close: data.c,
              high: data.h,
              low: data.l,
              volume: data.v,
              source: "finnhub",
            };
            return;
          }
        }

        results[ticker] = { error: "No API key configured or data unavailable" };
      } catch {
        results[ticker] = { error: "Failed to fetch" };
      }
    })
  );

  res.json({ data: results });
});

export default router;
