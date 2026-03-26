import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router';
import CustomerNav from './CustomerNav';
import { User } from '../../App';
import { Card, CardContent } from '../shared/card';
import { Badge } from '../shared/badge';
import { Button } from '../shared/button';
import { Input } from '../shared/input';
import { getEventVendors, Vendor, VendorItem } from '../../data/vendors';
import { pasarMalamEvents, getEventStatus } from '../../data/pasarMalamData';
import {
  ArrowLeft, Star, MapPin, Clock, ShoppingCart, Plus, Minus,
  Bell, CheckCircle2, X, Phone, Mail, Package, Gamepad2, Map,
} from 'lucide-react';

interface VendorStorePageProps {
  user: User;
  onLogout: () => void;
}

// ~1 in 7 items are out of stock (seeded per vendor+item)
function hashStr(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h;
}
function isOutOfStock(vendorId: string, itemName: string): boolean {
  return (hashStr(vendorId + itemName) % 7) === 0;
}

const GAMES_CATEGORY = 'Games & Entertainment';

const CATEGORY_IMAGES: Record<string, string> = {
  'Hot Food':              'https://images.unsplash.com/photo-1722704689022-98d1b7795589?w=1080&q=80',
  'Drinks':                'https://images.unsplash.com/photo-1670468642364-6cacadfb7bb0?w=1080&q=80',
  'Desserts':              'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=1080&q=80',
  'Snacks':                'https://images.unsplash.com/photo-1738599935343-991708a2895b?w=1080&q=80',
  'Trendy Food':           'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1080&q=80',
  'Household Items':       'https://images.unsplash.com/photo-1724709166740-96947d362a17?w=1080&q=80',
  'Games & Entertainment': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1080&q=80',
};

const ITEM_IMAGES: Record<string, string> = {
  'Hot Food':              'https://images.unsplash.com/photo-1771804359368-0f91f81ee83b?w=400&q=80',
  'Drinks':                'https://images.unsplash.com/photo-1670468642364-6cacadfb7bb0?w=400&q=80',
  'Desserts':              'https://images.unsplash.com/photo-1488900128323-21503983a07e?w=400&q=80',
  'Snacks':                'https://images.unsplash.com/photo-1738599935343-991708a2895b?w=400&q=80',
  'Trendy Food':           'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80',
  'Household Items':       'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=400&q=80',
  'Games & Entertainment': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&q=80',
};

interface RemindEntry {
  userId: string; vendorId: string; itemName: string;
  contact: string; method: 'email' | 'phone'; savedAt: string;
}
function saveReminder(entry: RemindEntry) {
  const key = `bazaario_reminders_${entry.userId}`;
  const list: RemindEntry[] = JSON.parse(localStorage.getItem(key) || '[]');
  if (!list.find(r => r.vendorId === entry.vendorId && r.itemName === entry.itemName)) {
    list.unshift(entry);
    localStorage.setItem(key, JSON.stringify(list));
  }
}
function hasReminder(userId: string, vendorId: string, itemName: string): boolean {
  const list: RemindEntry[] = JSON.parse(localStorage.getItem(`bazaario_reminders_${userId}`) || '[]');
  return list.some(r => r.vendorId === vendorId && r.itemName === itemName);
}

// ── Category colour helpers (shared with PasarMalamMap) ──────────────────────
const MINI_CAT_COLOR: Record<string, string> = {
  Food:     '#f97316', // orange-500
  Drinks:   '#3b82f6', // blue-500
  Desserts: '#ec4899', // pink-500
  Products: '#a855f7', // purple-500
  Games:    '#10b981', // emerald-500
};
function stallColor(category: string): string {
  if (['Hot Food', 'Snacks', 'Trendy Food'].includes(category)) return MINI_CAT_COLOR.Food;
  if (category === 'Drinks')                                     return MINI_CAT_COLOR.Drinks;
  if (category === 'Desserts')                                   return MINI_CAT_COLOR.Desserts;
  if (category === 'Games & Entertainment')                      return MINI_CAT_COLOR.Games;
  return MINI_CAT_COLOR.Products;
}

