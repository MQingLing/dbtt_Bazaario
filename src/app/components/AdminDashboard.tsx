import { Link } from 'react-router';
import AdminNav from './AdminNav';
import { User } from '../App';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { DollarSign, Calendar, Users, TrendingUp, MapPin, ShoppingBag, ArrowUp } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  adminStats as pyStats,
  adminRevenueData,
  adminCategoryData,
  adminPaymentData,
  adminHourlyData,
  adminPerformance,
  adminTopVendors,
  sentimentSummary,
  sentimentByVendor,
  predictions,
  mlResults,
} from '../data/analyticsData';

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

        {/* ── Analytics Section ── */}
        <div className="mt-6">
          <Tabs defaultValue="analytics" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="vendors-rank">Vendors</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="forecast">Forecast</TabsTrigger>
            </TabsList>

            {/* Analytics */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-bold mb-4">Revenue by Category</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={adminCategoryData} layout="vertical" id="admin-cat-chart">
                        <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis key="xaxis" type="number" stroke="#6b7280" />
                        <YAxis key="yaxis" type="category" dataKey="name" stroke="#6b7280" width={110} tick={{ fontSize: 11 }} />
                        <Tooltip key="tooltip" contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                        <Bar key="rev-bar" dataKey="revenue" fill="#f97316" radius={[0, 4, 4, 0]} name="Revenue ($)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-bold mb-4">Payment Methods</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart id="admin-pay-pie">
                        <Pie key="pay-pie" data={adminPaymentData} cx="50%" cy="50%" outerRadius={90} dataKey="value"
                          label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}>
                          {adminPaymentData.map((_: any, i: number) => (
                            <Cell key={`cell-${i}`} fill={['#f97316', '#ec4899', '#8b5cf6'][i % 3]} />
                          ))}
                        </Pie>
                        <Tooltip key="tooltip" />
                        <Legend key="legend" />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold mb-4">Orders by Hour</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={adminHourlyData} id="admin-hour-chart">
                      <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis key="xaxis" dataKey="hour" stroke="#6b7280" />
                      <YAxis key="yaxis" stroke="#6b7280" />
                      <Tooltip key="tooltip" contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                      <Bar key="hour-bar" dataKey="orders" fill="#8b5cf6" name="Orders" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Vendors Ranking */}
            <TabsContent value="vendors-rank" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-bold mb-4">Top Vendors by Revenue</h3>
                    <div className="space-y-3">
                      {adminTopVendors.slice(0, 10).map((vendor: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-gray-400 w-6">#{idx + 1}</span>
                            <p className="font-medium text-gray-900">{vendor.name}</p>
                          </div>
                          <p className="font-bold text-green-600">${vendor.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-bold mb-4">Vendor Sentiment Ranking</h3>
                    <div className="space-y-3">
                      {sentimentByVendor.slice(0, 10).map((vendor: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-gray-400 w-6">#{index + 1}</span>
                            <div>
                              <p className="font-medium text-gray-900">{vendor.vendor}</p>
                              <p className="text-xs text-gray-500">{vendor.totalReviews} reviews</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div className={`h-2 rounded-full ${vendor.positivePct >= 70 ? 'bg-green-500' : vendor.positivePct >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${vendor.positivePct}%` }} />
                            </div>
                            <span className={`text-sm font-bold w-12 text-right ${vendor.positivePct >= 70 ? 'text-green-600' : 'text-red-600'}`}>{vendor.positivePct}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Reviews */}
            <TabsContent value="reviews" className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card><CardContent className="p-5 text-center">
                  <p className="text-sm text-gray-600 mb-1">Total Reviews</p>
                  <p className="text-3xl font-bold">{sentimentSummary.totalReviews}</p>
                </CardContent></Card>
                <Card><CardContent className="p-5 text-center">
                  <p className="text-sm text-gray-600 mb-1">Avg Rating</p>
                  <p className="text-3xl font-bold">{sentimentSummary.avgRating} <span className="text-base text-gray-400">/ 5</span></p>
                </CardContent></Card>
                <Card><CardContent className="p-5 text-center">
                  <p className="text-sm text-gray-600 mb-1">Positive</p>
                  <p className="text-3xl font-bold text-green-600">{sentimentSummary.positivePct}%</p>
                </CardContent></Card>
                <Card><CardContent className="p-5 text-center">
                  <p className="text-sm text-gray-600 mb-1">Negative</p>
                  <p className="text-3xl font-bold text-red-500">{sentimentSummary.negativePct}%</p>
                </CardContent></Card>
              </div>
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold mb-4">All Vendors — Customer Sentiment</h3>
                  <div className="space-y-3">
                    {sentimentByVendor.map((vendor: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3 flex-1">
                          <span className="text-sm font-bold text-gray-400 w-6">#{index + 1}</span>
                          <div>
                            <p className="font-medium text-gray-900">{vendor.vendor}</p>
                            <p className="text-xs text-gray-500">{vendor.totalReviews} reviews &middot; Avg {vendor.avgRating}/5</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-32 bg-gray-200 rounded-full h-2.5">
                            <div className={`h-2.5 rounded-full ${vendor.positivePct >= 70 ? 'bg-green-500' : vendor.positivePct >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${vendor.positivePct}%` }} />
                          </div>
                          <span className={`text-sm font-bold w-14 text-right ${vendor.positivePct >= 70 ? 'text-green-600' : 'text-red-600'}`}>{vendor.positivePct}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Forecast */}
            <TabsContent value="forecast" className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold mb-2">Demand Forecast — Orders by Hour</h3>
                  <p className="text-sm text-gray-500 mb-6">Current vs predicted orders per hour across all events</p>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={predictions.demandForecast} id="admin-demand-chart">
                      <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis key="xaxis" dataKey="hour" stroke="#6b7280" />
                      <YAxis key="yaxis" stroke="#6b7280" />
                      <Tooltip key="tooltip" contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                      <Legend key="legend" />
                      <Bar key="current-bar" dataKey="currentOrders" fill="#e5e7eb" name="Current Avg" radius={[4, 4, 0, 0]} />
                      <Bar key="predicted-bar" dataKey="predictedOrders" fill="#8b5cf6" name="Predicted" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-bold mb-2">Cashless Adoption by Category</h3>
                    <p className="text-sm text-gray-500 mb-4">Current vs predicted cashless rate</p>
                    <div className="space-y-3">
                      {predictions.cashlessByCategory.map((cat: any, i: number) => (
                        <div key={i} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium text-gray-900">{cat.category}</p>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-gray-500">{cat.currentPct}%</span>
                              <ArrowUp className="w-3 h-3 text-green-500" />
                              <span className="font-bold text-green-600">{cat.predictedPct}%</span>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${cat.predictedPct}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-bold mb-2">Vendor Revenue Forecast</h3>
                    <p className="text-sm text-gray-500 mb-4">Projected revenue for top vendors</p>
                    <div className="space-y-3">
                      {predictions.adminVendorForecast.map((v: any, i: number) => (
                        <div key={i} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium text-gray-900">{v.vendor}</p>
                            <Badge className="bg-green-100 text-green-800 border-green-200">{v.growth}</Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Current: ${v.currentRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                            <span className="font-bold text-green-600">Projected: ${v.predictedRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
