import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  const symbol = searchParams.get('symbol');

  if (type === 'stock' && symbol) {
    const apiKey = process.env.NEXT_PUBLIC_POLYGON_API_KEY;
    if (!apiKey || apiKey === 'your_polygon_api_key_here') {
      return NextResponse.json({ error: 'No API key' }, { status: 400 });
    }
    try {
      const res = await fetch(
        `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers/${symbol}?apiKey=${apiKey}`
      );
      const data = await res.json();
      return NextResponse.json(data);
    } catch {
      return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
    }
  }

  if (type === 'econ') {
    const apiKey = process.env.NEXT_PUBLIC_FRED_API_KEY;
    if (!apiKey || apiKey === 'your_fred_api_key_here') {
      return NextResponse.json({ error: 'No API key' }, { status: 400 });
    }
    const series = ['FEDFUNDS', 'CPIAUCSL', 'UNRATE', 'GDP', 'DGS10', 'DGS2', 'MORTGAGE30US'];
    try {
      const results = await Promise.all(
        series.map((s) =>
          fetch(
            `https://api.stlouisfed.org/fred/series/observations?series_id=${s}&api_key=${apiKey}&file_type=json&limit=1&sort_order=desc`
          )
            .then((r) => r.json())
            .then((d) => ({ id: s, value: d.observations?.[0]?.value }))
            .catch(() => ({ id: s, value: null }))
        )
      );
      return NextResponse.json(Object.fromEntries(results.map((r) => [r.id, r.value])));
    } catch {
      return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
}
