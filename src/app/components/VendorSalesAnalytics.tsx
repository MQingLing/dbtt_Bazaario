import VendorNav from './VendorNav';
import { User } from '../App';
import { Card, CardContent } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, ShoppingBag, Users, ArrowUp, ArrowDown } from 'lucide-react';

interface VendorSalesAnalyticsProps {
  user: User;
  onLogout: () => void;
}

export default function VendorSalesAnalytics({ user, onLogout }: VendorSalesAnalyticsProps) {
  const salesData = [
    { id: 1, date: 'Mon', sales: 245, orders: 15 },
    { id: 2, date: 'Tue', sales: 312, orders: 18 },
    { id: 3, date: 'Wed', sales: 289, orders: 16 },
    { id: 4, date: 'Thu', sales: 425, orders: 24 },
    { id: 5, date: 'Fri', sales: 512, orders: 32 },
    { id: 6, date: 'Sat', sales: 678, orders: 42 },
    { id: 7, date: 'Sun', sales: 589, orders: 38 }
  ];

  const productData = [
    { name: 'Chicken Satay', value: 360, count: 45 },
    { name: 'Beef Satay', value: 320, count: 32 },
    { name: 'Mixed Platter', value: 450, count: 18 },
    { name: 'Lamb Satay', value: 216, count: 18 },
    { name: 'Extras', value: 120, count: 60 }
  ];

  const hourlyData = [
    { id: 1, hour: '6PM', orders: 5 },
    { id: 2, hour: '7PM', orders: 12 },
    { id: 3, hour: '8PM', orders: 18 },
    { id: 4, hour: '9PM', orders: 15 },
    { id: 5, hour: '10PM', orders: 10 },
    { id: 6, hour: '11PM', orders: 6 },
  ];

  const COLORS = ['#f97316', '#ec4899', '#8b5cf6', '#06b6d4', '#10b981'];

  const stats = [
    { label: 'Total Revenue', value: '$4,532.00', change: '+12.5%', positive: true, icon: DollarSign, color: 'text-green-600' },
    { label: 'Total Orders', value: '185', change: '+8.3%', positive: true, icon: ShoppingBag, color: 'text-blue-600' },
    { label: 'Avg Order Value', value: '$24.50', change: '-2.1%', positive: false, icon: TrendingUp, color: 'text-orange-600' },
    { label: 'Customers', value: '342', change: '+15.2%', positive: true, icon: Users, color: 'text-purple-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <VendorNav user={user} onLogout={onLogout} />

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sales Analytics</h1>
          <p className="text-gray-600">Track your performance and insights</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                  <div className={`flex items-center gap-1 text-sm ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.positive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                    <span>{stat.change}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Tabs defaultValue="revenue" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="hourly">Peak Hours</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="space-y-6">
            {/* Sales Trend */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-6">Weekly Sales Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesData} id="vendor-sales-chart">
                    <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis key="xaxis" dataKey="date" stroke="#6b7280" />
                    <YAxis key="yaxis" stroke="#6b7280" />
                    <Tooltip
                      key="tooltip"
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    />
                    <Legend key="legend" />
                    <Line key="sales-line" type="monotone" dataKey="sales" stroke="#f97316" strokeWidth={3} name="Sales ($)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Orders Trend */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-6">Weekly Orders</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salesData} id="vendor-orders-chart">
                    <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis key="xaxis" dataKey="date" stroke="#6b7280" />
                    <YAxis key="yaxis" stroke="#6b7280" />
                    <Tooltip
                      key="tooltip"
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    />
                    <Legend key="legend" />
                    <Bar key="orders-bar" dataKey="orders" fill="#ec4899" name="Orders" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Product Revenue Distribution */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-6">Revenue by Product</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart id="vendor-revenue-pie">
                      <Pie
                        key="revenue-pie"
                        data={productData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {productData.map((entry, index) => (
                          <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip key="tooltip" />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Top Products List */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-6">Top Selling Products</h3>
                  <div className="space-y-4">
                    {productData.map((product, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <div>
                            <p className="font-medium text-gray-900">{product.name}</p>
                            <p className="text-sm text-gray-500">{product.count} sold</p>
                          </div>
                        </div>
                        <p className="font-bold text-orange-600">${product.value.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="hourly" className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-6">Orders by Hour</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={hourlyData} id="vendor-hourly-chart">
                    <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis key="xaxis" dataKey="hour" stroke="#6b7280" />
                    <YAxis key="yaxis" stroke="#6b7280" />
                    <Tooltip
                      key="tooltip"
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    />
                    <Bar key="hourly-orders-bar" dataKey="orders" fill="#8b5cf6" name="Orders" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold mb-4">Peak Hours Insights</h3>
                <div className="space-y-3">
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <p className="font-medium text-orange-900">Busiest Hour: 8:00 PM - 9:00 PM</p>
                    <p className="text-sm text-orange-700 mt-1">Average of 18 orders during this period</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="font-medium text-blue-900">Slowest Hour: 6:00 PM - 7:00 PM</p>
                    <p className="text-sm text-blue-700 mt-1">Consider running promotions during this time</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-6">Business Insights</h3>
                <div className="space-y-4">
                  <div className="p-4 border-l-4 border-green-500 bg-green-50">
                    <div className="flex items-start gap-3">
                      <TrendingUp className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-900">Revenue Growth</p>
                        <p className="text-sm text-green-700 mt-1">Your revenue increased by 12.5% this week compared to last week</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border-l-4 border-blue-500 bg-blue-50">
                    <div className="flex items-start gap-3">
                      <ShoppingBag className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-900">Order Volume</p>
                        <p className="text-sm text-blue-700 mt-1">185 orders this week. Weekend shows 45% higher orders than weekdays</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border-l-4 border-purple-500 bg-purple-50">
                    <div className="flex items-start gap-3">
                      <Users className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-purple-900">Customer Retention</p>
                        <p className="text-sm text-purple-700 mt-1">68% of your customers are repeat buyers. Great job!</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border-l-4 border-orange-500 bg-orange-50">
                    <div className="flex items-start gap-3">
                      <DollarSign className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-orange-900">Average Order Value</p>
                        <p className="text-sm text-orange-700 mt-1">$24.50 per order. Consider bundling items to increase this metric</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
