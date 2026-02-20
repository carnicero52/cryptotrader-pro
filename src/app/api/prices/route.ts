import { NextResponse } from 'next/server';

// Binance public API
const BINANCE_API = 'https://api.binance.com/api/v3';

// Extended list of cryptocurrencies (50+)
const CRYPTO_SYMBOLS = [
  // Top 20 by market cap
  'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'XRPUSDT', 'ADAUSDT',
  'DOGEUSDT', 'SOLUSDT', 'DOTUSDT', 'MATICUSDT', 'LTCUSDT',
  'SHIBUSDT', 'TRXUSDT', 'AVAXUSDT', 'LINKUSDT', 'ATOMUSDT',
  'UNIUSDT', 'ETCUSDT', 'XMRUSDT', 'BCHUSDT', 'XLMUSDT',
  // Popular altcoins
  'NEARUSDT', 'ALGOUSDT', 'VETUSDT', 'FILUSDT', 'ICPUSDT',
  'APEUSDT', 'SANDUSDT', 'MANAUSDT', 'AXSUSDT', 'THETAUSDT',
  'FTMUSDT', 'GRTUSDT', 'ENJUSDT', 'CHZUSDT', 'COMPUSDT',
  'SUSHIUSDT', 'YFIUSDT', 'SNXUSDT', 'AAVEUSDT', 'MKRUSDT',
  'CAKEUSDT', 'CRVUSDT', '1INCHUSDT', 'KAVAUSDT', 'RUNEUSDT',
  'ZILUSDT', 'EOSUSDT', 'XTZUSDT', 'FLOWUSDT', 'EGLDUSDT',
];

// Forex pairs (using Binance futures for reference - some available)
const FOREX_SYMBOLS = [
  'BTCUSD', // Bitcoin to USD
  // Note: Binance doesn't have traditional forex, but we can show crypto pairs
];

interface CryptoData {
  symbol: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume: number;
  quoteVolume: number;
  type: 'crypto' | 'forex';
}

export async function GET() {
  try {
    const response = await fetch(`${BINANCE_API}/ticker/24hr`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch from Binance');
    }
    
    const allData = await response.json();
    
    // Filter and map crypto symbols
    const cryptoPrices: CryptoData[] = CRYPTO_SYMBOLS.map(symbol => {
      const data = allData.find((d: any) => d.symbol === symbol);
      if (!data) return null;
      
      return {
        symbol: data.symbol,
        price: parseFloat(data.lastPrice),
        change24h: parseFloat(data.priceChangePercent),
        high24h: parseFloat(data.highPrice),
        low24h: parseFloat(data.lowPrice),
        volume: parseFloat(data.volume),
        quoteVolume: parseFloat(data.quoteVolume),
        type: 'crypto' as const,
      };
    }).filter((p): p is CryptoData => p !== null);

    // Sort by quote volume (24h trading volume in USDT)
    cryptoPrices.sort((a, b) => b.quoteVolume - a.quoteVolume);

    return NextResponse.json({
      success: true,
      prices: cryptoPrices,
      forex: [], // Traditional forex not available on Binance
      timestamp: new Date().toISOString(),
      total: cryptoPrices.length,
    });
  } catch (error) {
    console.error('Error fetching prices:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error fetching prices from Binance',
        prices: [],
        forex: [],
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
