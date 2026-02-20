import { NextRequest, NextResponse } from 'next/server';

const BINANCE_API = 'https://api.binance.com/api/v3';
const COINGECKO_API = 'https://api.coingecko.com/api/v3';

// CoinGecko ID mapping
const COINGECKO_IDS: Record<string, string> = {
  'BTCUSDT': 'bitcoin',
  'ETHUSDT': 'ethereum',
  'BNBUSDT': 'binancecoin',
  'XRPUSDT': 'ripple',
  'ADAUSDT': 'cardano',
  'DOGEUSDT': 'dogecoin',
  'SOLUSDT': 'solana',
  'DOTUSDT': 'polkadot',
  'MATICUSDT': 'matic-network',
  'LTCUSDT': 'litecoin',
  'SHIBUSDT': 'shiba-inu',
  'TRXUSDT': 'tron',
  'AVAXUSDT': 'avalanche-2',
  'LINKUSDT': 'chainlink',
  'ATOMUSDT': 'cosmos',
  'UNIUSDT': 'uniswap',
  'ETCUSDT': 'ethereum-classic',
  'XMRUSDT': 'monero',
  'BCHUSDT': 'bitcoin-cash',
  'XLMUSDT': 'stellar',
  'NEARUSDT': 'near',
  'ALGOUSDT': 'algorand',
  'VETUSDT': 'vechain',
  'FILUSDT': 'filecoin',
  'ICPUSDT': 'internet-computer',
  'APEUSDT': 'apecoin',
  'SANDUSDT': 'the-sandbox',
  'MANAUSDT': 'decentraland',
  'AXSUSDT': 'axie-infinity',
  'THETAUSDT': 'theta-network',
  'FTMUSDT': 'fantom',
  'GRTUSDT': 'the-graph',
  'ENJUSDT': 'enjincoin',
  'CHZUSDT': 'chiliz',
  'COMPUSDT': 'compound-governance-token',
  'SUSHIUSDT': 'sushi',
  'YFIUSDT': 'yearn-finance',
  'SNXUSDT': 'havven',
  'AAVEUSDT': 'aave',
  'MKRUSDT': 'maker',
  'CAKEUSDT': 'pancakeswap-token',
  'CRVUSDT': 'curve-dao-token',
  '1INCHUSDT': '1inch',
  'KAVAUSDT': 'kava',
  'RUNEUSDT': 'thorchain',
  'ZILUSDT': 'zilliqa',
  'EOSUSDT': 'eos',
  'XTZUSDT': 'tezos',
  'FLOWUSDT': 'flow',
  'EGLDUSDT': 'elrond-erd-2',
};

// Valid intervals
const VALID_INTERVALS = ['1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d', '3d', '1w', '1M'];

// Map intervals to days for CoinGecko
const INTERVAL_TO_DAYS: Record<string, number> = {
  '1m': 1,
  '5m': 1,
  '15m': 1,
  '1h': 7,
  '4h': 30,
  '1d': 90,
};

interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol') || 'BTCUSDT';
    const interval = searchParams.get('interval') || '1h';
    const limit = parseInt(searchParams.get('limit') || '200');

    if (!VALID_INTERVALS.includes(interval)) {
      return NextResponse.json(
        { error: 'Invalid interval. Valid intervals: ' + VALID_INTERVALS.join(', ') },
        { status: 400 }
      );
    }

    // Try Binance first
    try {
      const candles = await fetchFromBinance(symbol, interval, limit);
      if (candles.length > 0) {
        return buildResponse(candles, symbol, interval, 'binance');
      }
    } catch (error) {
      console.error('Binance candles failed, trying CoinGecko:', error);
    }

    // Fallback to CoinGecko
    try {
      const candles = await fetchFromCoinGecko(symbol, interval);
      if (candles.length > 0) {
        return buildResponse(candles, symbol, interval, 'coingecko');
      }
    } catch (error) {
      console.error('CoinGecko candles also failed:', error);
    }

    return NextResponse.json({ 
      error: 'Unable to fetch candlestick data from any source' 
    }, { status: 500 });
  } catch (error) {
    console.error('Error fetching candles:', error);
    return NextResponse.json({ error: 'Error fetching candlestick data' }, { status: 500 });
  }
}

async function fetchFromBinance(symbol: string, interval: string, limit: number): Promise<Candle[]> {
  const response = await fetch(
    `${BINANCE_API}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`,
    {
      headers: { 'Accept': 'application/json' },
    }
  );

  if (!response.ok) {
    throw new Error(`Binance API error: ${response.status}`);
  }

  const data = await response.json();

  return data.map((k: any[]) => ({
    time: Math.floor(k[0] / 1000),
    open: parseFloat(k[1]),
    high: parseFloat(k[2]),
    low: parseFloat(k[3]),
    close: parseFloat(k[4]),
    volume: parseFloat(k[5]),
  }));
}

