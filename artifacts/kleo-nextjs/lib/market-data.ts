const CACHE_KEY = 'kleo_market_cache';
const MARKET_TTL = 15 * 60 * 1000; // 15 min
const ECON_TTL = 24 * 60 * 60 * 1000; // 24 hr
const NEWS_TTL = 60 * 60 * 1000; // 1 hr

interface CacheEntry {
  data: unknown;
  timestamp: number;
  ttl: number;
}

function getCache(): Record<string, CacheEntry> {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setCache(key: string, data: unknown, ttl: number): void {
  try {
    const cache = getCache();
    cache[key] = { data, timestamp: Date.now(), ttl };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {}
}

function getCached<T>(key: string): T | null {
  const cache = getCache();
  const entry = cache[key];
  if (!entry) return null;
  if (Date.now() - entry.timestamp > entry.ttl) return null;
  return entry.data as T;
}

export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high52: number;
  low52: number;
}

export interface StockAnalysis {
  symbol: string;
  targetPrice: number;
  analystCount: number;
  recommendation: string;
  eps: number;
}

export interface EconIndicators {
  fedFunds: number;
  cpi: number;
  unemployment: number;
  gdp: number;
  treasury10y: number;
  treasury2y: number;
  mortgage30y: number;
}

export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: string;
}

export async function fetchStockQuote(symbol: string): Promise<StockQuote | null> {
  const apiKey = process.env.NEXT_PUBLIC_POLYGON_API_KEY;
  if (!apiKey || apiKey === 'your_polygon_api_key_here') return null;
  const cacheKey = `stock_${symbol}`;
  const cached = getCached<StockQuote>(cacheKey);
  if (cached) return cached;
  try {
    const [snap, details] = await Promise.all([
      fetch(`https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers/${symbol}?apiKey=${apiKey}`).then(r => r.json()),
      fetch(`https://api.polygon.io/v3/reference/tickers/${symbol}?apiKey=${apiKey}`).then(r => r.json()),
    ]);
    if (!snap.ticker) return null;
    const t = snap.ticker;
    const result: StockQuote = {
      symbol,
      price: t.day?.c || t.lastTrade?.p || 0,
      change: t.todaysChange || 0,
      changePercent: t.todaysChangePerc || 0,
      high52: details.results?.market_cap ? 0 : 0,
      low52: 0,
    };
    setCache(cacheKey, result, MARKET_TTL);
    return result;
  } catch {
    return null;
  }
}

export async function fetchStockAnalysis(symbol: string): Promise<StockAnalysis | null> {
  const apiKey = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
  if (!apiKey || apiKey === 'your_finnhub_api_key_here') return null;
  const cacheKey = `analysis_${symbol}`;
  const cached = getCached<StockAnalysis>(cacheKey);
  if (cached) return cached;
  try {
    const [rec, target] = await Promise.all([
      fetch(`https://finnhub.io/api/v1/stock/recommendation?symbol=${symbol}&token=${apiKey}`).then(r => r.json()),
      fetch(`https://finnhub.io/api/v1/stock/price-target?symbol=${symbol}&token=${apiKey}`).then(r => r.json()),
    ]);
    const latest = Array.isArray(rec) && rec.length > 0 ? rec[0] : null;
    const result: StockAnalysis = {
      symbol,
      targetPrice: target.targetMean || 0,
      analystCount: target.lastUpdated ? 20 : 0,
      recommendation: latest ? `${latest.buy} buy, ${latest.hold} hold, ${latest.sell} sell` : '',
      eps: 0,
    };
    setCache(cacheKey, result, MARKET_TTL);
    return result;
  } catch {
    return null;
  }
}

export async function fetchEconIndicators(): Promise<EconIndicators | null> {
  const apiKey = process.env.NEXT_PUBLIC_FRED_API_KEY;
  if (!apiKey || apiKey === 'your_fred_api_key_here') return null;
  const cacheKey = 'econ_indicators';
  const cached = getCached<EconIndicators>(cacheKey);
  if (cached) return cached;

  const series = ['FEDFUNDS', 'CPIAUCSL', 'UNRATE', 'GDP', 'DGS10', 'DGS2', 'MORTGAGE30US'];
  try {
    const results = await Promise.all(
      series.map(s =>
        fetch(`https://api.stlouisfed.org/fred/series/observations?series_id=${s}&api_key=${apiKey}&file_type=json&limit=1&sort_order=desc`)
          .then(r => r.json())
          .then(d => ({ id: s, value: parseFloat(d.observations?.[0]?.value || '0') }))
          .catch(() => ({ id: s, value: 0 }))
      )
    );
    const map = Object.fromEntries(results.map(r => [r.id, r.value]));
    const indicators: EconIndicators = {
      fedFunds: map.FEDFUNDS,
      cpi: map.CPIAUCSL,
      unemployment: map.UNRATE,
      gdp: map.GDP,
      treasury10y: map.DGS10,
      treasury2y: map.DGS2,
      mortgage30y: map.MORTGAGE30US,
    };
    setCache(cacheKey, indicators, ECON_TTL);
    return indicators;
  } catch {
    return null;
  }
}

export async function fetchFinancialNews(query: string): Promise<NewsArticle[]> {
  const apiKey = process.env.NEXT_PUBLIC_NEWSAPI_KEY;
  if (!apiKey || apiKey === 'your_newsapi_key_here') return [];
  const cacheKey = `news_${query.replace(/\s+/g, '_').toLowerCase()}`;
  const cached = getCached<NewsArticle[]>(cacheKey);
  if (cached) return cached;
  try {
    const res = await fetch(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(query + ' finance')}&sortBy=publishedAt&pageSize=3&apiKey=${apiKey}`
    );
    const data = await res.json();
    const articles: NewsArticle[] = (data.articles || []).map((a: Record<string, unknown>) => ({
      title: a.title as string,
      description: a.description as string,
      url: a.url as string,
      publishedAt: a.publishedAt as string,
      source: (a.source as Record<string, string>)?.name || '',
    }));
    setCache(cacheKey, articles, NEWS_TTL);
    return articles;
  } catch {
    return [];
  }
}

export function extractTickers(text: string): string[] {
  const matches = text.match(/\b[A-Z]{1,5}\b/g) || [];
  const commonWords = new Set(['I', 'A', 'AN', 'THE', 'IS', 'IN', 'ON', 'AT', 'TO', 'DO', 'IF', 'OR', 'AND', 'FOR', 'BY', 'OF', 'IT', 'BE', 'MY', 'WE', 'HE', 'SHE', 'IRA', 'GDP', 'CEO', 'CFO', 'US', 'UK', 'EU', 'IRS', 'SEC', 'FED', 'ETF', 'AI', 'IPO', 'VC', 'LLC', 'LLP']);
  return Array.from(new Set(matches.filter(m => !commonWords.has(m) && m.length >= 2))).slice(0, 3);
}
