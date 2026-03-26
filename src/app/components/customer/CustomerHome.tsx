import { Link } from 'react-router';
import { useRef, useEffect, useState } from 'react';
import CustomerNav from './CustomerNav';
import { User } from '../../App';
import { Card, CardContent } from '../shared/card';
import { Badge } from '../shared/badge';
import { Button } from '../shared/button';
import { Calendar, MapPin, TrendingUp, Sparkles, Clock, Users, ChevronRight, Gift, Wallet, Star } from 'lucide-react';
import { pasarMalamEvents, getEventStatus } from '../../data/pasarMalamData';
import { getEventVendors } from '../../data/vendors';

interface CustomerHomeProps {
  user: User;
  onLogout: () => void;
}

const EVENT_IMAGES = [
  'https://images.unsplash.com/photo-1763621470208-efe14b618119?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaW5nYXBvcmUlMjBuaWdodCUyMG1hcmtldCUyMGZvb2QlMjBzdGFsbHN8ZW58MXx8fHwxNzcyNzE4OTUzfDA&ixlib=rb-4.1.0&q=80&w=1080',
  'https://images.unsplash.com/photo-1771804359368-0f91f81ee83b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMHN0cmVldCUyMGZvb2QlMjBjb2xvcmZ1bHxlbnwxfHx8fDE3NzI3MTg5NTR8MA&ixlib=rb-4.1.0&q=80&w=1080',
  'https://images.unsplash.com/photo-1768900318217-4c7677ffc2c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuaWdodCUyMG1hcmtldCUyMGxhbnRlcm5zJTIwYXNpYXxlbnwxfHx8fDE3NzI3MTg5NTR8MA&ixlib=rb-4.1.0&q=80&w=1080',
];

// ── Vendor images by category (reused for promo cards) ───────────────────────
const PROMO_IMAGES: Record<string, string> = {
  'Hot Food':              'https://images.unsplash.com/photo-1722704689022-98d1b7795589?w=800&q=80',
  'Drinks':                'https://images.unsplash.com/photo-1670468642364-6cacadfb7bb0?w=800&q=80',
  'Desserts':              'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800&q=80',
  'Snacks':                'https://images.unsplash.com/photo-1738599935343-991708a2895b?w=800&q=80',
  'Trendy Food':           'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80',
  'Household Items':       'https://images.unsplash.com/photo-1724709166740-96947d362a17?w=800&q=80',
  'Games & Entertainment': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80',
};

const PROMO_TAGLINES: Record<string, string[]> = {
  'Hot Food':              ['Freshly grilled, right for you', 'Bold flavours, every bite'],
  'Drinks':                ['Sip something special tonight', 'Refreshing drinks, only here'],
  'Desserts':              ['Sweet treats you can\'t resist', 'End your night on a sweet note'],
  'Snacks':                ['Crispy, crunchy, irresistible', 'The perfect market snack'],
  'Trendy Food':           ['Trending now at the bazaar', 'Try something new tonight'],
  'Household Items':       ['Unique finds, one-of-a-kind', 'Take home something special'],
  'Games & Entertainment': ['Win big, play all night', 'Fun for the whole family'],
};

/** Pick promoted vendors: growth-tier eligible = top-rated stalls (rating ≥ 4.5) */
function getPromotedVendors() {
  const results: { vendorId: string; vendorName: string; category: string; rating: number; stall: string; eventId: string; eventName: string; tagline: string }[] = [];
  for (const event of pasarMalamEvents) {
    if (getEventStatus(event) === 'completed') continue;
    for (const v of getEventVendors(event.id)) {
      if (v.rating < 4.5) continue; // growth+ threshold
      const pool = PROMO_TAGLINES[v.category] ?? PROMO_TAGLINES['Hot Food'];
      const tagline = pool[parseInt(v.id.replace(/\D/g, '')) % pool.length];
      results.push({ vendorId: v.id, vendorName: v.name, category: v.category, rating: v.rating, stall: v.stall, eventId: event.id, eventName: event.name, tagline });
    }
  }
  // Deduplicate by name, cap at 8
  const seen = new Set<string>();
  return results.filter(r => seen.has(r.vendorName) ? false : (seen.add(r.vendorName), true)).slice(0, 8);
}