async function fetchFromCoinGecko(symbol: string, interval: string): Promise<Candle[]> {
  const coinId = COINGECKO_IDS[symbol];
  if (!coinId) {
    throw new Error(`Unknown symbol: ${symbol}`);
  }

  const days = INTERVAL_TO_DAYS[interval] || 7;
  
  const response = await fetch(
    `${COINGECKO_API}/coins/${coinId}/ohlc?vs_currency=usd&days=${days}`,
    {
      headers: { 'Accept': 'application/json' },
    }
  );

  if (!response.ok) {
    throw new Error(`CoinGecko API error: ${response.status}`);
  }

  const data = await response.json();

  // CoinGecko returns: [timestamp, open, high, low, close]
  return data.map((k: number[]) => ({
    time: Math.floor(k[0] / 1000),
    open: k[1],
    high: k[2],
    low: k[3],
    close: k[4],
    volume: 0, // CoinGecko OHLC doesn't include volume
  }));
}

function buildResponse(candles: Candle[], symbol: string, interval: string, source: string) {
  const closes = candles.map(c => c.close);
  const lastCandle = candles[candles.length - 1];
  const previousCandle = candles[candles.length - 2];
  
  const sma20 = calculateSMA(closes, 20);
  const sma50 = calculateSMA(closes, 50);
  const rsi = calculateRSI(closes, 14);
  const macd = calculateMACD(closes);

  const sma20Series = candles.slice(19).map((c, i) => ({
    time: c.time,
    value: sma20[i]
  }));

  const sma50Series = candles.slice(49).map((c, i) => ({
    time: c.time,
    value: sma50[i]
  }));

  const rsiSeries = candles.slice(14).map((c, i) => ({
    time: c.time,
    value: rsi[i]
  }));

  const macdSeries = macd.map((m, i) => ({
    time: candles[candles.length - macd.length + i].time,
    macd: m.macd,
    signal: m.signal,
    histogram: m.histogram,
  }));

  return NextResponse.json({
    success: true,
    symbol,
    interval,
    candles,
    indicators: {
      sma20: sma20Series,
      sma50: sma50Series,
      rsi: rsiSeries,
      macd: macdSeries,
      currentRSI: rsi.length > 0 ? rsi[rsi.length - 1] : null,
      currentMACD: macd.length > 0 ? macd[macd.length - 1] : null,
      currentSMA20: sma20.length > 0 ? sma20[sma20.length - 1] : null,
      currentSMA50: sma50.length > 0 ? sma50[sma50.length - 1] : null,
    },
    stats: {
      currentPrice: lastCandle?.close || 0,
      previousClose: previousCandle?.close || 0,
      changePercent: lastCandle && previousCandle ? 
        ((lastCandle.close - previousCandle.close) / previousCandle.close * 100) : 0,
      high24h: Math.max(...candles.slice(-24).map(c => c.high)),
      low24h: Math.min(...candles.slice(-24).map(c => c.low)),
      avgVolume: candles.slice(-24).reduce((a, c) => a + c.volume, 0) / Math.min(24, candles.length),
    },
    source,
    timestamp: new Date().toISOString(),
  });
}

function calculateSMA(data: number[], period: number): number[] {
  const sma: number[] = [];
  for (let i = period - 1; i < data.length; i++) {
    const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
    sma.push(sum / period);
  }
  return sma;
}

function calculateEMA(data: number[], period: number): number[] {
  const ema: number[] = [];
  const multiplier = 2 / (period + 1);
  
  let sum = 0;
  for (let i = 0; i < period && i < data.length; i++) {
    sum += data[i];
  }
  ema.push(sum / Math.min(period, data.length));
  
  for (let i = period; i < data.length; i++) {
    const value = (data[i] - ema[ema.length - 1]) * multiplier + ema[ema.length - 1];
    ema.push(value);
  }
  
  return ema;
}

function calculateRSI(data: number[], period: number = 14): number[] {
  const rsi: number[] = [];
  const gains: number[] = [];
  const losses: number[] = [];

  for (let i = 1; i < data.length; i++) {
    const change = data[i] - data[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }

  for (let i = period; i <= gains.length; i++) {
    const avgGain = gains.slice(i - period, i).reduce((a, b) => a + b, 0) / period;
    const avgLoss = losses.slice(i - period, i).reduce((a, b) => a + b, 0) / period;
    
    if (avgLoss === 0) {
      rsi.push(100);
    } else {
      const rs = avgGain / avgLoss;
      rsi.push(100 - (100 / (1 + rs)));
    }
  }

  return rsi;
}

function calculateMACD(data: number[], fastPeriod: number = 12, slowPeriod: number = 26, signalPeriod: number = 9): { macd: number; signal: number; histogram: number }[] {
  const emaFast = calculateEMA(data, fastPeriod);
  const emaSlow = calculateEMA(data, slowPeriod);
  
  const macdLine: number[] = [];
  const startIdx = slowPeriod - fastPeriod;
  
  for (let i = 0; i < emaSlow.length; i++) {
    macdLine.push(emaFast[i + startIdx] - emaSlow[i]);
  }
  
  const signalLine = calculateEMA(macdLine, signalPeriod);
  
  const result: { macd: number; signal: number; histogram: number }[] = [];
  const signalStart = macdLine.length - signalLine.length;
  
  for (let i = 0; i < signalLine.length; i++) {
    result.push({
      macd: macdLine[i + signalStart],
      signal: signalLine[i],
      histogram: macdLine[i + signalStart] - signalLine[i],
    });
  }
  
  return result;
}

export const dynamic = 'force-dynamic';
