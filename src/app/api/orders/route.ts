import { NextRequest, NextResponse } from 'next/server';
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

// GET - Get open orders
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');

    const config = await db.apiConfig.findFirst({
      where: { name: 'binance', isActive: true }
    });

    if (!config) {
      return NextResponse.json({ 
        success: false, 
        error: 'No API credentials',
        orders: [] 
      });
    }

    const apiKey = decrypt(config.apiKey);
    const apiSecret = decrypt(config.apiSecret);
    const baseUrl = config.testnet 
      ? 'https://testnet.binance.vision/api' 
      : 'https://api.binance.com';

    const timestamp = Date.now();
    let queryString = `timestamp=${timestamp}`;
    if (symbol) queryString += `&symbol=${symbol}`;

    const signature = crypto
      .createHmac('sha256', apiSecret)
      .update(queryString)
      .digest('hex');

    const response = await fetch(`${baseUrl}/v3/openOrders?${queryString}&signature=${signature}`, {
      headers: { 'X-MBX-APIKEY': apiKey },
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json({ 
        success: false, 
        error: error.msg,
        orders: [] 
      });
    }

    const orders = await response.json();

    return NextResponse.json({
      success: true,
      orders: orders.map((o: any) => ({
        orderId: o.orderId,
        symbol: o.symbol,
        type: o.type,
        side: o.side,
        price: parseFloat(o.price),
        origQty: parseFloat(o.origQty),
        executedQty: parseFloat(o.executedQty),
        status: o.status,
        time: o.time,
        stopPrice: o.stopPrice ? parseFloat(o.stopPrice) : null,
      })),
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error fetching orders',
      orders: [] 
    });
  }
}

// POST - Create order
export async function POST(request: NextRequest) {
  try {
    const { symbol, side, type, quantity, price, stopPrice } = await request.json();

    if (!symbol || !side || !type || !quantity) {
      return NextResponse.json({ 
        error: 'Missing required fields: symbol, side, type, quantity' 
      }, { status: 400 });
    }

    const config = await db.apiConfig.findFirst({
      where: { name: 'binance', isActive: true }
    });

    if (!config) {
      return NextResponse.json({ error: 'No API credentials configured' }, { status: 400 });
    }

    const apiKey = decrypt(config.apiKey);
    const apiSecret = decrypt(config.apiSecret);
    const baseUrl = config.testnet 
      ? 'https://testnet.binance.vision/api' 
      : 'https://api.binance.com';

    const timestamp = Date.now();
    let queryString = `symbol=${symbol}&side=${side}&type=${type}&quantity=${quantity}&timestamp=${timestamp}`;

    if (type === 'LIMIT' && price) {
      queryString += `&price=${price}&timeInForce=GTC`;
    }
    if ((type === 'STOP_LOSS_LIMIT' || type === 'TAKE_PROFIT_LIMIT') && stopPrice) {
      queryString += `&stopPrice=${stopPrice}&price=${price}&timeInForce=GTC`;
    }
    if (type === 'STOP_LOSS' && stopPrice) {
      queryString += `&stopPrice=${stopPrice}`;
    }

    const signature = crypto
      .createHmac('sha256', apiSecret)
      .update(queryString)
      .digest('hex');

    const response = await fetch(`${baseUrl}/v3/order?${queryString}&signature=${signature}`, {
      method: 'POST',
      headers: { 'X-MBX-APIKEY': apiKey },
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json({ 
        error: result.msg || 'Failed to create order' 
      }, { status: 400 });
    }

    // Save to local database
    await db.transaction.create({
      data: {
        symbol,
        type: side,
        amount: quantity,
        price: price || 0,
        total: (price || 0) * quantity,
        isPaper: false,
        orderId: result.orderId.toString(),
        status: 'pending',
      }
    });

    return NextResponse.json({
      success: true,
      order: {
        orderId: result.orderId,
        symbol: result.symbol,
        status: result.status,
      },
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Error creating order' }, { status: 500 });
  }
}

// DELETE - Cancel order
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const orderId = searchParams.get('orderId');

    if (!symbol || !orderId) {
      return NextResponse.json({ error: 'symbol and orderId required' }, { status: 400 });
    }

    const config = await db.apiConfig.findFirst({
      where: { name: 'binance', isActive: true }
    });

    if (!config) {
      return NextResponse.json({ error: 'No API credentials' }, { status: 400 });
    }

    const apiKey = decrypt(config.apiKey);
    const apiSecret = decrypt(config.apiSecret);
    const baseUrl = config.testnet 
      ? 'https://testnet.binance.vision/api' 
      : 'https://api.binance.com';

    const timestamp = Date.now();
    const queryString = `symbol=${symbol}&orderId=${orderId}&timestamp=${timestamp}`;
    const signature = crypto
      .createHmac('sha256', apiSecret)
      .update(queryString)
      .digest('hex');

    const response = await fetch(`${baseUrl}/v3/order?${queryString}&signature=${signature}`, {
      method: 'DELETE',
      headers: { 'X-MBX-APIKEY': apiKey },
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: result.msg || 'Failed to cancel' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      status: result.status,
    });
  } catch (error) {
    console.error('Error canceling order:', error);
    return NextResponse.json({ error: 'Error canceling order' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
