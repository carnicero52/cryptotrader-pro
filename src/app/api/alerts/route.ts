import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Get all alerts
export async function GET() {
  try {
    const alerts = await db.priceAlert.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      alerts: alerts.map(a => ({
        id: a.id,
        symbol: a.symbol,
        targetPrice: a.targetPrice,
        condition: a.condition,
        message: a.message,
        triggered: a.triggered,
        createdAt: a.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json({ success: false, alerts: [] });
  }
}

// POST - Create alert
export async function POST(request: NextRequest) {
  try {
    const { symbol, targetPrice, condition, message } = await request.json();

    if (!symbol || !targetPrice || !condition) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const alert = await db.priceAlert.create({
      data: {
        symbol,
        targetPrice: parseFloat(targetPrice),
        condition, // 'above' or 'below'
        message: message || `${symbol} ${condition} $${targetPrice}`,
        isActive: true,
      }
    });

    return NextResponse.json({
      success: true,
      alert: {
        id: alert.id,
        symbol: alert.symbol,
        targetPrice: alert.targetPrice,
        condition: alert.condition,
        message: alert.message,
      },
    });
  } catch (error) {
    console.error('Error creating alert:', error);
    return NextResponse.json({ error: 'Error creating alert' }, { status: 500 });
  }
}

// DELETE - Remove alert
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Alert ID required' }, { status: 400 });
    }

    await db.priceAlert.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting alert:', error);
    return NextResponse.json({ error: 'Error deleting alert' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
