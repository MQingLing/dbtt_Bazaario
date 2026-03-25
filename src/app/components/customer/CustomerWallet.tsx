import { useState } from 'react';
import { Link } from 'react-router';
import CustomerNav from './CustomerNav';
import { User } from '../../App';
import { Card, CardContent } from '../shared/card';
import { Button } from '../shared/button';
import { Badge } from '../shared/badge';
import { Input } from '../shared/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../shared/tabs';
import { Wallet, Plus, ArrowUpRight, ArrowDownRight, CreditCard, QrCode, TrendingUp } from 'lucide-react';

interface CustomerWalletProps {
  user: User;
  onLogout: () => void;
}

export default function CustomerWallet({ user, onLogout }: CustomerWalletProps) {
  const [topUpAmount, setTopUpAmount] = useState('');
  const [topUpMessage, setTopUpMessage] = useState('');

  const quickTopUpAmounts = [10, 20, 50, 100];

  const transactions = [
    { id: '1', type: 'spent', vendor: "Wong's Satay", amount: 15.00, date: 'Mar 5, 2026', time: '7:30 PM', status: 'completed' },
    { id: '2', type: 'topup', vendor: 'Credit Card', amount: 50.00, date: 'Mar 5, 2026', time: '6:00 PM', status: 'completed' },
    { id: '3', type: 'spent', vendor: 'Bubble Tea Paradise', amount: 8.50, date: 'Mar 4, 2026', time: '8:15 PM', status: 'completed' },
    { id: '4', type: 'spent', vendor: 'Golden Snacks', amount: 12.00, date: 'Mar 4, 2026', time: '7:45 PM', status: 'completed' },
    { id: '5', type: 'topup', vendor: 'PayNow', amount: 100.00, date: 'Mar 3, 2026', time: '5:00 PM', status: 'completed' },
    { id: '6', type: 'spent', vendor: 'Artisan Crafts', amount: 35.00, date: 'Mar 3, 2026', time: '8:30 PM', status: 'completed' },
    { id: '7', type: 'refund', vendor: 'Order #1234', amount: 10.00, date: 'Mar 2, 2026', time: '2:00 PM', status: 'completed' },
  ];

  const showTopUpSuccess = (amount: number) => {
    setTopUpMessage(`$${amount.toFixed(2)} top-up initiated successfully!`);
    setTimeout(() => setTopUpMessage(''), 3000);
  };

  const handleTopUp = (amount: number) => showTopUpSuccess(amount);

  const handleCustomTopUp = () => {
    const amount = parseFloat(topUpAmount);
    if (topUpAmount && amount > 0) {
      showTopUpSuccess(amount);
      setTopUpAmount('');
    }
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
                <p className="text-xl font-bold">$85.50</p>
              </div>
              <div>
                <p className="text-white/80 text-sm mb-1">Total Spent</p>
                <p className="text-xl font-bold">$342.50</p>
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
                        className="h-16 text-lg font-bold hover:border-orange-500 hover:text-orange-600"
                        onClick={() => handleTopUp(amount)}
                      >
                        ${amount}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm text-gray-600">Custom Amount</p>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <Input
                        type="number"
                        placeholder="Enter amount"
                        value={topUpAmount}
                        onChange={(e) => setTopUpAmount(e.target.value)}
                        className="pl-7 h-11"
                        min="1"
                        step="0.01"
                      />
                    </div>
                    <Button 
                      onClick={handleCustomTopUp}
                      className="h-11 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Top Up
                    </Button>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <p className="text-sm text-gray-600 mb-3">Payment Methods</p>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start h-12">
                      <CreditCard className="w-5 h-5 mr-3 text-blue-600" />
                      <div className="text-left">
                        <p className="font-medium">Credit/Debit Card</p>
                        <p className="text-xs text-gray-500">Visa, Mastercard, Amex</p>
                      </div>
                    </Button>
                    <Button variant="outline" className="w-full justify-start h-12">
                      <div className="w-5 h-5 mr-3 bg-orange-500 rounded flex items-center justify-center text-white text-xs font-bold">
                        PN
                      </div>
                      <div className="text-left">
                        <p className="font-medium">PayNow</p>
                        <p className="text-xs text-gray-500">Instant bank transfer</p>
                      </div>
                    </Button>
                  </div>
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
                            transaction.type === 'topup' ? 'bg-green-100' :
                            transaction.type === 'refund' ? 'bg-blue-100' : 'bg-orange-100'
                          }`}>
                            {transaction.type === 'topup' ? (
                              <ArrowDownRight className="w-5 h-5 text-green-600" />
                            ) : transaction.type === 'refund' ? (
                              <ArrowDownRight className="w-5 h-5 text-blue-600" />
                            ) : (
                              <ArrowUpRight className="w-5 h-5 text-orange-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{transaction.vendor}</p>
                            <p className="text-sm text-gray-500">{transaction.date} • {transaction.time}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${
                            transaction.type === 'topup' || transaction.type === 'refund' ? 'text-green-600' : 'text-gray-900'
                          }`}>
                            {transaction.type === 'topup' || transaction.type === 'refund' ? '+' : '-'}${transaction.amount.toFixed(2)}
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
                  <Button variant="outline" className="w-full justify-start">
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
    </div>
  );
}
