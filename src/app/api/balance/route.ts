import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';

// Decrypt helper
function decrypt(text: string): string {
  try {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'default-secret-key', 'salt', 32);
    const parts = text.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch {
    return text;
  }
}

interface Balance {
  asset: string;
  free: number;
  locked: number;
  total: number;
  usdValue: number;
}

export async function GET() {
  try {
    // Get API config
    const config = await db.apiConfig.findFirst({
      where: { name: 'binance', isActive: true }
    });

    if (!config || !config.apiKey || !config.apiSecret) {
      return NextResponse.json({
        success: false,
        error: 'No API credentials configured. Please add your Binance API keys in Settings.',
        balances: [],
        totalUSD: 0,
        isReal: false,
      });
    }

    const apiKey = decrypt(config.apiKey);
    const apiSecret = decrypt(config.apiSecret);
    const baseUrl = config.testnet 
      ? 'https://testnet.binance.vision/api' 
      : 'https://api.binance.com';

    // Get account info
    const timestamp = Date.now();
    const queryString = `timestamp=${timestamp}`;
    const signature = crypto
      .createHmac('sha256', apiSecret)
      .update(queryString)
      .digest('hex');

    const response = await fetch(`${baseUrl}/v3/account?${queryString}&signature=${signature}`, {
      headers: { 'X-MBX-APIKEY': apiKey },
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json({
        success: false,
        error: error.msg || 'Failed to fetch balance',
        balances: [],
        totalUSD: 0,
        isReal: !config.testnet,
      });
    }

    const account = await response.json();

    // Get current prices for USD conversion
    const pricesResponse = await fetch('https://api.binance.com/api/v3/ticker/price');
    const prices = await pricesResponse.json();
    const priceMap = new Map(prices.map((p: any) => [p.symbol, parseFloat(p.price)]));

    // Process balances
    const balances: Balance[] = account.balances
      .filter((b: any) => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0)
      .map((b: any) => {
        const free = parseFloat(b.free);
        const locked = parseFloat(b.locked);
        const total = free + locked;
        
        // Get USD value
        let usdValue = 0;
        if (b.asset === 'USDT' || b.asset === 'USD') {
          usdValue = total;
        } else if (b.asset === 'BTC') {
          usdValue = total * (priceMap.get('BTCUSDT') || 0);
        } else if (b.asset === 'ETH') {
          usdValue = total * (priceMap.get('ETHUSDT') || 0);
        } else if (b.asset === 'BNB') {
          usdValue = total * (priceMap.get('BNBUSDT') || 0);
        } else {
          const pair = `${b.asset}USDT`;
          const price = priceMap.get(pair);
          if (price) {
            usdValue = total * price;
          } else {
            // Try BTC pair
            const btcPair = `${b.asset}BTC`;
            const btcPrice = priceMap.get(btcPair);
            if (btcPrice) {
              usdValue = total * btcPrice * (priceMap.get('BTCUSDT') || 0);
            }
          }
        }

        return {
          asset: b.asset,
          free,
          locked,
          total,
          usdValue,
        };
      })
      .sort((a: Balance, b: Balance) => b.usdValue - a.usdValue);

    const totalUSD = balances.reduce((sum, b) => sum + b.usdValue, 0);

    return NextResponse.json({
      success: true,
      balances,
      totalUSD,
      isReal: !config.testnet,
      testnet: config.testnet,
      canTrade: true,
    });
  } catch (error) {
    console.error('Error fetching balance:', error);
    return NextResponse.json({
      success: false,
      error: 'Error fetching balance',
      balances: [],
      totalUSD: 0,
      isReal: false,
    });
  }
}

export const dynamic = 'force-dynamic';
