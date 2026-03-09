import { Link } from 'react-router';
import AdminNav from './AdminNav';
import { User } from '../App';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { DollarSign, Calendar, Users, TrendingUp, MapPin, ShoppingBag } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

export default function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const stats = {
    totalRevenue: 45320.50,
    totalEvents: 8,
    totalVendors: 156,
    activeEvents: 3,
    totalOrders: 2341,
    platformFees: 1234.50
  };

  const revenueData = [
    { id: 1, date: 'Mon', revenue: 2450 },
    { id: 2, date: 'Tue', revenue: 3120 },
    { id: 3, date: 'Wed', revenue: 2890 },
    { id: 4, date: 'Thu', revenue: 4250 },
    { id: 5, date: 'Fri', revenue: 5120 },
    { id: 6, date: 'Sat', revenue: 6780 },
    { id: 7, date: 'Sun', revenue: 5890 }
  ];

  const eventData = [
    { name: 'Geylang Serai', vendors: 45, revenue: 12500 },
    { name: 'Toa Payoh', vendors: 38, revenue: 9800 },
    { name: 'Chinatown', vendors: 52, revenue: 15200 },
    { name: 'Woodlands', vendors: 42, revenue: 8300 }
  ];

  const activeEvents = [
    { id: '1', name: 'Geylang Serai Pasar Malam', location: 'Geylang Serai', vendors: 45, status: 'ongoing', revenue: 12500 },
    { id: '2', name: 'Woodlands Night Market', location: 'Woodlands', vendors: 42, status: 'ongoing', revenue: 8300 },
    { id: '3', name: 'Chinatown Street Market', location: 'Chinatown', vendors: 52, status: 'ongoing', revenue: 15200 },
  ];

  const recentVendors = [
    { name: "Wong's Satay", category: 'Food', status: 'active', joined: 'Mar 1, 2026' },
    { name: 'Bubble Tea Paradise', category: 'Drinks', status: 'pending', joined: 'Mar 3, 2026' },
    { name: 'Artisan Crafts', category: 'Products', status: 'active', joined: 'Feb 28, 2026' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <AdminNav user={user} onLogout={onLogout} />

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Platform overview and management</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold">${stats.totalRevenue.toFixed(0)}</p>
              <p className="text-xs text-gray-600">Total Revenue</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-2xl font-bold">{stats.totalEvents}</p>
              <p className="text-xs text-gray-600">Total Events</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-2xl font-bold">{stats.totalVendors}</p>
              <p className="text-xs text-gray-600">Total Vendors</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <MapPin className="w-5 h-5 text-orange-600" />
              </div>
              <p className="text-2xl font-bold">{stats.activeEvents}</p>
              <p className="text-xs text-gray-600">Active Events</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <ShoppingBag className="w-5 h-5 text-pink-600" />
              </div>
              <p className="text-2xl font-bold">{stats.totalOrders}</p>
              <p className="text-xs text-gray-600">Total Orders</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold">${stats.platformFees.toFixed(0)}</p>
              <p className="text-xs text-gray-600">Platform Fees</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Revenue Chart */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-6">Weekly Revenue</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData} id="admin-revenue-chart">
                    <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis key="xaxis" dataKey="date" stroke="#6b7280" />
                    <YAxis key="yaxis" stroke="#6b7280" />
                    <Tooltip key="tooltip" contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                    <Line key="revenue-line" type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold mb-4">Platform Performance</h3>
              <div className="space-y-4">
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">Revenue Growth</p>
                  <p className="text-2xl font-bold text-green-900">+15.3%</p>
                  <p className="text-xs text-green-700">vs last week</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">Active Users</p>
                  <p className="text-2xl font-bold text-blue-900">1,234</p>
                  <p className="text-xs text-blue-700">This month</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-800">Avg Order Value</p>
                  <p className="text-2xl font-bold text-purple-900">$24.50</p>
                  <p className="text-xs text-purple-700">Platform average</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Active Events */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Active Events</h3>
                <Link to="/admin/events" className="text-purple-600 text-sm hover:underline">View All →</Link>
              </div>
              <div className="space-y-3">
                {activeEvents.map((event) => (
                  <div key={event.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-gray-900">{event.name}</h4>
                          <Badge className="bg-green-500">Live</Badge>
                        </div>
                        <p className="text-sm text-gray-600">{event.location}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                      <div>
                        <p className="text-gray-500">Vendors</p>
                        <p className="font-bold">{event.vendors}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Revenue</p>
                        <p className="font-bold text-green-600">${event.revenue.toFixed(0)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Vendors */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Recent Vendor Applications</h3>
                <Link to="/admin/vendors" className="text-purple-600 text-sm hover:underline">View All →</Link>
              </div>
              <div className="space-y-3">
                {recentVendors.map((vendor, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-900">{vendor.name}</p>
                      <p className="text-sm text-gray-600">{vendor.category} • {vendor.joined}</p>
                    </div>
                    <Badge className={vendor.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}>
                      {vendor.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
