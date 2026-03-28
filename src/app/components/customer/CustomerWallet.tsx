import { useState } from 'react';
import { getTransactions } from '../../services/dataStore';
import { Link } from 'react-router';
import CustomerNav from './CustomerNav';
import { User } from '../../App';
import { Card, CardContent } from '../shared/card';
import { Button } from '../shared/button';
import { Badge } from '../shared/badge';
import { Input } from '../shared/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../shared/tabs';
import { Wallet, Plus, ArrowUpRight, ArrowDownRight, CreditCard, QrCode, TrendingUp, X, BarChart2, ShoppingBag, PiggyBank } from 'lucide-react';
import { updateUser } from '../../services/authStore';
import paynowLogo from '../../../assets/paynow_logo.png';

interface CustomerWalletProps {
  user: User;
  onLogout: () => void;
  onUserUpdate: (updatedUser: User) => void;
}

export default function CustomerWallet({ user, onLogout, onUserUpdate }: CustomerWalletProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount,   setCustomAmount]   = useState('');
  const [paymentMethod,  setPaymentMethod]  = useState<'card' | 'paynow' | null>(null);
  const [topUpMessage,   setTopUpMessage]   = useState('');
  const [showStats,      setShowStats]      = useState(false);

  const quickTopUpAmounts = [10, 20, 50, 100];

  // Resolved amount: quick selection takes precedence over custom input
  const resolvedAmount = selectedAmount ?? (customAmount ? parseFloat(customAmount) : null);
  const canConfirm = resolvedAmount !== null && resolvedAmount > 0 && paymentMethod !== null;

  const transactions = getTransactions(user.id);

  const now = new Date();
  const spentTxns = transactions.filter(t => t.type === 'spent');
  const thisMonthSpent = spentTxns
    .filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, t) => sum + t.amount, 0);
  const totalSpent  = spentTxns.reduce((sum, t) => sum + t.amount, 0);
  const totalTopUp  = transactions.filter(t => t.type === 'topup').reduce((sum, t) => sum + t.amount, 0);
  const avgPerVisit = spentTxns.length ? totalSpent / spentTxns.length : 0;

  // Vendor breakdown sorted by amount desc
  const vendorMap: Record<string, number> = {};
  spentTxns.forEach(t => { vendorMap[t.vendor] = (vendorMap[t.vendor] ?? 0) + t.amount; });
  const vendorBreakdown = Object.entries(vendorMap)
    .sort((a, b) => b[1] - a[1]);
  const maxVendorAmount = vendorBreakdown[0]?.[1] ?? 1;

  const handleConfirmTopUp = () => {
    if (!canConfirm || resolvedAmount === null) return;
    const newBalance = (user.walletBalance ?? 0) + resolvedAmount;
    const stored = updateUser(user.id, { walletBalance: newBalance });
    if (stored) onUserUpdate({ ...user, walletBalance: stored.walletBalance });
    const methodLabel = paymentMethod === 'card' ? 'Credit/Debit Card' : 'PayNow';
    setTopUpMessage(`$${resolvedAmount.toFixed(2)} added via ${methodLabel} — new balance $${newBalance.toFixed(2)}`);
    setSelectedAmount(null);
    setCustomAmount('');
    setPaymentMethod(null);
    setTimeout(() => setTopUpMessage(''), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <CustomerNav user={user} onLogout={onLogout} />

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wallet</h1>
          <p className="text-gray-600">Manage your funds and transactions</p>
        </div>

        {/* Balance Card */}
        <Card className="mb-6 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white border-0 overflow-hidden">
          <CardContent className="p-6 md:p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-white/80 mb-2">Available Balance</p>
                <h2 className="text-4xl md:text-5xl font-bold mb-4">${user.walletBalance?.toFixed(2)}</h2>
                <Link to="/customer/qr-payment">
                  <Button variant="secondary" className="bg-white text-orange-600 hover:bg-white/90">
                    <QrCode className="w-4 h-4 mr-2" />
                    Show QR Code
                  </Button>
                </Link>
              </div>
              <Wallet className="w-16 h-16 text-white/20" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
              <div>
                <p className="text-white/80 text-sm mb-1">This Month</p>
                <p className="text-xl font-bold">${thisMonthSpent.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-white/80 text-sm mb-1">Total Spent</p>
                <p className="text-xl font-bold">${totalSpent.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Top Up Section */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">Top Up Wallet</h3>

                {topUpMessage && (
                  <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 font-medium">
                    ✓ {topUpMessage}
                  </div>
                )}

                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-3">Quick Top Up</p>
                  <div className="grid grid-cols-4 gap-3">
                    {quickTopUpAmounts.map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        className={`h-16 text-lg font-bold transition-colors ${
                          selectedAmount === amount
                            ? 'border-orange-500 bg-orange-50 text-orange-600'
                            : 'hover:border-orange-500 hover:text-orange-600'
                        }`}
                        onClick={() => { setSelectedAmount(amount); setCustomAmount(''); }}
                      >
                        ${amount}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm text-gray-600">Custom Amount</p>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={customAmount}
                      onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(null); }}
                      className="pl-7 h-11"
                      min="1"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <p className="text-sm text-gray-600 mb-3">Payment Methods</p>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className={`w-full justify-start h-12 transition-colors ${
                        paymentMethod === 'card' ? 'border-blue-500 bg-blue-50' : ''
                      }`}
                      onClick={() => setPaymentMethod(paymentMethod === 'card' ? null : 'card')}
                    >
                      <CreditCard className="w-5 h-5 mr-3 text-blue-600 self-center flex-shrink-0" />
                      <div className="text-left">
                        <p className="font-medium">Credit/Debit Card</p>
                        <p className="text-xs text-gray-500">Visa, Mastercard, Amex</p>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      className={`w-full justify-start h-12 transition-colors ${
                        paymentMethod === 'paynow' ? 'border-orange-500 bg-orange-50' : ''
                      }`}
                      onClick={() => setPaymentMethod(paymentMethod === 'paynow' ? null : 'paynow')}
                    >
                      <img src={paynowLogo} alt="PayNow" className="w-5 h-5 mr-3 object-contain self-center flex-shrink-0" />
                      <div className="text-left">
                        <p className="font-medium">PayNow</p>
                        <p className="text-xs text-gray-500">Instant bank transfer</p>
                      </div>
                    </Button>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <Button
                    onClick={handleConfirmTopUp}
                    disabled={!canConfirm}
                    className="w-full h-12 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 disabled:opacity-40"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {resolvedAmount && resolvedAmount > 0
                      ? `Top Up $${resolvedAmount.toFixed(2)}`
                      : 'Select an amount and payment method'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Transaction History */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">Transaction History</h3>
                
                <Tabs defaultValue="all">
                  <TabsList className="grid w-full grid-cols-3 mb-4">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="spent">Spent</TabsTrigger>
                    <TabsTrigger value="topup">Top Up</TabsTrigger>
                  </TabsList>

                  <TabsContent value="all" className="space-y-3">
                    {transactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            transaction.type === 'topup' ? 'bg-green-100' : 'bg-orange-100'
                          }`}>
                            {transaction.type === 'topup' ? (
                              <ArrowDownRight className="w-5 h-5 text-green-600" />
                            ) : (
                              <ArrowUpRight className="w-5 h-5 text-orange-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{transaction.vendor}</p>
                            <p className="text-sm text-gray-500">{transaction.date} • {transaction.time}</p>
                            <span className="inline-block mt-0.5 text-xs px-1.5 py-0.5 rounded bg-gray-200 text-gray-600">{transaction.paymentMethod}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${
                            transaction.type === 'topup' ? 'text-green-600' : 'text-gray-900'
                          }`}>
                            {transaction.type === 'topup' ? '+' : '-'}${transaction.amount.toFixed(2)}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="spent" className="space-y-3">
                    {transactions.filter(t => t.type === 'spent').map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-orange-100">
                            <ArrowUpRight className="w-5 h-5 text-orange-600" />
                          </div>
                          <div>
                            <p className="font-medium">{transaction.vendor}</p>
                            <p className="text-sm text-gray-500">{transaction.date} • {transaction.time}</p>
                            <span className="inline-block mt-0.5 text-xs px-1.5 py-0.5 rounded bg-gray-200 text-gray-600">{transaction.paymentMethod}</span>
                          </div>
                        </div>
                        <p className="font-bold">-${transaction.amount.toFixed(2)}</p>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="topup" className="space-y-3">
                    {transactions.filter(t => t.type === 'topup').map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-100">
                            <ArrowDownRight className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">{transaction.vendor}</p>
                            <p className="text-sm text-gray-500">{transaction.date} • {transaction.time}</p>
                            <span className="inline-block mt-0.5 text-xs px-1.5 py-0.5 rounded bg-gray-200 text-gray-600">{transaction.paymentMethod}</span>
                          </div>
                        </div>
                        <p className="font-bold text-green-600">+${transaction.amount.toFixed(2)}</p>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link to="/customer/qr-payment">
                    <Button variant="outline" className="w-full justify-start">
                      <QrCode className="w-5 h-5 mr-3 text-orange-500" />
                      Payment QR Code
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full justify-start" onClick={() => setShowStats(true)}>
                    <TrendingUp className="w-5 h-5 mr-3 text-green-500" />
                    Spending Stats
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-pink-50 border-orange-200">
              <CardContent className="p-6">
                <h4 className="font-bold mb-2">💡 Wallet Tips</h4>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• Top up before events to skip queues</li>
                  <li>• Earn loyalty stamps with every purchase</li>
                  <li>• Get instant refunds for cancelled orders</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Spending Stats Modal */}
      {showStats && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-green-500" />
                <h2 className="text-xl font-bold text-gray-900">Spending Stats</h2>
              </div>
              <button onClick={() => setShowStats(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Summary cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-orange-50 rounded-xl p-3 text-center">
                  <ShoppingBag className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                  <p className="text-xs text-gray-500 mb-0.5">Total Spent</p>
                  <p className="font-bold text-gray-900">${totalSpent.toFixed(2)}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-3 text-center">
                  <PiggyBank className="w-5 h-5 text-green-500 mx-auto mb-1" />
                  <p className="text-xs text-gray-500 mb-0.5">Total Topped Up</p>
                  <p className="font-bold text-gray-900">${totalTopUp.toFixed(2)}</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-3 text-center">
                  <TrendingUp className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                  <p className="text-xs text-gray-500 mb-0.5">Avg per Visit</p>
                  <p className="font-bold text-gray-900">${avgPerVisit.toFixed(2)}</p>
                </div>
              </div>

              {/* This month */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-2 text-sm">This Month</h3>
                <div className="bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl p-4 text-white">
                  <p className="text-white/80 text-sm mb-1">Spent so far</p>
                  <p className="text-3xl font-bold">${thisMonthSpent.toFixed(2)}</p>
                  <p className="text-white/70 text-xs mt-1">{spentTxns.filter(t => {
                    const d = new Date(t.date);
                    return d.getMonth() === new Date().getMonth();
                  }).length} transaction{spentTxns.length !== 1 ? 's' : ''} this month</p>
                </div>
              </div>

              {/* Top vendors */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-3 text-sm">Top Vendors</h3>
                <div className="space-y-3">
                  {vendorBreakdown.map(([vendor, amount]) => (
                    <div key={vendor}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700 font-medium">{vendor}</span>
                        <span className="font-bold text-gray-900">${amount.toFixed(2)}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-orange-400 to-pink-500 rounded-full transition-all"
                          style={{ width: `${(amount / maxVendorAmount) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Visits count */}
              <div className="pt-2 border-t text-sm text-gray-500 flex justify-between">
                <span>Total stall visits</span>
                <span className="font-semibold text-gray-700">{spentTxns.length}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
