import { Link } from 'react-router';
import CustomerNav from './CustomerNav';
import { User } from '../App';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Calendar, MapPin, TrendingUp, Sparkles, Clock, Users, ChevronRight, Gift, Wallet } from 'lucide-react';
import { pasarMalamEvents, getEventStatus } from '../data/pasarMalamData';
import { getEventVendors } from '../data/vendors';

interface CustomerHomeProps {
  user: User;
  onLogout: () => void;
}

const EVENT_IMAGES = [
  'https://images.unsplash.com/photo-1763621470208-efe14b618119?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaW5nYXBvcmUlMjBuaWdodCUyMG1hcmtldCUyMGZvb2QlMjBzdGFsbHN8ZW58MXx8fHwxNzcyNzE4OTUzfDA&ixlib=rb-4.1.0&q=80&w=1080',
  'https://images.unsplash.com/photo-1771804359368-0f91f81ee83b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMHN0cmVldCUyMGZvb2QlMjBjb2xvcmZ1bHxlbnwxfHx8fDE3NzI3MTg5NTR8MA&ixlib=rb-4.1.0&q=80&w=1080',
  'https://images.unsplash.com/photo-1768900318217-4c7677ffc2c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuaWdodCUyMG1hcmtldCUyMGxhbnRlcm5zJTIwYXNpYXxlbnwxfHx8fDE3NzI3MTg5NTR8MA&ixlib=rb-4.1.0&q=80&w=1080',
];

export default function CustomerHome({ user, onLogout }: CustomerHomeProps) {
  // Featured events: explicitly marked ones first, then top ongoing/upcoming
  const featuredEvents = (() => {
    const featured = pasarMalamEvents.filter(e => e.featured);
    if (featured.length >= 3) return featured.slice(0, 3);
    const others = pasarMalamEvents
      .filter(e => !e.featured && (getEventStatus(e) === 'ongoing' || getEventStatus(e) === 'upcoming'))
      .slice(0, 3 - featured.length);
    return [...featured, ...others];
  })();

  const quickActions = [
    { icon: Calendar, label: 'Browse Events', link: '/customer/events', color: 'bg-orange-500' },
    { icon: Wallet, label: 'Top Up Wallet', link: '/customer/wallet', color: 'bg-pink-500' },
    { icon: Gift, label: 'My Rewards', link: '/customer/loyalty', color: 'bg-purple-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <CustomerNav user={user} onLogout={onLogout} />

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Welcome Banner */}
        <Card className="mb-6 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white border-0 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">Welcome back, {user.name.split(' ')[0]}! 👋</h2>
                <p className="text-white/90 mb-4">Discover amazing food and products at Singapore's vibrant night markets</p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-2">
                    <Wallet className="w-5 h-5" />
                    <div>
                      <div className="text-xs text-white/80">Wallet Balance</div>
                      <div className="font-bold">${user.walletBalance?.toFixed(2)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-2">
                    <Gift className="w-5 h-5" />
                    <div>
                      <div className="text-xs text-white/80">Loyalty Stamps</div>
                      <div className="font-bold">{user.loyaltyStamps} / 10</div>
                    </div>
                  </div>
                </div>
              </div>
              <Sparkles className="w-12 h-12 text-white/20" />
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {quickActions.map((action, index) => (
            <Link key={index} to={action.link}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4 text-center">
                  <div className={`${action.color} w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">{action.label}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Featured Events */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">Featured Events</h3>
            <Link to="/customer/events">
              <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700">
                View All
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {featuredEvents.map((event) => {
              const status = getEventStatus(event);
              const vendors = getEventVendors(event.id);
              const image = EVENT_IMAGES[parseInt(event.id) % EVENT_IMAGES.length];
              return (
                <Link key={event.id} to={`/customer/events/${event.id}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="relative h-40">
                      <img src={image} alt={event.name} className="w-full h-full object-cover" />
                      <Badge
                        className={`absolute top-3 right-3 ${
                          status === 'ongoing'
                            ? 'bg-green-500 hover:bg-green-600'
                            : status === 'upcoming'
                            ? 'bg-blue-500 hover:bg-blue-600'
                            : 'bg-gray-500 hover:bg-gray-600'
                        }`}
                      >
                        {status === 'ongoing' ? 'Live Now' : status === 'upcoming' ? 'Upcoming' : 'Past'}
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <h4 className="font-bold text-gray-900 mb-2">{event.name}</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{event.area}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(event.startDate).toLocaleDateString('en-SG', { day: 'numeric', month: 'short' })} – {new Date(event.endDate).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>{vendors.length} vendors</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Trending Vendors — top-rated from ongoing events */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            <h3 className="text-xl font-bold text-gray-900">Trending Vendors</h3>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            {(() => {
              const VENDOR_IMAGES_MAP: Record<string, string> = {
                'Hot Food': 'https://images.unsplash.com/photo-1722704689022-98d1b7795589?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYXRheSUyMGZvb2QlMjBzdGFsbHxlbnwxfHx8fDE3NzI3MTg5NTR8MA&ixlib=rb-4.1.0&q=80&w=400',
                'Drinks': 'https://images.unsplash.com/photo-1670468642364-6cacadfb7bb0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidWJibGUlMjB0ZWElMjBkcmlua3N8ZW58MXx8fHwxNzcyNzE0OTA5fDA&ixlib=rb-4.1.0&q=80&w=400',
                'Desserts': 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
                'Snacks': 'https://images.unsplash.com/photo-1738599935343-991708a2895b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmllZCUyMHNuYWNrcyUyMGZvb2R8ZW58MXx8fHwxNzcyNzE4OTU1fDA&ixlib=rb-4.1.0&q=80&w=400',
                'Trendy Food': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
                'Household Items': 'https://images.unsplash.com/photo-1724709166740-96947d362a17?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpc2FuJTIwaGFuZGljcmFmdHMlMjBtYXJrZXR8ZW58MXx8fHwxNzcyNzE4OTU2fDA&ixlib=rb-4.1.0&q=80&w=400',
                'Games & Entertainment': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
              };
              const ongoingEvent = pasarMalamEvents.find(e => getEventStatus(e) === 'ongoing') || pasarMalamEvents[0];
              const trendingVendors = getEventVendors(ongoingEvent.id)
                .sort((a, b) => b.rating - a.rating)
                .slice(0, 4);
              return trendingVendors.map(vendor => (
                <Link key={vendor.id} to={`/customer/vendor/${vendor.id}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="relative h-32">
                      <img src={VENDOR_IMAGES_MAP[vendor.category] || VENDOR_IMAGES_MAP['Hot Food']} alt={vendor.name} className="w-full h-full object-cover" />
                    </div>
                    <CardContent className="p-3">
                      <h4 className="font-bold text-sm text-gray-900">{vendor.name}</h4>
                      <p className="text-xs text-gray-500">{vendor.category}</p>
                    </CardContent>
                  </Card>
                </Link>
              ));
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