function PromoCarousel() {
  const slides = useRef(getPromotedVendors()).current;
  const [active, setActive] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = (idx: number) => setActive((idx + slides.length) % slides.length);

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setActive(a => (a + 1) % slides.length), 3500);
  };

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides.length]);

  if (slides.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-orange-500" />
        <h3 className="text-xl font-bold text-gray-900">Featured Partners</h3>
      </div>

      <div className="relative rounded-2xl overflow-hidden shadow-lg" style={{ height: 200 }}>
        {/* Sliding track — all slides rendered side-by-side */}
        <div
          className="flex h-full"
          style={{
            width: `${slides.length * 100}%`,
            transform: `translateX(-${(active / slides.length) * 100}%)`,
            transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {slides.map((s) => {
            const img = PROMO_IMAGES[s.category] ?? PROMO_IMAGES['Hot Food'];
            return (
              <div key={s.vendorId} className="relative h-full flex-shrink-0" style={{ width: `${100 / slides.length}%` }}>
                <img src={img} alt={s.vendorName} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-center px-6 text-white">
                  <Badge className="bg-orange-500 w-fit mb-2 text-[10px]">{s.category}</Badge>
                  <h4 className="text-2xl font-extrabold leading-tight mb-1">{s.vendorName}</h4>
                  <p className="text-sm text-white/80 mb-3">{s.tagline}</p>
                  <div className="flex items-center gap-3">
                    <Link to={`/customer/vendor/${s.vendorId}`}>
                      <Button size="sm" className="bg-white text-gray-900 hover:bg-gray-100 font-semibold text-xs">
                        Visit Stall →
                      </Button>
                    </Link>
                    <span className="flex items-center gap-1 text-xs text-white/70">
                      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                      {s.rating.toFixed(1)} · Stall {s.stall}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>



        {/* Dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => { go(i); resetTimer(); }}
              className={`rounded-full transition-all duration-300 ${i === active ? 'w-5 h-2 bg-white' : 'w-2 h-2 bg-white/40'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CustomerHome({ user, onLogout }: CustomerHomeProps) {
  const STATUS_ORDER = { ongoing: 0, upcoming: 1, completed: 2 };

  // Featured events: live first, then upcoming, then past
  const featuredEvents = (() => {
    const featured = pasarMalamEvents.filter(e => e.featured);
    const pool = featured.length >= 3
      ? featured
      : [
          ...featured,
          ...pasarMalamEvents
            .filter(e => !e.featured && (getEventStatus(e) === 'ongoing' || getEventStatus(e) === 'upcoming'))
            .slice(0, 3 - featured.length),
        ];
    return pool
      .slice(0, 3)
      .sort((a, b) => STATUS_ORDER[getEventStatus(a)] - STATUS_ORDER[getEventStatus(b)]);
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
                      <div className="font-bold">{user.loyaltyStamps ?? 0} / 10</div>
                    </div>
                  </div>
                </div>
              </div>
              <Sparkles className="w-12 h-12 text-white/20" />
            </div>
          </CardContent>
        </Card>

        {/* Promo Carousel */}
        <PromoCarousel />

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6">
          {quickActions.map((action, index) => (
            <Link key={index} to={action.link} className="block h-full">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardContent className="p-4 text-center h-full flex flex-col items-center justify-center">
                  <div className={`${action.color} w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 flex-shrink-0`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm font-medium text-gray-700 leading-tight">{action.label}</p>
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

          <div className="grid md:grid-cols-3 gap-4 items-stretch">
            {featuredEvents.map((event) => {
              const status = getEventStatus(event);
              const vendors = getEventVendors(event.id);
              const image = EVENT_IMAGES[parseInt(event.id) % EVENT_IMAGES.length];
              return (
                <Link key={event.id} to={`/customer/events/${event.id}`} className="flex">
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer flex flex-col w-full">
                    <div className="relative h-44 shrink-0">
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
                    <CardContent className="p-4 flex flex-col flex-1">
                      <h4 className="font-bold text-gray-900 mb-2 line-clamp-2">{event.name}</h4>
                      <div className="space-y-1 text-sm text-gray-600 mt-auto">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 shrink-0" />
                          <span className="truncate">{event.area}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 shrink-0" />
                          <span>{new Date(event.startDate).toLocaleDateString('en-SG', { day: 'numeric', month: 'short' })} – {new Date(event.endDate).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 shrink-0" />
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
