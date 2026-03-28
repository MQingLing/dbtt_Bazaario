import { useMemo } from 'react';
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

// Normalised shape used in the Reviews tab
interface NormReview {
  id: string;
  customer: string;
  content: string;
  rating: number;
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  isLive: boolean; // submitted via customer portal
  date?: string;
}

/** Collect every user-submitted review from localStorage (all stalls) */
function getLiveReviews(): NormReview[] {
  const out: NormReview[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith('bazaario_reviews_')) continue;
      const arr = JSON.parse(localStorage.getItem(key)!);
      for (const r of arr) {
        if (!r.id?.startsWith('user-')) continue; // skip seeded
        const s = r.sentiment as string;
        out.push({
          id:       r.id,
          customer: r.authorName ?? 'Customer',
          content:  r.comment ?? '',
          rating:   r.rating,
          sentiment: s === 'positive' ? 'POSITIVE' : s === 'negative' ? 'NEGATIVE' : 'NEUTRAL',
          isLive:   true,
          date:     r.date,
        });
      }
    }
  } catch { /* localStorage unavailable */ }
  return out;
}

export default function VendorSalesAnalytics({ user, onLogout }: VendorSalesAnalyticsProps) {
  const liveReviews = useMemo(getLiveReviews, []);
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
                <h3 className="text-xl font-bold mb-6">Your Sales This Week</h3>
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
                <h3 className="text-xl font-bold mb-6">Orders This Week</h3>
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
                  <h3 className="text-xl font-bold mb-6">Which Items Earn the Most</h3>
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
                <h3 className="text-xl font-bold mb-6">When Are You Busiest?</h3>
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
                <h3 className="font-bold mb-4">Your Busiest &amp; Slowest Hours</h3>
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
                <h3 className="text-xl font-bold mb-6">How Your Stall Is Doing</h3>
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
            {(() => {
              // Normalise static reviews to NormReview shape
              const staticNorm: NormReview[] = vendorOwnReviews.map((r: any) => ({
                id:       String(r.id),
                customer: r.customer,
                content:  r.content,
                rating:   r.rating,
                sentiment: r.sentiment as 'POSITIVE' | 'NEGATIVE',
                isLive:   false,
              }));

              // Live reviews first, then static
              const allReviews: NormReview[] = [...liveReviews, ...staticNorm];
              const total     = vendorOwnSentiment.totalReviews + liveReviews.length;
              const livePos   = liveReviews.filter(r => r.sentiment === 'POSITIVE').length;
              const liveNeg   = liveReviews.filter(r => r.sentiment === 'NEGATIVE').length;
              const totalPos  = Math.round(vendorOwnSentiment.positivePct / 100 * vendorOwnSentiment.totalReviews) + livePos;
              const totalNeg  = Math.round(vendorOwnSentiment.negativePct / 100 * vendorOwnSentiment.totalReviews) + liveNeg;
              const positivePct = total > 0 ? ((totalPos / total) * 100).toFixed(1) : vendorOwnSentiment.positivePct;
              const negativePct = total > 0 ? ((totalNeg / total) * 100).toFixed(1) : vendorOwnSentiment.negativePct;
              const liveAvg  = liveReviews.length
                ? liveReviews.reduce((s, r) => s + r.rating, 0) / liveReviews.length : 0;
              const avgRating = liveReviews.length
                ? ((vendorOwnSentiment.avgRating * vendorOwnSentiment.totalReviews + liveAvg * liveReviews.length) / total).toFixed(1)
                : vendorOwnSentiment.avgRating;

              const sentimentColor = (s: string) => {
                if (s === 'POSITIVE') return 'bg-green-100 text-green-800 border-green-200';
                if (s === 'NEGATIVE') return 'bg-red-100 text-red-800 border-red-200';
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
              };
              const sentimentIcon = (s: string) =>
                s === 'POSITIVE' ? <><ThumbsUp className="w-3 h-3 mr-1" />Positive</> :
                s === 'NEGATIVE' ? <><ThumbsDown className="w-3 h-3 mr-1" />Negative</> :
                                   <>😐 Neutral</>;

              return (
                <>
                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card><CardContent className="p-4 text-center">
                      <p className="text-sm text-gray-600 mb-1">Total Reviews</p>
                      <p className="text-2xl font-bold">{total}</p>
                      {liveReviews.length > 0 && (
                        <p className="text-xs text-orange-500 mt-0.5">+{liveReviews.length} live</p>
                      )}
                    </CardContent></Card>
                    <Card><CardContent className="p-4 text-center">
                      <p className="text-sm text-gray-600 mb-1">Average Rating</p>
                      <div className="flex items-center justify-center gap-1">
                        <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                        <p className="text-2xl font-bold">{avgRating}</p>
                      </div>
                    </CardContent></Card>
                    <Card><CardContent className="p-4 text-center">
                      <p className="text-sm text-gray-600 mb-1">Positive</p>
                      <p className="text-2xl font-bold text-green-600">{positivePct}%</p>
                    </CardContent></Card>
                    <Card><CardContent className="p-4 text-center">
                      <p className="text-sm text-gray-600 mb-1">Negative</p>
                      <p className="text-2xl font-bold text-red-500">{negativePct}%</p>
                    </CardContent></Card>
                  </div>

                  {/* Sentiment breakdown bar */}
                  <Card>
                    <CardContent className="p-5">
                      <h3 className="font-bold text-gray-900 mb-3">Customer Feedback</h3>
                      <div className="flex rounded-full overflow-hidden h-4 mb-2">
                        <div className="bg-green-500 transition-all" style={{ width: `${positivePct}%` }} />
                        <div className="bg-yellow-400 transition-all" style={{ width: `${100 - Number(positivePct) - Number(negativePct)}%` }} />
                        <div className="bg-red-400 transition-all" style={{ width: `${negativePct}%` }} />
                      </div>
                      <div className="flex gap-4 text-xs text-gray-600">
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />Positive {positivePct}%</span>
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block" />Neutral {(100 - Number(positivePct) - Number(negativePct)).toFixed(1)}%</span>
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />Negative {negativePct}%</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Review list */}
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-5">Customer Reviews</h3>
                      <div className="space-y-4">
                        {allReviews.slice(0, 12).map(review => (
                          <div key={review.id} className={`p-4 rounded-xl border ${review.isLive ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-transparent'}`}>
                            <div className="flex items-start justify-between mb-2 flex-wrap gap-2">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${review.isLive ? 'bg-orange-500' : 'bg-gray-400'}`}>
                                  {review.customer[0]}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium text-gray-900 text-sm">{review.customer}</p>
                                    {review.isLive && (
                                      <span className="text-[10px] font-semibold bg-orange-500 text-white px-1.5 py-0.5 rounded-full">Live</span>
                                    )}
                                    {review.date && <span className="text-xs text-gray-400">{review.date}</span>}
                                  </div>
                                  <div className="flex items-center gap-0.5 mt-0.5">
                                    {[...Array(5)].map((_, i) => (
                                      <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}`} />
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <Badge className={sentimentColor(review.sentiment)}>
                                {sentimentIcon(review.sentiment)}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 ml-11 leading-relaxed">{review.content}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              );
            })()}
          </TabsContent>

          {/* ── Insights Tab ── */}
          <TabsContent value="insights" className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2">Expected Revenue This Week</h3>
                <p className="text-sm text-gray-500 mb-6">What you're likely to earn each day based on your past sales</p>
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
                  Based on your past sales patterns. <strong>Weekends consistently show higher revenue.</strong> Consider preparing extra stock for Friday to Sunday.
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold mb-4">Customer Satisfaction Trend</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={predictions.sentimentTrend} id="vendor-sent-trend">
                      <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis key="xaxis" dataKey="week" stroke="#6b7280" />
                      <YAxis key="yaxis" stroke="#6b7280" domain={[0, 100]} />
                      <Tooltip key="tooltip" contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                      <Legend key="legend" />
                      <Line key="pos-line" type="monotone" dataKey="positive" stroke="#10b981" strokeWidth={2} name="Happy customers %" />
                      <Line key="neg-line" type="monotone" dataKey="negative" stroke="#ef4444" strokeWidth={2} name="Unhappy customers %" />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2">
                    {predictions.sentimentTrend.map((w: any, i: number) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{w.week}</span>
                        <div className="flex gap-3">
                          <span className="text-green-600 font-medium">{w.positive}% happy</span>
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
                  <h3 className="font-bold mb-4">What the data tells us</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800 mb-1">Cashless Payments</p>
                      <p className="text-2xl font-bold text-blue-900">{mlResults.cashlessAdoption.accuracy}%</p>
                      <p className="text-xs text-blue-700 mt-1">of your customers are expected to pay via wallet or QR code</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-800 mb-1">Revenue Forecast</p>
                      <p className="text-2xl font-bold text-green-900">Fri-Sun highest</p>
                      <p className="text-xs text-green-700 mt-1">Weekends consistently earn more. Plan your stock and staffing accordingly.</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <p className="text-sm text-purple-800 mb-1">Review Analysis</p>
                      <p className="text-2xl font-bold text-purple-900">{mlResults.sentimentAnalysis.accuracy}% accurate</p>
                      <p className="text-xs text-purple-700 mt-1">We automatically detect whether customer reviews are positive or negative</p>
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