// ── Mini Stall Map ──────────────────────────────────────────────────────────
// Build a compact SVG grid from all vendor stall labels.
// Stall label format: "A01", "B03" → row = letter, col = number
function MiniStallMap({ vendors, currentStall, eventId }: { vendors: Vendor[]; currentStall: string; eventId: string }) {
  const rows   = [...new Set(vendors.map(v => v.stall[0]))].sort();
  const maxCol = Math.max(...vendors.map(v => parseInt(v.stall.slice(1)) || 1));

  const CELL_W = 22;
  const CELL_H = 16;
  const GAP    = 3;
  const PAD    = 6;

  const svgW = PAD * 2 + maxCol * (CELL_W + GAP) - GAP;
  const svgH = PAD * 2 + rows.length * (CELL_H + GAP) - GAP + 16;

  // row letter → row index for y calculation
  const rowIndex: Record<string, number> = {};
  rows.forEach((r, i) => { rowIndex[r] = i; });

  return (
    <div>
      <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full">
        {/* Entrance */}
        <rect x={svgW / 2 - 18} y={1} width={36} height={10} rx={2} fill="#10b981" />
        <text x={svgW / 2} y={8} textAnchor="middle" fontSize="4.5" fill="white" fontWeight="bold">ENTRANCE</text>

        {/* Stalls — every cell is occupied */}
        {vendors.map(v => {
          const col      = parseInt(v.stall.slice(1)) - 1;
          const ri       = rowIndex[v.stall[0]] ?? 0;
          const x        = PAD + col * (CELL_W + GAP);
          const y        = PAD + 14 + ri * (CELL_H + GAP);
          const isCurrent = v.stall === currentStall;
          const color     = stallColor(v.category);
          return (
            <g key={v.stall}>
              <rect x={x} y={y} width={CELL_W} height={CELL_H} rx={2}
                fill={color}
                stroke={isCurrent ? '#fbbf24' : 'white'}
                strokeWidth={isCurrent ? 1.5 : 0.5}
                opacity={isCurrent ? 1 : 0.55}
              />
              <text x={x + CELL_W / 2} y={y + CELL_H / 2 + 2} textAnchor="middle"
                fontSize={isCurrent ? '4.5' : '3.8'} fill="white" fontWeight="bold">
                {v.stall}
              </text>
              {isCurrent && (
                <rect x={x - 1} y={y - 1} width={CELL_W + 2} height={CELL_H + 2} rx={3}
                  fill="none" stroke="#ea580c" strokeWidth="1.5" strokeDasharray="2,2" opacity="0.8" />
              )}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex justify-between mt-2">
        {Object.entries(MINI_CAT_COLOR).map(([label, color]) => (
          <span key={label} className="flex items-center gap-0.5 text-xs text-gray-500">
            <span className="w-2 h-2 rounded inline-block shrink-0" style={{ backgroundColor: color }} />
            <span>{label}</span>
          </span>
        ))}
      </div>
      <Link to={`/customer/events/${eventId}/map`} className="mt-3 flex items-center gap-1.5 text-xs text-orange-600 hover:text-orange-700 font-medium">
        <Map className="w-3.5 h-3.5" />View full interactive map
      </Link>
    </div>
  );
}

export default function VendorStorePage({ user, onLogout }: VendorStorePageProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const eventId  = id?.split('-v')[0] ?? '';
  const vendors  = getEventVendors(eventId);
  const vendor   = vendors.find(v => v.id === id) as Vendor | undefined;
  const event    = pasarMalamEvents.find(e => e.id === eventId);
  const status   = event ? getEventStatus(event) : 'completed';
  const canOrder = status === 'ongoing' || status === 'upcoming';
  const isGames  = vendor?.category === GAMES_CATEGORY;

  const cartKey = `bazaario_cart_${id}`;
  const [cart, setCart] = useState<Record<string, number>>(() => {
    try { return JSON.parse(localStorage.getItem(cartKey) || '{}'); } catch { return {}; }
  });
  useEffect(() => {
    if (Object.keys(cart).length) localStorage.setItem(cartKey, JSON.stringify(cart));
    else localStorage.removeItem(cartKey);
  }, [cart, cartKey]);
  const [remindItem, setRemindItem]       = useState<VendorItem | null>(null);
  const [remindMethod, setRemindMethod]   = useState<'email' | 'phone'>('email');
  const [remindContact, setRemindContact] = useState('');
  const [remindSaved, setRemindSaved]     = useState<string | null>(null);
  const [reminded, setReminded]           = useState<Set<string>>(() => {
    if (!vendor) return new Set();
    return new Set(vendor.items.filter(it => hasReminder(user.id, vendor.id, it.name)).map(it => it.name));
  });

  if (!vendor || !event) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
        <CustomerNav user={user} onLogout={onLogout} />
        <div className="container mx-auto px-4 py-20 text-center">
          <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Vendor Not Found</h2>
          <p className="text-gray-500 mb-6">This vendor page doesn't exist or has been removed.</p>
          <Link to="/customer/events"><Button className="bg-gradient-to-r from-orange-500 to-pink-500">Browse Events</Button></Link>
        </div>
      </div>
    );
  }

  const itemsWithStock = vendor.items.map(item => ({
    ...item,
    inStock: !isOutOfStock(vendor.id, item.name),
  }));

  const addToCart      = (name: string) => setCart(c => ({ ...c, [name]: (c[name] ?? 0) + 1 }));
  const removeFromCart = (name: string) => setCart(c => {
    if ((c[name] ?? 0) <= 1) { const n = { ...c }; delete n[name]; return n; }
    return { ...c, [name]: c[name] - 1 };
  });
  const totalItems = Object.values(cart).reduce((s, q) => s + q, 0);
  const totalPrice = Object.entries(cart).reduce((s, [name, qty]) => {
    const item = itemsWithStock.find(i => i.name === name);
    return s + (item ? item.price * qty : 0);
  }, 0);

  const handleRemindSubmit = () => {
    if (!remindItem || !remindContact.trim()) return;
    saveReminder({ userId: user.id, vendorId: vendor.id, itemName: remindItem.name, contact: remindContact.trim(), method: remindMethod, savedAt: new Date().toISOString() });
    setReminded(prev => new Set([...prev, remindItem.name]));
    setRemindSaved(remindItem.name);
    setRemindItem(null);
    setRemindContact('');
    setTimeout(() => setRemindSaved(null), 3000);
  };

  const heroImage = CATEGORY_IMAGES[vendor.category] ?? CATEGORY_IMAGES['Hot Food'];
  const itemImage = ITEM_IMAGES[vendor.category]     ?? ITEM_IMAGES['Hot Food'];
  const catColor  = stallColor(vendor.category);

  return (
    <div className="min-h-screen bg-gray-50 pb-32 md:pb-10">
      <CustomerNav user={user} onLogout={onLogout} />

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <Link to={`/customer/events/${eventId}`} className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 text-sm">
          <ArrowLeft className="w-4 h-4 mr-2" />Back to Event
        </Link>

        {/* Hero */}
        <div className="relative h-52 md:h-64 rounded-2xl overflow-hidden mb-6 shadow-lg">
          <img src={heroImage} alt={vendor.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
          {/* Status badge — top right */}
          <div className="absolute top-3 right-3">
            <Badge className={status === 'ongoing' ? 'bg-green-500' : status === 'upcoming' ? 'bg-blue-500' : 'bg-gray-500'}>
              {status === 'ongoing' ? 'Live Now' : status === 'upcoming' ? 'Upcoming' : 'Past Event'}
            </Badge>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Badge style={{ backgroundColor: catColor }}>{vendor.category}</Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold leading-tight">{vendor.name}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-1.5 text-sm text-white/80">
              <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />{vendor.rating}</span>
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />Stall {vendor.stall} · {event.area}</span>
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{event.openingHours || '6:00 PM – 12:00 AM'}</span>
            </div>
          </div>
        </div>

        {/* Remind Me toast */}
        {remindSaved && (
          <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            We'll notify you when <strong>{remindSaved}</strong> is back in stock!
          </div>
        )}

        {/* Pre-order / Click & Collect banner — only for non-games */}
        {canOrder && !isGames && (
          <Card className="mb-6 border-orange-200 bg-gradient-to-r from-orange-50 to-pink-50">
            <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <p className="font-bold text-gray-900 flex items-center gap-2">
                  <Package className="w-4 h-4 text-orange-500" />
                  {status === 'ongoing' ? 'Click & Collect — Skip the Queue!' : 'Pre-Order for Pickup'}
                </p>
                <p className="text-sm text-gray-600 mt-0.5">
                  {status === 'ongoing'
                    ? 'Add items to cart, pay with your wallet, and collect at the stall — no waiting!'
                    : `Pre-order now for pickup when the event opens on ${new Date(event.startDate).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' })}.`}
                </p>
              </div>
              <Badge className="bg-orange-500 text-white shrink-0 text-xs">
                {status === 'ongoing' ? '~15 min ready' : 'Confirmed at event start'}
              </Badge>
            </CardContent>
          </Card>
        )}

        {/* Main layout: items (left) + sidebar (right) */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* ── Items / Games ── */}
          <div className="lg:col-span-2">
            {isGames ? (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <Gamepad2 className="w-5 h-5" style={{ color: catColor }} />
                  <h2 className="text-xl font-bold text-gray-900">Games Available</h2>
                  <span className="text-sm font-normal text-gray-400">({vendor.items.length} games)</span>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {vendor.items.map(item => (
                    <Card key={item.name} className="overflow-hidden">
                      <div className="relative h-36 shrink-0">
                        <img src={itemImage} alt={item.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <p className="absolute bottom-2 left-3 right-3 text-white font-bold text-sm leading-tight">{item.name}</p>
                      </div>
                      <CardContent className="p-4">
                        <p className="text-xs text-gray-500 mb-3 leading-relaxed">{item.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-base font-bold" style={{ color: catColor }}>${item.price.toFixed(2)} / play</span>
                          <Badge variant="outline" className="text-xs text-gray-500 border-gray-300">Pay at stall</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <Package className="w-5 h-5" style={{ color: catColor }} />
                  <h2 className="text-xl font-bold text-gray-900">Menu & Products</h2>
                  <span className="text-sm font-normal text-gray-400">({itemsWithStock.length} items)</span>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {itemsWithStock.map(item => (
                    <Card key={item.name} className={`overflow-hidden flex flex-col ${!item.inStock ? 'opacity-70' : ''}`}>
                      <div className="relative h-40 shrink-0">
                        <img src={itemImage} alt={item.name} className="w-full h-full object-cover" />
                        {!item.inStock && (
                          <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                            <Badge variant="secondary" className="text-sm font-semibold">Sold Out</Badge>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4 flex flex-col flex-1">
                        <h3 className="font-bold text-gray-900 mb-1 leading-tight">{item.name}</h3>
                        <p className="text-xs text-gray-500 mb-3 flex-1 leading-relaxed">{item.description}</p>
                        <div className="flex items-center justify-between mt-auto">
                          <span className="text-lg font-bold" style={{ color: catColor }}>${item.price.toFixed(2)}</span>
                          {item.inStock ? (
                            cart[item.name] ? (
                              <div className="flex items-center gap-2">
                                <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => removeFromCart(item.name)}>
                                  <Minus className="w-3 h-3" />
                                </Button>
                                <span className="font-bold w-6 text-center text-sm">{cart[item.name]}</span>
                                <Button size="icon" className="h-8 w-8 bg-gradient-to-r from-orange-500 to-pink-500" onClick={() => addToCart(item.name)}>
                                  <Plus className="w-3 h-3" />
                                </Button>
                              </div>
                            ) : canOrder ? (
                              <Button size="sm" className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600" onClick={() => addToCart(item.name)}>
                                <ShoppingCart className="w-3.5 h-3.5 mr-1" />Add
                              </Button>
                            ) : (
                              <Badge variant="outline" className="text-xs text-gray-400">Event ended</Badge>
                            )
                          ) : reminded.has(item.name) ? (
                            <Button size="sm" variant="outline" disabled className="text-green-600 border-green-300 text-xs">
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />Notified
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" className="border-orange-300 text-orange-600 hover:bg-orange-50 text-xs" onClick={() => setRemindItem(item)}>
                              <Bell className="w-3.5 h-3.5 mr-1" />Remind Me
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* ── Right sidebar: stall map + vendor info ── */}
          <div className="space-y-4">
            {/* Mini stall map */}
            <Card>
              <CardContent className="p-5">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4" style={{ color: catColor }} />
                  Stall Location
                </h3>
                <MiniStallMap vendors={vendors} currentStall={vendor.stall} eventId={eventId} />
              </CardContent>
            </Card>

            {/* Vendor info */}
            <Card>
              <CardContent className="p-5">
                <h3 className="font-bold text-gray-900 mb-3">Vendor Info</h3>
                <div className="space-y-2.5 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4 shrink-0" style={{ color: catColor }} />
                    <span>Stall <strong>{vendor.stall}</strong> · {event.area}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4 shrink-0" style={{ color: catColor }} />
                    <span>{event.openingHours || '6:00 PM – 12:00 AM'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 shrink-0" />
                    <span><strong>{vendor.rating}</strong> / 5.0 rating</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={status === 'ongoing' ? 'bg-green-500' : status === 'upcoming' ? 'bg-blue-500' : 'bg-gray-400'}>
                      {status === 'ongoing' ? 'Open Now' : status === 'upcoming' ? 'Upcoming' : 'Event Ended'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Games tip or ordering tip */}
            {isGames ? (
              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="p-4">
                  <p className="text-sm font-bold text-purple-800 mb-1 flex items-center gap-1.5">
                    <Gamepad2 className="w-4 h-4" />Games Corner
                  </p>
                  <p className="text-xs text-purple-700">Games are pay-at-stall only. Visit the stall to play and win prizes!</p>
                </CardContent>
              </Card>
            ) : canOrder ? (
              <Card className="bg-orange-50 border-orange-200">
                <CardContent className="p-4">
                  <p className="text-sm font-bold text-orange-700 mb-1">
                    {status === 'ongoing' ? '🛒 Click & Collect' : '📦 Pre-Order'}
                  </p>
                  <p className="text-xs text-orange-700">
                    {status === 'ongoing'
                      ? 'Order now and skip the queue. Your order will be ready in ~15 mins.'
                      : 'Pre-order now and collect when the event begins.'}
                  </p>
                </CardContent>
              </Card>
            ) : null}
          </div>

        </div>
      </div>

      {/* Floating cart */}
      {totalItems > 0 && (
        <div className="fixed bottom-16 md:bottom-4 left-0 right-0 px-4 z-40">
          <div className="container mx-auto max-w-6xl">
            <Card className="bg-gradient-to-r from-orange-500 to-pink-500 text-white border-0 shadow-2xl">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-bold">{totalItems} item{totalItems !== 1 ? 's' : ''} · ${totalPrice.toFixed(2)}</p>
                  <p className="text-white/80 text-sm">
                    {status === 'ongoing' ? 'Click & Collect · Ready in ~15 min' : 'Pre-Order · Pickup at event start'}
                  </p>
                </div>
                <Button variant="secondary" size="lg" className="font-semibold" onClick={() => {
                  const cartPayload = {
                    vendorId:   vendor.id,
                    vendorName: vendor.name,
                    stallLabel: vendor.stall,
                    eventId,
                    eventName:  event.name,
                    eventArea:  event.area,
                    eventAddress: event.address,
                    eventStatus: status,
                    eventStartDate: event.startDate,
                    openingHours: event.openingHours,
                    items: Object.entries(cart).map(([name, qty]) => {
                      const item = itemsWithStock.find(i => i.name === name)!;
                      return { name, qty, price: item.price };
                    }),
                  };
                  localStorage.setItem('bazaario_checkout_cart', JSON.stringify(cartPayload));
                  navigate('/customer/checkout');
                }}>
                  Checkout →
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Remind Me modal */}
      {remindItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setRemindItem(null)}>
          <Card className="w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg">Notify Me</h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Get alerted when <span className="font-semibold text-gray-700">{remindItem.name}</span> is back in stock
                  </p>
                </div>
                <button onClick={() => setRemindItem(null)} className="text-gray-400 hover:text-gray-600 mt-0.5">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex gap-2 mb-4">
                {(['email', 'phone'] as const).map(m => (
                  <button key={m} onClick={() => setRemindMethod(m)}
                    className={`flex-1 py-2 rounded-lg border text-sm font-medium flex items-center justify-center gap-1.5 transition-colors ${
                      remindMethod === m ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}>
                    {m === 'email' ? <Mail className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                    {m === 'email' ? 'Email' : 'SMS'}
                  </button>
                ))}
              </div>
              <Input
                type={remindMethod === 'email' ? 'email' : 'tel'}
                placeholder={remindMethod === 'email' ? 'your@email.com' : '+65 9123 4567'}
                value={remindContact}
                onChange={e => setRemindContact(e.target.value)}
                className="mb-4"
              />
              <Button onClick={handleRemindSubmit} disabled={!remindContact.trim()}
                className="w-full bg-gradient-to-r from-orange-500 to-pink-500 disabled:opacity-40">
                <Bell className="w-4 h-4 mr-2" />Notify Me When Back
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
