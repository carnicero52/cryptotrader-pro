import { NextResponse } from 'next/server';

// Binance public API
const BINANCE_API = 'https://api.binance.com/api/v3';

// CoinGecko API as fallback
const COINGECKO_API = 'https://api.coingecko.com/api/v3';

// Mapping of symbols to CoinGecko IDs
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

// Extended list of cryptocurrencies (50+)
const CRYPTO_SYMBOLS = Object.keys(COINGECKO_IDS);

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

// Fetch from Binance
async function fetchFromBinance(): Promise<CryptoData[]> {
  const response = await fetch(`${BINANCE_API}/ticker/24hr`, {
    headers: {
      'Accept': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Binance API error: ${response.status}`);
  }
  
  const allData = await response.json();
  
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

  cryptoPrices.sort((a, b) => b.quoteVolume - a.quoteVolume);
  return cryptoPrices;
}

// Fetch from CoinGecko as fallback
async function fetchFromCoinGecko(): Promise<CryptoData[]> {
  const ids = Object.values(COINGECKO_IDS).join(',');
  
  const response = await fetch(
    `${COINGECKO_API}/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&sparkline=false&price_change_percentage=24h`,
    {
      headers: {
        'Accept': 'application/json',
      },
    }
  );
  
  if (!response.ok) {
    throw new Error(`CoinGecko API error: ${response.status}`);
  }
  
  const data = await response.json();
  
  // Create reverse mapping
  const idToSymbol: Record<string, string> = {};
  Object.entries(COINGECKO_IDS).forEach(([symbol, id]) => {
    idToSymbol[id] = symbol;
  });
  
  const cryptoPrices: CryptoData[] = data.map((coin: any) => {
    const symbol = idToSymbol[coin.id];
    if (!symbol) return null;
    
    return {
      symbol: symbol,
      price: coin.current_price,
      change24h: coin.price_change_percentage_24h || 0,
      high24h: coin.high_24h || coin.current_price,
      low24h: coin.low_24h || coin.current_price,
      volume: coin.total_volume || 0,
      quoteVolume: coin.market_cap || 0,
      type: 'crypto' as const,
    };
  }).filter((p): p is CryptoData => p !== null);

  cryptoPrices.sort((a, b) => b.quoteVolume - a.quoteVolume);
  return cryptoPrices;
}

export async function GET() {
  // Try Binance first
  try {
    const prices = await fetchFromBinance();
    if (prices.length > 0) {
      return NextResponse.json({
        success: true,
        prices,
        forex: [],
        timestamp: new Date().toISOString(),
        total: prices.length,
        source: 'binance',
      });
    }
  } catch (error) {
    console.error('Binance fetch failed, trying CoinGecko:', error);
  }
  
  // Fallback to CoinGecko
  try {
    const prices = await fetchFromCoinGecko();
    return NextResponse.json({
      success: true,
      prices,
      forex: [],
      timestamp: new Date().toISOString(),
      total: prices.length,
      source: 'coingecko',
    });
  } catch (error) {
    console.error('CoinGecko fetch also failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Unable to fetch prices from any source',
        prices: [],
        forex: [],
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
