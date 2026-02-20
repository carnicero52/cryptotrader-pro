import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getTursoClient } from '@/lib/db';

// Encrypt API key for storage
function encrypt(text: string): string {
  const algorithm = 'aes-256-cbc';
  const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'default-secret-key', 'salt', 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

// Decrypt API key from storage
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
    return text; // Return as-is if decryption fails
  }
}

// GET - Get API configuration
export async function GET() {
  try {
    const turso = getTursoClient();
    if (!turso) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const result = await turso.execute({
      sql: `SELECT apiKey, apiSecret, isActive, testnet FROM ApiConfig WHERE name = ?`,
      args: ['binance']
    });

    const config = result.rows[0];

    return NextResponse.json({
      hasApiKey: !!config?.apiKey,
      hasApiSecret: !!config?.apiSecret,
      isActive: config?.isActive === 1,
      testnet: config?.testnet === 1 ?? true,
    });
  } catch (error) {
    console.error('Error getting config:', error);
    return NextResponse.json({ error: 'Error getting configuration' }, { status: 500 });
  }
}

// POST - Save API configuration
export async function POST(request: NextRequest) {
  try {
    const { apiKey, apiSecret, testnet = true } = await request.json();

    if (!apiKey || !apiSecret) {
      return NextResponse.json({ error: 'API Key and Secret are required' }, { status: 400 });
    }

    // Test the credentials first
    const testResult = await testBinanceCredentials(apiKey, apiSecret, testnet);
    
    if (!testResult.success) {
      return NextResponse.json({ 
        error: 'Invalid API credentials', 
        details: testResult.error 
      }, { status: 400 });
    }

    const turso = getTursoClient();
    if (!turso) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    // Encrypt and save
    const encryptedKey = encrypt(apiKey);
    const encryptedSecret = encrypt(apiSecret);
    const id = crypto.randomUUID();

    // Delete existing config first
    await turso.execute({
      sql: `DELETE FROM ApiConfig WHERE name = ?`,
      args: ['binance']
    });

    // Insert new config
    await turso.execute({
      sql: `INSERT INTO ApiConfig (id, name, apiKey, apiSecret, isActive, testnet) VALUES (?, ?, ?, ?, ?, ?)`,
      args: [id, 'binance', encryptedKey, encryptedSecret, 1, testnet ? 1 : 0]
    });

    return NextResponse.json({ 
      success: true, 
      message: 'API credentials saved successfully',
      testnet 
    });
  } catch (error) {
    console.error('Error saving config:', error);
    return NextResponse.json({ error: 'Error saving configuration' }, { status: 500 });
  }
}

// DELETE - Remove API configuration
export async function DELETE() {
  try {
    const turso = getTursoClient();
    if (!turso) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    await turso.execute({
      sql: `DELETE FROM ApiConfig WHERE name = ?`,
      args: ['binance']
    });

    return NextResponse.json({ success: true, message: 'API credentials removed' });
  } catch (error) {
    console.error('Error deleting config:', error);
    return NextResponse.json({ error: 'Error removing configuration' }, { status: 500 });
  }
}

// Test Binance API credentials
async function testBinanceCredentials(apiKey: string, apiSecret: string, testnet: boolean) {
  try {
    const baseUrl = testnet 
      ? 'https://testnet.binance.vision/api' 
      : 'https://api.binance.com';

    const timestamp = Date.now();
    const queryString = `timestamp=${timestamp}`;
    const signature = crypto
      .createHmac('sha256', apiSecret)
      .update(queryString)
      .digest('hex');

    const response = await fetch(`${baseUrl}/v3/account?${queryString}&signature=${signature}`, {
      headers: {
        'X-MBX-APIKEY': apiKey,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.msg || 'Invalid credentials' };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Connection failed' };
  }
}

export const dynamic = 'force-dynamic';
