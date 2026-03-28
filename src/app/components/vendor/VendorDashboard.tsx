import { useState } from 'react';
import { Link } from 'react-router';
import VendorNav from './VendorNav';
import { User } from '../../App';
import { VENDOR_STATS } from '../../data/mockData';
import { getOrders, advanceOrderStatus } from '../../services/dataStore';
import type { Order } from '../../data/mockData';
import { Card, CardContent } from '../shared/card';
import { Badge } from '../shared/badge';
import { Button } from '../shared/button';
import { DollarSign, ShoppingBag, TrendingUp, Users, Clock, CheckCircle2, AlertCircle, Package, Lock } from 'lucide-react';
import { VendorTier } from '../../services/authStore';

interface VendorDashboardProps {
  user: User;
  onLogout: () => void;
}

const TIER_INFO: Record<VendorTier, { label: string; color: string; lockedMsg?: string }> = {
  starter: { label: 'Starter (Free)', color: 'bg-gray-100 text-gray-700 border-gray-200', lockedMsg: 'Analytics & inventory management require Growth plan or above.' },
  growth:  { label: 'Growth — $20/mo', color: 'bg-blue-50 text-blue-700 border-blue-200',  lockedMsg: 'Pre-order management & staff accounts require Pro plan.' },
  pro:     { label: 'Pro',             color: 'bg-orange-50 text-orange-700 border-orange-200' },
  anchor:  { label: 'Anchor',          color: 'bg-purple-50 text-purple-700 border-purple-200' },
};

export default function VendorDashboard({ user, onLogout }: VendorDashboardProps) {
  const stats = VENDOR_STATS;
  const tier = user.vendorTier ?? 'starter';
  const tierInfo = TIER_INFO[tier];

  const [orders, setOrders] = useState<Order[]>(() => getOrders());

  const handleAdvance = (id: string) => {
    advanceOrderStatus(id);
    setOrders(getOrders());
  };

  const STATUS_RANK: Record<string, number> = { pending: 0, preparing: 1, ready: 2, completed: 3, cancelled: 4 };

  const recentOrders = [...orders]
    .sort((a, b) => (STATUS_RANK[a.status] ?? 5) - (STATUS_RANK[b.status] ?? 5))
    .slice(0, 6)
    .map(o => ({
    id: o.id,
    customer: o.customer,
    items: o.items.map(i => `${i.qty}x ${i.name}`).join(', '),
    amount: o.total,
    time: o.time,
    status: o.status,
  }));

  const popularItems = [
    { name: 'Chicken Satay (10 sticks)', sold: 18, revenue: 144.00 },
    { name: 'Mixed Satay Platter (30 sticks)', sold: 3, revenue: 75.00 },
    { name: 'Beef Satay (10 sticks)', sold: 2, revenue: 20.00 },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>;
      case 'preparing':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Preparing</Badge>;
      case 'ready':
        return <Badge className="bg-green-500 hover:bg-green-600">Ready</Badge>;
      case 'completed':
        return <Badge variant="outline">Completed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <VendorNav user={user} onLogout={onLogout} />

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="mb-6">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <Link to="/vendor/subscription">
              <Badge className={`border ${tierInfo.color} cursor-pointer hover:opacity-80 transition-opacity`}>
                {tierInfo.label}
              </Badge>
            </Link>
          </div>
          <p className="text-gray-600">Welcome back, {user.name}!</p>
          {tierInfo.lockedMsg && (
            <div className="mt-3 flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
              <Lock className="w-4 h-4 shrink-0 text-amber-500" />
              <span>{tierInfo.lockedMsg}</span>
              <Link to="/vendor/subscription" className="ml-auto shrink-0 font-medium underline underline-offset-2 hover:text-amber-900">
                Upgrade
              </Link>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Today's Sales</p>
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">${stats.todaySales.toFixed(2)}</h3>
              <p className="text-xs text-green-600 mt-1">+12% from yesterday</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Today's Orders</p>
                <ShoppingBag className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.todayOrders}</h3>
              <p className="text-xs text-blue-600 mt-1">5 pending</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Total Revenue</p>
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toFixed(2)}</h3>
              <p className="text-xs text-orange-600 mt-1">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Customers</p>
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</h3>
              <p className="text-xs text-purple-600 mt-1">All time</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-6 bg-gradient-to-r from-orange-500 to-pink-500 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">Quick Actions</h3>
                <p className="text-white/90 text-sm">Manage your stall efficiently</p>
              </div>
              <div className="flex gap-3 flex-wrap justify-end">
                <Link to="/vendor/orders">
                  <Button variant="secondary">
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    View Orders
                  </Button>
                </Link>
                <Link to="/vendor/products">
                  <Button variant="secondary">
                    <Package className="w-4 h-4 mr-2" />
                    Manage Products
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">Recent Orders</h3>
                  <Link to="/vendor/orders">
                    <Button variant="link" className="text-orange-600">View All →</Button>
                  </Link>
                </div>

                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-gray-900">{order.id}</span>
                            {getStatusBadge(order.status)}
                          </div>
                          <p className="text-sm font-medium text-gray-700">{order.customer}</p>
                          <p className="text-sm text-gray-600">{order.items}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-gray-900">${order.amount.toFixed(2)}</p>
                          <p className="text-xs text-gray-500">{order.time}</p>
                        </div>
                      </div>
                      {order.status !== 'completed' && (
                        <div className="flex gap-2 mt-3">
                          {order.status === 'pending' && (
                            <Button size="sm" className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600" onClick={() => handleAdvance(order.id)}>
                              Accept Order
                            </Button>
                          )}
                          {order.status === 'preparing' && (
                            <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => handleAdvance(order.id)}>
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              Mark Ready
                            </Button>
                          )}
                          {order.status === 'ready' && (
                            <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={() => handleAdvance(order.id)}>
                              Complete Order
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Status Summary */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold mb-4">Order Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                      <span className="text-sm text-gray-700">Pending</span>
                    </div>
                    <span className="font-bold text-yellow-600">{stats.pendingOrders}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-sm text-gray-700">Completed Today</span>
                    </div>
                    <span className="font-bold text-green-600">{stats.completedOrders}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Popular Items */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold mb-4">Popular Items Today</h3>
                <div className="space-y-3">
                  {popularItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-500">{item.sold} sold</p>
                      </div>
                      <p className="font-bold text-orange-600">${item.revenue.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Alerts */}
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-orange-900 mb-1">Low Stock Alert</p>
                    <p className="text-sm text-orange-700">2 items are running low on stock</p>
                    <Link to="/vendor/products">
                      <Button variant="link" className="text-orange-600 p-0 h-auto mt-2">
                        Manage Inventory →
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Business Hours */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold mb-4">Today's Hours</h3>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <Clock className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">Open Now</p>
                    <p className="text-sm text-green-700">6:00 PM - 12:00 AM</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
