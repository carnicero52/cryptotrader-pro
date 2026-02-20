'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  Wallet, 
  LineChart,
  History,
  Settings,
  Play,
  Pause,
  DollarSign,
  Bitcoin,
  Coins,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Bell,
  BellRing,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Search,
  Star,
  StarOff,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Activity,
  Target,
  Zap,
  Shield,
  Key
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Types
interface CryptoPrice {
  symbol: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume: number;
  quoteVolume: number;
  type: string;
}

interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface Position {
  id: string;
  symbol: string;
  type: string;
  amount: number;
  price: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  timestamp: Date;
}

interface Transaction {
  id: string;
  symbol: string;
  type: string;
  amount: number;
  price: number;
  total: number;
  timestamp: Date;
}

interface Alert {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: string;
  message: string;
  triggered: boolean;
}

interface Balance {
  asset: string;
  free: number;
  locked: number;
  total: number;
  usdValue: number;
}

export default function TradingDashboard() {
  const { toast } = useToast();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  
  // State
  const [prices, setPrices] = useState<CryptoPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Paper Trading
  const [paperBalance, setPaperBalance] = useState(10000);
  const [positions, setPositions] = useState<Position[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // Real Trading
  const [realBalances, setRealBalances] = useState<Balance[]>([]);
  const [totalUSD, setTotalUSD] = useState(0);
  const [isRealMode, setIsRealMode] = useState(false);
  const [hasApiKeys, setHasApiKeys] = useState(false);
  
  // Trading
  const [selectedCrypto, setSelectedCrypto] = useState('BTCUSDT');
  const [tradeAmount, setTradeAmount] = useState('');
  const [tradePrice, setTradePrice] = useState('');
  const [orderType, setOrderType] = useState('MARKET');
  const [stopPrice, setStopPrice] = useState('');
  
  // Charts
  const [candles, setCandles] = useState<Candle[]>([]);
  const [interval, setInterval] = useState('1h');
  const [indicators, setIndicators] = useState<any>({});
  const [chartLoading, setChartLoading] = useState(false);
  
  // Alerts
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [alertSymbol, setAlertSymbol] = useState('BTCUSDT');
  const [alertPrice, setAlertPrice] = useState('');
  const [alertCondition, setAlertCondition] = useState('above');
  
  // Config
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [testnet, setTestnet] = useState(true);
  const [showSecret, setShowSecret] = useState(false);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  
  // UI
  const [searchQuery, setSearchQuery] = useState('');
  const [watchlist, setWatchlist] = useState<string[]>(['BTCUSDT', 'ETHUSDT', 'SOLUSDT']);
  const [showWatchlistOnly, setShowWatchlistOnly] = useState(false);
  
  // WebSocket connection
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Process WebSocket ticker data
  const processTickerData = useCallback((ticker: any) => {
    return {
      symbol: ticker.s,
      price: parseFloat(ticker.c),
      change24h: parseFloat(ticker.P),
      high24h: parseFloat(ticker.h),
      low24h: parseFloat(ticker.l),
      volume: parseFloat(ticker.v),
      quoteVolume: parseFloat(ticker.q),
      type: 'crypto' as const,
    };
  }, []);

  // Fetch prices (fallback)
  const fetchPrices = useCallback(async () => {
    try {
      const response = await fetch('/api/prices');
      const data = await response.json();
      if (data.prices) {
        setPrices(data.prices);
      }
    } catch (error) {
      console.error('Error fetching prices:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Fetch candles for chart
  const fetchCandles = useCallback(async () => {
    if (!selectedCrypto) return;
    setChartLoading(true);
    try {
      const response = await fetch(`/api/candles?symbol=${selectedCrypto}&interval=${interval}&limit=200`);
      const data = await response.json();
      if (data.candles) {
        setCandles(data.candles);
        setIndicators(data.indicators || {});
      }
    } catch (error) {
      console.error('Error fetching candles:', error);
    } finally {
      setChartLoading(false);
    }
  }, [selectedCrypto, interval]);

  // Fetch real balance
  const fetchRealBalance = useCallback(async () => {
    try {
      const response = await fetch('/api/balance');
      const data = await response.json();
      if (data.success) {
        setRealBalances(data.balances);
        setTotalUSD(data.totalUSD);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  }, []);

  // Check API config
  const checkApiConfig = useCallback(async () => {
    try {
      const response = await fetch('/api/config');
      const data = await response.json();
      setHasApiKeys(data.hasApiKey && data.hasApiSecret);
    } catch (error) {
      console.error('Error checking config:', error);
    }
  }, []);

  // Fetch alerts
  const fetchAlerts = useCallback(async () => {
    try {
      const response = await fetch('/api/alerts');
      const data = await response.json();
      if (data.alerts) {
        setAlerts(data.alerts);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  }, []);

  // Update candles when selected crypto or interval changes
  useEffect(() => {
    fetchCandles();
  }, [fetchCandles]);

  // Load paper trading from localStorage
  useEffect(() => {
    const savedBalance = localStorage.getItem('paperBalance');
    const savedPositions = localStorage.getItem('paperPositions');
    const savedTransactions = localStorage.getItem('paperTransactions');
    const savedWatchlist = localStorage.getItem('watchlist');
    
    if (savedBalance) setPaperBalance(parseFloat(savedBalance));
    if (savedPositions) setPositions(JSON.parse(savedPositions));
    if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
    if (savedWatchlist) setWatchlist(JSON.parse(savedWatchlist));
  }, []);

  // Save paper trading to localStorage
  useEffect(() => {
    localStorage.setItem('paperBalance', paperBalance.toString());
    localStorage.setItem('paperPositions', JSON.stringify(positions));
    localStorage.setItem('paperTransactions', JSON.stringify(transactions));
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
  }, [paperBalance, positions, transactions, watchlist]);

  // Check alerts on price update
  useEffect(() => {
    alerts.forEach(alert => {
      if (alert.triggered) return;
      const crypto = prices.find(p => p.symbol === alert.symbol);
      if (!crypto) return;
      
      const triggered = 
        (alert.condition === 'above' && crypto.price >= alert.targetPrice) ||
        (alert.condition === 'below' && crypto.price <= alert.targetPrice);
      
      if (triggered) {
        toast({
          title: '🔔 Alerta activada!',
          description: alert.message,
        });
      }
    });
  }, [prices, alerts, toast]);

  // WebSocket connection for real-time prices
  useEffect(() => {
    // Initial fetch para cargar datos inmediatamente
    fetchPrices();
    checkApiConfig();
    fetchAlerts();
    
    // Conectar a Binance WebSocket
    const connectWebSocket = () => {
      try {
        // Stream de todos los tickers en tiempo real
        const ws = new WebSocket('wss://stream.binance.com:9443/ws/!ticker@arr');
        wsRef.current = ws;
        
        ws.onopen = () => {
          console.log('✅ WebSocket conectado a Binance');
          setIsConnected(true);
          setLoading(false);
        };
        
        ws.onmessage = (event) => {
          try {
            const tickers = JSON.parse(event.data);
            // Filtrar solo pares USDT y actualizar precios
            const usdtTickers = tickers
              .filter((t: any) => t.s.endsWith('USDT'))
              .map(processTickerData)
              .filter((t: any) => t.quoteVolume > 0)
              .sort((a: any, b: any) => b.quoteVolume - a.quoteVolume);
            
            if (usdtTickers.length > 0) {
              setPrices(usdtTickers);
            }
          } catch (error) {
            console.error('Error procesando datos WebSocket:', error);
          }
        };
        
        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setIsConnected(false);
        };
        
        ws.onclose = () => {
          console.log('WebSocket desconectado, reconectando en 5s...');
          setIsConnected(false);
          // Reconectar después de 5 segundos
          setTimeout(connectWebSocket, 5000);
        };
      } catch (error) {
        console.error('Error conectando WebSocket:', error);
        // Fallback a polling si WebSocket falla
        setTimeout(connectWebSocket, 5000);
      }
    };
    
    connectWebSocket();
    
    // Cleanup al desmontar
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [fetchPrices, checkApiConfig, fetchAlerts, processTickerData]);

  // Calculate portfolio value
  const portfolioValue = positions.reduce((acc, pos) => acc + (pos.amount * pos.currentPrice), paperBalance);
  const totalPnL = positions.reduce((acc, pos) => acc + pos.pnl, 0);
  const totalPnLPercent = ((portfolioValue - 10000) / 10000) * 100;

  // Paper trade execution
  const executePaperTrade = (side: 'BUY' | 'SELL') => {
    const crypto = prices.find(p => p.symbol === selectedCrypto);
    if (!crypto) return;

    const amount = parseFloat(tradeAmount);
    if (!amount || amount <= 0) {
      toast({ title: 'Error', description: 'Ingresa una cantidad válida', variant: 'destructive' });
      return;
    }

    const price = orderType === 'MARKET' ? crypto.price : parseFloat(tradePrice) || crypto.price;
    const total = amount * price;

    if (side === 'BUY') {
      if (total > paperBalance) {
        toast({ title: 'Error', description: 'Saldo insuficiente', variant: 'destructive' });
        return;
      }

      const existingPosition = positions.find(p => p.symbol === selectedCrypto);
      if (existingPosition) {
        const newAmount = existingPosition.amount + amount;
        const newAvgPrice = ((existingPosition.price * existingPosition.amount) + (price * amount)) / newAmount;
        setPositions(positions.map(p => 
          p.symbol === selectedCrypto 
            ? { ...p, amount: newAmount, price: newAvgPrice, currentPrice: crypto.price }
            : p
        ));
      } else {
        const newPosition: Position = {
          id: Date.now().toString(),
          symbol: selectedCrypto,
          type: 'BUY',
          amount,
          price,
          currentPrice: crypto.price,
          pnl: 0,
          pnlPercent: 0,
          timestamp: new Date()
        };
        setPositions([...positions, newPosition]);
      }
      setPaperBalance(prev => prev - total);
    } else {
      const existingPosition = positions.find(p => p.symbol === selectedCrypto);
      if (!existingPosition || existingPosition.amount < amount) {
        toast({ title: 'Error', description: 'No tienes suficientes ' + selectedCrypto, variant: 'destructive' });
        return;
      }

      const newAmount = existingPosition.amount - amount;
      if (newAmount <= 0) {
        setPositions(positions.filter(p => p.symbol !== selectedCrypto));
      } else {
        setPositions(positions.map(p => 
          p.symbol === selectedCrypto ? { ...p, amount: newAmount } : p
        ));
      }
      setPaperBalance(prev => prev + total);
    }

    const transaction: Transaction = {
      id: Date.now().toString(),
      symbol: selectedCrypto,
      type: side,
      amount,
      price,
      total,
      timestamp: new Date()
    };
    setTransactions(prev => [transaction, ...prev]);
    toast({ title: `${side === 'BUY' ? 'Compra' : 'Venta'} exitosa`, description: `${amount} ${selectedCrypto.replace('USDT', '')} a $${price.toLocaleString()}` });
    setTradeAmount('');
  };

  // Real trade execution
  const executeRealTrade = async (side: 'BUY' | 'SELL') => {
    if (!hasApiKeys) {
      toast({ title: 'Error', description: 'Configura tus API keys primero', variant: 'destructive' });
      return;
    }

    const amount = parseFloat(tradeAmount);
    if (!amount || amount <= 0) {
      toast({ title: 'Error', description: 'Ingresa una cantidad válida', variant: 'destructive' });
      return;
    }

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: selectedCrypto,
          side,
          type: orderType,
          quantity: amount,
          price: orderType === 'LIMIT' ? parseFloat(tradePrice) : undefined,
          stopPrice: stopPrice ? parseFloat(stopPrice) : undefined,
        })
      });

      const data = await response.json();
      if (data.success) {
        toast({ title: 'Orden enviada', description: `Orden ${data.order.orderId} creada` });
        fetchRealBalance();
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Error al enviar orden', variant: 'destructive' });
    }
  };

  // Save API config
  const saveApiConfig = async () => {
    if (!apiKey || !apiSecret) {
      toast({ title: 'Error', description: 'Completa todos los campos', variant: 'destructive' });
      return;
    }

    try {
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey, apiSecret, testnet })
      });

      const data = await response.json();
      if (data.success) {
        toast({ title: 'Guardado', description: 'API keys configuradas correctamente' });
        setHasApiKeys(true);
        setApiKey('');
        setApiSecret('');
        fetchRealBalance();
      } else {
        toast({ title: 'Error', description: data.error || data.details, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Error al guardar', variant: 'destructive' });
    }
  };

  // Create alert
  const createAlert = async () => {
    if (!alertSymbol || !alertPrice) {
      toast({ title: 'Error', description: 'Completa todos los campos', variant: 'destructive' });
      return;
    }

    try {
      const response = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: alertSymbol,
          targetPrice: parseFloat(alertPrice),
          condition: alertCondition,
        })
      });

      const data = await response.json();
      if (data.success) {
        setAlerts([...alerts, data.alert]);
        toast({ title: 'Alerta creada', description: `Alerta para ${alertSymbol}` });
        setAlertPrice('');
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Error al crear alerta', variant: 'destructive' });
    }
  };

  // Delete alert
  const deleteAlert = async (id: string) => {
    try {
      await fetch(`/api/alerts?id=${id}`, { method: 'DELETE' });
      setAlerts(alerts.filter(a => a.id !== id));
    } catch (error) {
      toast({ title: 'Error', description: 'Error al eliminar', variant: 'destructive' });
    }
  };

  // Toggle watchlist
  const toggleWatchlist = (symbol: string) => {
    if (watchlist.includes(symbol)) {
      setWatchlist(watchlist.filter(s => s !== symbol));
    } else {
      setWatchlist([...watchlist, symbol]);
    }
  };

  // Reset paper trading
  const resetPaperTrading = () => {
    setPaperBalance(10000);
    setPositions([]);
    setTransactions([]);
    toast({ title: 'Cuenta reiniciada', description: 'Balance restaurado a $10,000' });
  };

  // Filter prices by search and watchlist
  const filteredPrices = prices.filter(p => {
    const matchesSearch = p.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesWatchlist = !showWatchlistOnly || watchlist.includes(p.symbol);
    return matchesSearch && matchesWatchlist;
  });

  // Update position prices
  useEffect(() => {
    if (prices.length > 0) {
      setPositions(prev => prev.map(pos => {
        const crypto = prices.find(p => p.symbol === pos.symbol);
        if (!crypto) return pos;
        const pnl = (crypto.price - pos.price) * pos.amount;
        const pnlPercent = ((crypto.price - pos.price) / pos.price) * 100;
        return { ...pos, currentPrice: crypto.price, pnl, pnlPercent };
      }));
    }
  }, [prices]);

  // Fetch real balance when switching to real mode
  useEffect(() => {
    if (isRealMode && hasApiKeys) {
      fetchRealBalance();
    }
  }, [isRealMode, hasApiKeys, fetchRealBalance]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-400">Conectando con Binance...</p>
        </div>
      </div>
    );
  }

  const currentPrice = prices.find(p => p.symbol === selectedCrypto)?.price || 0;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#0f0f15] sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <LineChart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">CryptoTrader Pro</h1>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                  <p className="text-xs text-gray-400">{isConnected ? 'Tiempo real' : 'Conectando...'}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Botón de Configuración Visible */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowConfigDialog(true)}
                className="gap-2"
              >
                <Settings className="w-4 h-4" /> Config API
              </Button>
              
              <div className="flex items-center gap-2 bg-[#1a1a24] rounded-lg p-1">
                <button
                  onClick={() => setIsRealMode(false)}
                  className={`px-3 py-1.5 rounded-md text-sm transition ${!isRealMode ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  🧪 Paper
                </button>
                <button
                  onClick={() => {
                    if (hasApiKeys) setIsRealMode(true);
                    else toast({ title: 'Configura tus API keys primero', description: 'Haz clic en "Config API" para configurar', variant: 'destructive' });
                  }}
                  className={`px-3 py-1.5 rounded-md text-sm transition ${isRealMode ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  💰 Real
                </button>
              </div>
              <Button variant="outline" size="sm" onClick={() => { setRefreshing(true); fetchPrices(); }} disabled={refreshing}>
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <Card className="bg-[#111118] border-gray-800">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-xs text-gray-400">Balance</p>
                  <p className="text-lg font-bold">
                    ${isRealMode ? totalUSD.toLocaleString(undefined, {maximumFractionDigits: 2}) : paperBalance.toLocaleString(undefined, {maximumFractionDigits: 2})}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#111118] border-gray-800">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-xs text-gray-400">Portfolio</p>
                  <p className="text-lg font-bold">${isRealMode ? totalUSD.toLocaleString(undefined, {maximumFractionDigits: 2}) : portfolioValue.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#111118] border-gray-800">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                {totalPnL >= 0 ? <TrendingUp className="w-5 h-5 text-green-400" /> : <TrendingDown className="w-5 h-5 text-red-400" />}
                <div>
                  <p className="text-xs text-gray-400">P/L</p>
                  <p className={`text-lg font-bold ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {totalPnL >= 0 ? '+' : ''}{totalPnL.toFixed(2)} ({totalPnLPercent.toFixed(2)}%)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#111118] border-gray-800">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Bitcoin className="w-5 h-5 text-yellow-400" />
                <div>
                  <p className="text-xs text-gray-400">Posiciones</p>
                  <p className="text-lg font-bold">{isRealMode ? realBalances.filter(b => b.total > 0).length : positions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Left: Chart & Trading */}
          <div className="lg:col-span-2 space-y-4">
            {/* Chart Header */}
            <Card className="bg-[#111118] border-gray-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
                      <SelectTrigger className="w-40 bg-[#1a1a24] border-gray-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a24] border-gray-700">
                        {prices.slice(0, 20).map(p => (
                          <SelectItem key={p.symbol} value={p.symbol}>{p.symbol.replace('USDT', '')}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="text-2xl font-bold">${currentPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                  </div>
                  <Select value={interval} onValueChange={setInterval}>
                    <SelectTrigger className="w-24 bg-[#1a1a24] border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a24] border-gray-700">
                      {['1m', '5m', '15m', '1h', '4h', '1d'].map(i => (
                        <SelectItem key={i} value={i}>{i}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Simple Chart Display */}
                <div ref={chartContainerRef} className="h-64 bg-[#1a1a24] rounded-lg relative overflow-hidden">
                  {chartLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                    </div>
                  ) : candles.length > 0 ? (
                    <div className="p-2 h-full">
                      {/* Candlestick Chart SVG */}
                      <svg viewBox="0 0 400 200" className="w-full h-full" preserveAspectRatio="none">
                        {(() => {
                          const visibleCandles = candles.slice(-60);
                          const minPrice = Math.min(...visibleCandles.map(c => c.low));
                          const maxPrice = Math.max(...visibleCandles.map(c => c.high));
                          const priceRange = maxPrice - minPrice || 1;
                          
                          return visibleCandles.map((candle, i) => {
                            const x = (i / 60) * 400 + 3;
                            const openY = 200 - ((candle.open - minPrice) / priceRange) * 180 - 10;
                            const closeY = 200 - ((candle.close - minPrice) / priceRange) * 180 - 10;
                            const highY = 200 - ((candle.high - minPrice) / priceRange) * 180 - 10;
                            const lowY = 200 - ((candle.low - minPrice) / priceRange) * 180 - 10;
                            const isGreen = candle.close >= candle.open;
                            const color = isGreen ? '#22c55e' : '#ef4444';
                            
                            return (
                              <g key={i}>
                                <line x1={x} y1={highY} x2={x} y2={lowY} stroke={color} strokeWidth="1" />
                                <rect 
                                  x={x - 2} 
                                  y={Math.min(openY, closeY)} 
                                  width="4" 
                                  height={Math.abs(closeY - openY) || 1} 
                                  fill={color} 
                                />
                              </g>
                            );
                          });
                        })()}
                        {/* SMA Lines */}
                        {indicators.sma20 && indicators.sma20.slice(-60).map((point: any, i: number) => {
                          const minPrice = Math.min(...candles.slice(-60).map(c => c.low));
                          const maxPrice = Math.max(...candles.slice(-60).map(c => c.high));
                          const priceRange = maxPrice - minPrice || 1;
                          const x = (i / 60) * 400 + 3;
                          const y = 200 - ((point.value - minPrice) / priceRange) * 180 - 10;
                          return i === 0 ? null : (
                            <circle key={`sma20-${i}`} cx={x} cy={y} r="0.5" fill="#fbbf24" />
                          );
                        })}
                      </svg>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      No hay datos disponibles
                    </div>
                  )}
                </div>

                {/* Indicators */}
                {indicators.currentRSI && (
                  <div className="mt-3 grid grid-cols-4 gap-2 text-sm">
                    <div className="bg-[#1a1a24] rounded p-2 text-center">
                      <p className="text-gray-400 text-xs">RSI</p>
                      <p className={`font-bold ${indicators.currentRSI > 70 ? 'text-red-400' : indicators.currentRSI < 30 ? 'text-green-400' : 'text-white'}`}>
                        {indicators.currentRSI.toFixed(1)}
                      </p>
                    </div>
                    <div className="bg-[#1a1a24] rounded p-2 text-center">
                      <p className="text-gray-400 text-xs">SMA 20</p>
                      <p className="font-bold">${indicators.currentSMA20?.toFixed(2) ?? '-'}</p>
                    </div>
                    <div className="bg-[#1a1a24] rounded p-2 text-center">
                      <p className="text-gray-400 text-xs">MACD</p>
                      <p className={`font-bold ${indicators.currentMACD?.histogram > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {indicators.currentMACD?.macd?.toFixed(2) ?? '-'}
                      </p>
                    </div>
                    <div className="bg-[#1a1a24] rounded p-2 text-center">
                      <p className="text-gray-400 text-xs">24h Vol</p>
                      <p className="font-bold text-xs">{((candles.slice(-24).reduce((a, c) => a + c.volume, 0)) / 1000000).toFixed(1)}M</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Trading Panel */}
            <Card className="bg-[#111118] border-gray-800">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Ejecutar Orden</CardTitle>
                  <Badge variant={isRealMode ? "destructive" : "secondary"}>
                    {isRealMode ? '💰 Real' : '🧪 Paper'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-400">Tipo</Label>
                    <Select value={orderType} onValueChange={setOrderType}>
                      <SelectTrigger className="bg-[#1a1a24] border-gray-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a24] border-gray-700">
                        <SelectItem value="MARKET">Market</SelectItem>
                        <SelectItem value="LIMIT">Limit</SelectItem>
                        <SelectItem value="STOP_LOSS">Stop Loss</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-400">Cantidad</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={tradeAmount}
                      onChange={(e) => setTradeAmount(e.target.value)}
                      className="bg-[#1a1a24] border-gray-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-400">Precio</Label>
                    <Input
                      type="number"
                      placeholder={currentPrice.toString()}
                      value={tradePrice}
                      onChange={(e) => setTradePrice(e.target.value)}
                      disabled={orderType === 'MARKET'}
                      className="bg-[#1a1a24] border-gray-700 disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm bg-[#1a1a24] rounded-lg p-3">
                  <span className="text-gray-400">Total:</span>
                  <span className="font-bold">
                    ${((parseFloat(tradeAmount) || 0) * (orderType === 'MARKET' ? currentPrice : parseFloat(tradePrice) || currentPrice)).toLocaleString(undefined, {maximumFractionDigits: 2})}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    className="bg-green-600 hover:bg-green-700 h-12"
                    onClick={() => isRealMode ? executeRealTrade('BUY') : executePaperTrade('BUY')}
                  >
                    <TrendingUp className="w-5 h-5 mr-2" /> COMPRAR
                  </Button>
                  <Button 
                    className="bg-red-600 hover:bg-red-700 h-12"
                    onClick={() => isRealMode ? executeRealTrade('SELL') : executePaperTrade('SELL')}
                  >
                    <TrendingDown className="w-5 h-5 mr-2" /> VENDER
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Prices & Positions */}
          <div className="space-y-4">
            {/* Prices */}
            <Card className="bg-[#111118] border-gray-800">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Precios</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowWatchlistOnly(!showWatchlistOnly)}
                      className={showWatchlistOnly ? 'text-yellow-400' : 'text-gray-400'}
                    >
                      <Star className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <Input
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#1a1a24] border-gray-700 h-8"
                />
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-80">
                  {filteredPrices.map((crypto) => (
                    <div
                      key={crypto.symbol}
                      onClick={() => setSelectedCrypto(crypto.symbol)}
                      className={`flex items-center justify-between p-3 cursor-pointer border-b border-gray-800 hover:bg-[#1a1a24] ${
                        selectedCrypto === crypto.symbol ? 'bg-blue-500/10' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleWatchlist(crypto.symbol); }}
                          className="text-gray-400 hover:text-yellow-400"
                        >
                          {watchlist.includes(crypto.symbol) ? (
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ) : (
                            <StarOff className="w-4 h-4" />
                          )}
                        </button>
                        <div>
                          <p className="font-medium">{crypto.symbol.replace('USDT', '')}</p>
                          <p className="text-xs text-gray-400">
                            {(crypto.quoteVolume ?? 0) > 1000000000 ? `${((crypto.quoteVolume ?? 0) / 1000000000).toFixed(1)}B` : 
                             (crypto.quoteVolume ?? 0) > 1000000 ? `${((crypto.quoteVolume ?? 0) / 1000000).toFixed(1)}M` : 
                             `${((crypto.quoteVolume ?? 0) / 1000).toFixed(1)}K`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${crypto.price < 1 ? crypto.price?.toFixed(6) ?? '0' : crypto.price?.toLocaleString(undefined, {maximumFractionDigits: 2}) ?? '0'}</p>
                        <p className={`text-xs ${crypto.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {crypto.change24h >= 0 ? '+' : ''}{crypto.change24h?.toFixed(2) ?? '0'}%
                        </p>
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Positions */}
            {!isRealMode && (
              <Card className="bg-[#111118] border-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Posiciones</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {positions.length === 0 ? (
                    <div className="p-6 text-center text-gray-400">
                      <Coins className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">Sin posiciones</p>
                    </div>
                  ) : (
                    <ScrollArea className="h-48">
                      {positions.map((pos) => {
                        const posPrice = pos.price ?? 0;
                        const posAmount = pos.amount ?? 0;
                        const posCurrentPrice = pos.currentPrice ?? 0;
                        const posPnlPercent = pos.pnlPercent ?? 0;
                        
                        return (
                        <div key={pos.id} className="p-3 border-b border-gray-800">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{pos.symbol.replace('USDT', '')}</span>
                            <span className={pos.pnl >= 0 ? 'text-green-400' : 'text-red-400'}>
                              {pos.pnl >= 0 ? '+' : ''}{posPnlPercent?.toFixed(2) ?? '0'}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                            <span>{posAmount} @ ${posPrice?.toLocaleString() ?? '0'}</span>
                            <span>${(posAmount * posCurrentPrice).toFixed(2)}</span>
                          </div>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            className="w-full bg-red-600 hover:bg-red-700"
                            onClick={() => {
                              setSelectedCrypto(pos.symbol);
                              setTradeAmount(posAmount.toString());
                              toast({ title: 'Listo para vender', description: `Presiona VENDER para cerrar tu posición de ${pos.symbol.replace('USDT', '')}` });
                            }}
                          >
                            <TrendingDown className="w-4 h-4 mr-1" /> Vender Todo
                          </Button>
                        </div>
                        );
                      })}
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Real Balances */}
            {isRealMode && (
              <Card className="bg-[#111118] border-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Activos</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-48">
                    {realBalances.filter(b => b.total > 0).map((balance) => (
                      <div key={balance.asset} className="p-3 border-b border-gray-800">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{balance.asset}</span>
                          <span className="text-gray-400">${balance.usdValue?.toFixed(2) ?? '0.00'}</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {balance.free?.toFixed(8) ?? '0'} available
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Bottom Tabs */}
        <Tabs defaultValue="history" className="mt-4">
          <TabsList className="bg-[#111118] border-gray-800">
            <TabsTrigger value="history" className="gap-2"><History className="w-4 h-4" /> Historial</TabsTrigger>
            <TabsTrigger value="alerts" className="gap-2"><Bell className="w-4 h-4" /> Alertas</TabsTrigger>
            <TabsTrigger value="settings" className="gap-2"><Settings className="w-4 h-4" /> Config</TabsTrigger>
          </TabsList>

          <TabsContent value="history">
            <Card className="bg-[#111118] border-gray-800">
              <CardContent className="p-0">
                {transactions.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">
                    <History className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p>Sin transacciones</p>
                  </div>
                ) : (
                  <ScrollArea className="h-64">
                    {transactions.map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between p-3 border-b border-gray-800">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === 'BUY' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                            {tx.type === 'BUY' ? <TrendingUp className="w-4 h-4 text-green-400" /> : <TrendingDown className="w-4 h-4 text-red-400" />}
                          </div>
                          <div>
                            <p className="font-medium">{tx.type === 'BUY' ? 'Compró' : 'Vendió'} {tx.amount} {tx.symbol.replace('USDT', '')}</p>
                            <p className="text-xs text-gray-400">{new Date(tx.timestamp).toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${tx.total?.toFixed(2) ?? '0.00'}</p>
                          <p className="text-xs text-gray-400">@ ${tx.price?.toLocaleString() ?? '0'}</p>
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts">
            <Card className="bg-[#111118] border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg">Crear Alerta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <Select value={alertSymbol} onValueChange={setAlertSymbol}>
                    <SelectTrigger className="bg-[#1a1a24] border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a24] border-gray-700">
                      {prices.slice(0, 20).map(p => (
                        <SelectItem key={p.symbol} value={p.symbol}>{p.symbol.replace('USDT', '')}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={alertCondition} onValueChange={setAlertCondition}>
                    <SelectTrigger className="bg-[#1a1a24] border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a24] border-gray-700">
                      <SelectItem value="above">Por encima</SelectItem>
                      <SelectItem value="below">Por debajo</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="Precio"
                    value={alertPrice}
                    onChange={(e) => setAlertPrice(e.target.value)}
                    className="bg-[#1a1a24] border-gray-700"
                  />
                </div>
                <Button onClick={createAlert} className="w-full">Crear Alerta</Button>

                <Separator className="bg-gray-800" />

                <div className="space-y-2">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-3 bg-[#1a1a24] rounded-lg">
                      <div>
                        <p className="font-medium">{alert.symbol.replace('USDT', '')}</p>
                        <p className="text-sm text-gray-400">
                          {alert.condition === 'above' ? '↑' : '↓'} ${alert.targetPrice.toLocaleString()}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => deleteAlert(alert.id)}>
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" id="config-section">
            <Card className="bg-[#111118] border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Key className="w-5 h-5" /> API de Binance</CardTitle>
                <CardDescription>
                  Configura tus API keys para trading real. 
                  <a href="https://www.binance.com/en/my/settings/api-management" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline ml-1">
                    Crear API Key →
                  </a>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-[#1a1a24] rounded-lg">
                  <div>
                    <p className="font-medium">Modo Testnet</p>
                    <p className="text-xs text-gray-400">Usar ambiente de pruebas</p>
                  </div>
                  <Switch checked={testnet} onCheckedChange={setTestnet} />
                </div>

                <div className="space-y-2">
                  <Label>API Key</Label>
                  <Input
                    type="text"
                    placeholder="Tu API Key de Binance"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="bg-[#1a1a24] border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label>API Secret</Label>
                  <div className="relative">
                    <Input
                      type={showSecret ? 'text' : 'password'}
                      placeholder="Tu API Secret"
                      value={apiSecret}
                      onChange={(e) => setApiSecret(e.target.value)}
                      className="bg-[#1a1a24] border-gray-700 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0"
                      onClick={() => setShowSecret(!showSecret)}
                    >
                      {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <Button onClick={saveApiConfig} className="w-full gap-2">
                  <Shield className="w-4 h-4" /> Guardar Configuración
                </Button>

                {hasApiKeys && (
                  <div className="flex items-center gap-2 p-3 bg-green-500/10 text-green-400 rounded-lg">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">API keys configuradas</span>
                  </div>
                )}

                <Separator className="bg-gray-800" />

                <div className="space-y-2">
                  <Label className="text-red-400">Zona de Peligro</Label>
                  <Button variant="outline" onClick={resetPaperTrading} className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10">
                    <AlertTriangle className="w-4 h-4 mr-2" /> Reiniciar Paper Trading
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Diálogo de Configuración API */}
      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent className="bg-[#111118] border-gray-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" /> API de Binance
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Configura tus API keys para trading real.{' '}
              <a href="https://www.binance.com/en/my/settings/api-management" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                Crear API Key →
              </a>
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div className="flex items-center justify-between p-3 bg-[#1a1a24] rounded-lg">
              <div>
                <p className="font-medium">Modo Testnet</p>
                <p className="text-xs text-gray-400">Usar ambiente de pruebas</p>
              </div>
              <Switch checked={testnet} onCheckedChange={setTestnet} />
            </div>

            <div className="space-y-2">
              <Label>API Key</Label>
              <Input
                type="text"
                placeholder="Tu API Key de Binance"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="bg-[#1a1a24] border-gray-700"
              />
            </div>

            <div className="space-y-2">
              <Label>API Secret</Label>
              <div className="relative">
                <Input
                  type={showSecret ? 'text' : 'password'}
                  placeholder="Tu API Secret"
                  value={apiSecret}
                  onChange={(e) => setApiSecret(e.target.value)}
                  className="bg-[#1a1a24] border-gray-700 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0"
                  onClick={() => setShowSecret(!showSecret)}
                >
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <Button onClick={() => { saveApiConfig(); setShowConfigDialog(false); }} className="w-full gap-2 bg-blue-600 hover:bg-blue-700">
              <Shield className="w-4 h-4" /> Guardar Configuración
            </Button>

            {hasApiKeys && (
              <div className="flex items-center gap-2 p-3 bg-green-500/10 text-green-400 rounded-lg">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">API keys configuradas ✓</span>
              </div>
            )}

            <Separator className="bg-gray-800" />

            <div className="space-y-2">
              <Label className="text-red-400">Zona de Peligro</Label>
              <Button variant="outline" onClick={() => { resetPaperTrading(); setShowConfigDialog(false); }} className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10">
                <AlertTriangle className="w-4 h-4 mr-2" /> Reiniciar Paper Trading
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-[#0f0f15] py-3 mt-6">
        <div className="container mx-auto px-4 text-center text-xs text-gray-500">
          <p>CryptoTrader Pro • Paper Trading & Real Trading • Datos de Binance API</p>
          <p className="mt-1">⚠️ Trading conlleva riesgos. Invierte solo lo que puedas permitirte perder.</p>
        </div>
      </footer>
    </div>
  );
}
