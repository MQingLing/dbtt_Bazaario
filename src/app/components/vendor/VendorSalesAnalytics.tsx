import VendorNav from './VendorNav';
import { User } from '../../App';
import { Card, CardContent } from '../shared/card';
import { Badge } from '../shared/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../shared/tabs';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, ShoppingBag, Users, ArrowUp, ArrowDown, Star, ThumbsUp, ThumbsDown } from 'lucide-react';
import { vendorOwnReviews, vendorOwnSentiment, mlResults, predictions } from '../../data/analyticsData';

interface VendorSalesAnalyticsProps {
  user: User;
  onLogout: () => void;
}

export default function VendorSalesAnalytics({ user, onLogout }: VendorSalesAnalyticsProps) {
  const salesData = [
    { id: 1, date: 'Mon', sales: 460, orders: 38 },
    { id: 2, date: 'Tue', sales: 520, orders: 43 },
    { id: 3, date: 'Wed', sales: 490, orders: 41 },
    { id: 4, date: 'Thu', sales: 580, orders: 48 },
    { id: 5, date: 'Fri', sales: 800, orders: 67 },
    { id: 6, date: 'Sat', sales: 960, orders: 80 },
    { id: 7, date: 'Sun', sales: 839, orders: 70 }
  ];

  const productData = [
    { name: 'Chicken Satay', value: 880, count: 110 },
    { name: 'Beef Satay', value: 620, count: 62 },
    { name: 'Mixed Satay Platter', value: 500, count: 20 },
    { name: 'Satay Sauce', value: 180, count: 90 },
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
    { label: 'Total Revenue', value: '$4,649.00', change: '+12.3%', positive: true, icon: DollarSign, color: 'text-green-600' },
    { label: 'Total Orders', value: '387', change: '+11.8%', positive: true, icon: ShoppingBag, color: 'text-blue-600' },
    { label: 'Avg Order Value', value: '$12.01', change: '+0.4%', positive: true, icon: TrendingUp, color: 'text-orange-600' },
    { label: 'Customers', value: '156', change: '+9.5%', positive: true, icon: Users, color: 'text-purple-600' },
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
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="hourly">Peak Hours</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
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
                        <p className="text-sm text-green-700 mt-1">Your revenue increased by 12.3% this week compared to last week</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border-l-4 border-blue-500 bg-blue-50">
                    <div className="flex items-start gap-3">
                      <ShoppingBag className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-900">Order Volume</p>
                        <p className="text-sm text-blue-700 mt-1">387 orders this week. Weekend shows higher orders than weekdays</p>
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
                        <p className="text-sm text-orange-700 mt-1">$12.01 per order. Consider bundling items to increase this metric</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Reviews Tab ── */}
          <TabsContent value="reviews" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card><CardContent className="p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">Total Reviews</p>
                <p className="text-2xl font-bold">{vendorOwnSentiment.totalReviews}</p>
              </CardContent></Card>
              <Card><CardContent className="p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">Average Rating</p>
                <div className="flex items-center justify-center gap-1">
                  <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                  <p className="text-2xl font-bold">{vendorOwnSentiment.avgRating}</p>
                </div>
              </CardContent></Card>
              <Card><CardContent className="p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">Positive</p>
                <p className="text-2xl font-bold text-green-600">{vendorOwnSentiment.positivePct}%</p>
              </CardContent></Card>
              <Card><CardContent className="p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">Negative</p>
                <p className="text-2xl font-bold text-red-500">{vendorOwnSentiment.negativePct}%</p>
              </CardContent></Card>
            </div>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-6">Recent Customer Reviews</h3>
                <div className="space-y-4">
                  {vendorOwnReviews.slice(0, 10).map((review: any) => (
                    <div key={review.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {review.customer[0]}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{review.customer}</p>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}`} />
                              ))}
                            </div>
                          </div>
                        </div>
                        <Badge className={review.sentiment === 'POSITIVE' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}>
                          {review.sentiment === 'POSITIVE'
                            ? <><ThumbsUp className="w-3 h-3 mr-1" /> Positive</>
                            : <><ThumbsDown className="w-3 h-3 mr-1" /> Negative</>}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 ml-11">{review.content}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Insights Tab ── */}
          <TabsContent value="insights" className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2">Revenue Forecast — Next 7 Days</h3>
                <p className="text-sm text-gray-500 mb-6">Predicted vs actual daily revenue based on historical trends</p>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={predictions.vendorForecast} id="vendor-forecast-chart">
                    <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis key="xaxis" dataKey="day" stroke="#6b7280" />
                    <YAxis key="yaxis" stroke="#6b7280" />
                    <Tooltip key="tooltip" contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                    <Legend key="legend" />
                    <Bar key="actual-bar" dataKey="actual" fill="#e5e7eb" name="Current Avg ($)" radius={[4, 4, 0, 0]} />
                    <Bar key="predicted-bar" dataKey="predicted" fill="#f97316" name="Predicted ($)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 p-3 bg-orange-50 rounded-lg text-sm text-orange-800">
                  Forecast accuracy: R&sup2; = {mlResults.regression.r2Score} (margin: &plusmn;${mlResults.regression.mae}/day). Weekends consistently show higher predicted revenue.
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold mb-4">Sentiment Trend</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={predictions.sentimentTrend} id="vendor-sent-trend">
                      <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis key="xaxis" dataKey="week" stroke="#6b7280" />
                      <YAxis key="yaxis" stroke="#6b7280" domain={[0, 100]} />
                      <Tooltip key="tooltip" contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                      <Legend key="legend" />
                      <Line key="pos-line" type="monotone" dataKey="positive" stroke="#10b981" strokeWidth={2} name="Positive %" />
                      <Line key="neg-line" type="monotone" dataKey="negative" stroke="#ef4444" strokeWidth={2} name="Negative %" />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2">
                    {predictions.sentimentTrend.map((w: any, i: number) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{w.week}</span>
                        <div className="flex gap-3">
                          <span className="text-green-600 font-medium">{w.positive}% pos</span>
                          <span className="text-gray-400">|</span>
                          <span className="text-gray-500">{w.reviews} reviews</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold mb-4">Predicted Trends</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800 mb-1">Cashless Adoption</p>
                      <p className="text-2xl font-bold text-blue-900">{mlResults.classification.accuracy}%</p>
                      <p className="text-xs text-blue-700 mt-1">of transactions predicted cashless based on time, category &amp; region</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-800 mb-1">Revenue Forecast</p>
                      <p className="text-2xl font-bold text-green-900">R&sup2; = {mlResults.regression.r2Score}</p>
                      <p className="text-xs text-green-700 mt-1">Daily revenue predicted within &plusmn;${mlResults.regression.mae} margin</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <p className="text-sm text-purple-800 mb-1">Sentiment Detection</p>
                      <p className="text-2xl font-bold text-purple-900">{mlResults.sentimentAnalysis.accuracy}%</p>
                      <p className="text-xs text-purple-700 mt-1">accuracy auto-classifying reviews as positive or negative</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
