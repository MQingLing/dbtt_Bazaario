import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router';
import CustomerNav from './CustomerNav';
import { User } from '../../App';
import { Card, CardContent } from '../shared/card';
import { Badge } from '../shared/badge';
import { Button } from '../shared/button';
import { Label } from '../shared/label';
import { Textarea } from '../shared/textarea';
import { RadioGroup, RadioGroupItem } from '../shared/radio-group';
import { Separator } from '../shared/separator';
import {
  ShoppingCart, Clock, MapPin, CreditCard, Wallet, Gift, Tag,
  CheckCircle2, Star, Banknote, ArrowLeft, Calendar, Ticket,
} from 'lucide-react';
import { updateUser } from '../../services/authStore';
import { getActiveVouchers, markVoucherUsed, Voucher, addOrder, addTransaction } from '../../services/dataStore';
import paynowLogo from '../../../assets/paynow_logo.png';

interface PreOrderCheckoutProps {
  user: User;
  onLogout: () => void;
  onUserUpdate: (updatedUser: User) => void;
}

interface CartPayload {
  vendorId:       string;
  vendorName:     string;
  stallLabel:     string;
  eventId:        string;
  eventName:      string;
  eventArea:      string;
  eventAddress:   string;
  eventStatus:    'ongoing' | 'upcoming' | 'completed';
  eventStartDate: string; // YYYY-MM-DD
  openingHours:   string;
  items: { name: string; qty: number; price: number }[];
}

// ── Pickup time slots at 15-min intervals derived from opening hours ─────
function toMinutes(h: number, m: number, period: string): number {
  const h24 = period === 'PM' && h !== 12 ? h + 12 : period === 'AM' && h === 12 ? 0 : h;
  return h24 * 60 + m;
}

function formatSlot(totalMin: number): string {
  const hh = Math.floor(totalMin / 60);
  const mm = totalMin % 60;
  return `${hh > 12 ? hh - 12 : hh === 0 ? 12 : hh}:${String(mm).padStart(2, '0')} ${hh >= 12 ? 'PM' : 'AM'}`;
}

function buildTimeSlots(openingHours: string): string[] {
  const match = openingHours.match(/(\d{1,2}):(\d{2})\s*(am|pm)/i);
  const startMin = match
    ? toMinutes(parseInt(match[1]), parseInt(match[2]), match[3].toUpperCase())
    : 10 * 60; // fallback 10:00 AM

  const slots: string[] = [];
  for (let t = startMin; t <= 23 * 60; t += 15) slots.push(formatSlot(t));
  return slots.length ? slots : ['10:00 AM', '10:15 AM', '10:30 AM'];
}

// ── Next 15-min boundary at or after current time ────────────────────────
function nextSlotTime(): string {
  const now     = new Date();
  const nowMin  = now.getHours() * 60 + now.getMinutes();
  const next    = Math.ceil((nowMin + 1) / 15) * 15; // e.g. 1:05 → 1:15
  return formatSlot(Math.min(next, 23 * 60));
}

// Format YYYY-MM-DD → "Thu, 26 Mar 2026" for display; keep YYYY-MM-DD for <input>
function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-SG', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });
}

// Build list of available pickup dates (from today up to endDate, or startDate onwards)
function buildDateOptions(payload: CartPayload): string[] {
  const today    = new Date();
  today.setHours(0, 0, 0, 0);
  const start    = new Date(payload.eventStartDate);
  const earliest = payload.eventStatus === 'ongoing' ? today : start;
  const dates: string[] = [];
  for (let d = new Date(earliest); dates.length < 14; d.setDate(d.getDate() + 1)) {
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

export default function PreOrderCheckout({ user, onLogout, onUserUpdate }: PreOrderCheckoutProps) {
  const navigate = useNavigate();

  // ── Load cart from localStorage ──────────────────────────────────────────
  const payload: CartPayload | null = useMemo(() => {
    try {
      const raw = localStorage.getItem('bazaario_checkout_cart');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }, []);

  const timeSlots   = useMemo(() => buildTimeSlots(payload?.openingHours ?? ''), [payload]);
  const dateOptions = useMemo(() => (payload ? buildDateOptions(payload) : []), [payload]);

  const defaultDate = new Date().toISOString().slice(0, 10);
  const nextSlot    = nextSlotTime();
  const defaultTime = timeSlots.find(t => t >= nextSlot) ?? timeSlots[0] ?? '10:00 AM';

  const [pickupDate,          setPickupDate]          = useState(defaultDate);
  const [pickupTime,          setPickupTime]          = useState(defaultTime);
  const [paymentMethod,       setPaymentMethod]       = useState('wallet');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [selectedVoucher,     setSelectedVoucher]     = useState<Voucher | null>(null);
  const [orderPlaced,         setOrderPlaced]         = useState(false);
  const [stampsEarned,        setStampsEarned]        = useState(0);
  const [finalBalance,        setFinalBalance]        = useState(0);
  const [finalStamps,         setFinalStamps]         = useState(0);

  const activeVouchers = useMemo(() => getActiveVouchers(user.id), [user.id]);

  const paymentLabel: Record<string, string> = {
    wallet: 'Bazaario Wallet',
    paynow: 'PayNow',
    card:   'Credit/Debit Card',
    cash:   'On-site Cash',
  };

  // ── Cart totals ───────────────────────────────────────────────────────────
  const cartItems   = payload?.items ?? [];
  const subtotal    = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const platformFee = parseFloat((subtotal * 0.01).toFixed(2));
  const discount    = selectedVoucher ? selectedVoucher.discount : 0;
  const isCash      = paymentMethod === 'cash';

  // Platform fee applies to all payment methods (including on-site cash)
  const beforeRound    = parseFloat((subtotal + platformFee - discount).toFixed(2));
  const digitalTotal   = beforeRound;
  // Cash: always round UP to nearest $0.10
  const cashTotal      = Math.ceil(beforeRound * 10) / 10;
  const total          = isCash ? cashTotal : digitalTotal;

  const walletBalance     = user.walletBalance ?? 0;
  const insufficientFunds = paymentMethod === 'wallet' && walletBalance < total;

  const handlePlaceOrder = () => {
    const isWallet   = paymentMethod === 'wallet';
    const newStamps  = isWallet ? Math.floor(total / 5) : 0;
    const newBalance = isWallet ? walletBalance - total : walletBalance;
    const newStampTotal = (user.loyaltyStamps ?? 0) + newStamps;

    const stored = updateUser(user.id, {
      walletBalance: Math.max(0, newBalance),
      loyaltyStamps: newStampTotal,
    });
    if (stored) onUserUpdate({ ...user, walletBalance: stored.walletBalance, loyaltyStamps: stored.loyaltyStamps });

    if (selectedVoucher) markVoucherUsed(user.id, selectedVoucher.id);

    // Record transaction in wallet history
    const methodLabel: Record<string, string> = {
      wallet: 'Wallet', cash: 'Cash', paynow: 'PayNow', card: 'Credit / Debit Card',
    };
    const now = new Date();
    addTransaction(user.id, {
      type: 'spent',
      vendor: payload?.vendorName ?? 'Vendor',
      amount: total,
      date: now.toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' }),
      time: now.toLocaleTimeString('en-SG', { hour: 'numeric', minute: '2-digit', hour12: true }),
      status: 'completed',
      paymentMethod: methodLabel[paymentMethod] ?? paymentMethod,
    });

    // Push order into vendor portal when ordering from a linked vendor
    if (payload?.vendorId === '9-v0') {
      const orderId = `#${Date.now().toString().slice(-4)}`;
      addOrder({
        id: orderId,
        customer: user.name,
        customerId: user.id,
        phone: '',
        items: cartItems.map(i => ({ name: i.name, qty: i.qty, price: i.price })),
        total,
        time: 'Just now',
        status: 'pending',
        pickupTime: pickupTime ?? '',
      });
    }

    if (payload) localStorage.removeItem(`bazaario_cart_${payload.vendorId}`);
    localStorage.removeItem('bazaario_checkout_cart');
    setStampsEarned(newStamps);
    setFinalBalance(Math.max(0, newBalance));
    setFinalStamps(newStampTotal);
    setOrderPlaced(true);
  };

  // ── Empty cart guard ──────────────────────────────────────────────────────
  if (!payload || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
        <CustomerNav user={user} onLogout={onLogout} />
        <div className="container mx-auto px-4 py-20 max-w-lg text-center">
          <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Add items from a vendor stall to proceed to checkout.</p>
          <Link to="/customer/events">
            <Button className="bg-gradient-to-r from-orange-500 to-pink-500">Browse Events</Button>
          </Link>
        </div>
      </div>
    );
  }

  // ── Order placed confirmation ─────────────────────────────────────────────
  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
        <CustomerNav user={user} onLogout={onLogout} />
        <div className="container mx-auto px-4 py-16 max-w-lg text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h2>
          <p className="text-gray-600 mb-6">
            Pickup confirmed for{' '}
            <span className="font-semibold">{fmtDate(pickupDate)} at {pickupTime}</span>
            {' '}at {payload.eventArea}.
          </p>

          <div className="bg-white rounded-xl border p-5 mb-6 text-left space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Vendor</span>
              <span className="font-medium">{payload.vendorName} · Stall {payload.stallLabel}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Amount paid</span>
              <span className="font-bold">${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Payment method</span>
              <span className="font-medium">{paymentLabel[paymentMethod] ?? paymentMethod}</span>
            </div>
            {paymentMethod === 'wallet' && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Remaining balance</span>
                <span className="font-bold text-orange-600">${finalBalance.toFixed(2)}</span>
              </div>
            )}
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-orange-600 font-medium">
                <Star className="w-4 h-4 fill-orange-500" />
                {stampsEarned > 0 ? 'Stamps earned' : 'Stamps'}
              </div>
              {stampsEarned > 0
                ? <Badge className="bg-orange-500">+{stampsEarned} stamp{stampsEarned !== 1 ? 's' : ''}</Badge>
                : <span className="text-sm text-gray-500">No stamps (wallet payment only)</span>}
            </div>
            <p className="text-xs text-gray-500">You now have {finalStamps} stamp{finalStamps !== 1 ? 's' : ''} total</p>
          </div>

          <Button
            className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
            onClick={() => navigate('/customer/home')}
          >
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  // ── Checkout form ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <CustomerNav user={user} onLogout={onLogout} />

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <Link
          to={`/customer/vendor/${payload.vendorId}`}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 text-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />Back to {payload.vendorName}
        </Link>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Checkout</h1>
          <p className="text-gray-600">
            {payload.eventStatus === 'ongoing' ? 'Click & Collect' : 'Pre-Order'} from{' '}
            <span className="font-medium">{payload.vendorName}</span>
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* ── Main Content ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Order Items */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <ShoppingCart className="w-5 h-5 text-orange-500" />
                  <h3 className="text-xl font-bold">Your Order</h3>
                  <span className="text-sm text-gray-400 font-normal ml-1">({cartItems.length} item{cartItems.length !== 1 ? 's' : ''})</span>
                </div>
                <div className="space-y-4">
                  {cartItems.map(item => (
                    <div key={item.name} className="flex items-center justify-between py-3 border-b last:border-0">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-500">{payload.vendorName} · Stall {payload.stallLabel}</p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-bold text-orange-600">${(item.price * item.qty).toFixed(2)}</p>
                        <p className="text-xs text-gray-400">Qty {item.qty} × ${item.price.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Pickup Details */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-pink-500" />
                  <h3 className="text-xl font-bold">Pickup Details</h3>
                </div>
                <div className="space-y-4">
                  {/* Location */}
                  <div>
                    <Label>Pickup Location</Label>
                    <div className="mt-2 p-4 bg-gray-50 rounded-lg flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">{payload.eventName}</p>
                        <p className="text-sm text-gray-600">{payload.eventAddress}</p>
                        <p className="text-sm text-gray-500 mt-0.5">Stall {payload.stallLabel} · {payload.eventArea}</p>
                        <Badge className={`mt-2 ${payload.eventStatus === 'ongoing' ? 'bg-green-500' : 'bg-blue-500'}`}>
                          {payload.eventStatus === 'ongoing' ? 'Open Now' : 'Upcoming'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Pickup Date */}
                  <div>
                    <Label htmlFor="pickup-date" className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      Preferred Pickup Date
                    </Label>
                    <select
                      id="pickup-date"
                      value={pickupDate}
                      onChange={e => setPickupDate(e.target.value)}
                      className="mt-2 w-full h-10 px-3 rounded-md border border-gray-200 bg-white text-sm"
                    >
                      {dateOptions.map(d => (
                        <option key={d} value={d}>{fmtDate(d)}</option>
                      ))}
                    </select>
                  </div>

                  {/* Pickup Time */}
                  <div>
                    <Label htmlFor="pickup-time" className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-gray-500" />
                      Preferred Pickup Time
                    </Label>
                    <select
                      id="pickup-time"
                      value={pickupTime}
                      onChange={e => setPickupTime(e.target.value)}
                      className="mt-2 w-full h-10 px-3 rounded-md border border-gray-200 bg-white text-sm"
                    >
                      {timeSlots.map(t => <option key={t}>{t}</option>)}
                    </select>
                    <p className="text-sm text-gray-500 mt-2">
                      {payload.eventStatus === 'ongoing'
                        ? 'Orders are usually ready within 15–20 minutes'
                        : 'You can collect your order when the event opens'}
                    </p>
                  </div>

                  {/* Special instructions */}
                  <div>
                    <Label htmlFor="instructions">Special Instructions (Optional)</Label>
                    <Textarea
                      id="instructions"
                      placeholder="E.g., No peanuts, extra spicy, etc."
                      value={specialInstructions}
                      onChange={e => setSpecialInstructions(e.target.value)}
                      className="mt-2"
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="w-5 h-5 text-purple-500" />
                  <h3 className="text-xl font-bold">Payment Method</h3>
                </div>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="space-y-3">
                    {/* Wallet */}
                    <div className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer ${paymentMethod === 'wallet' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}>
                      <RadioGroupItem value="wallet" id="wallet" />
                      <Label htmlFor="wallet" className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Wallet className="w-5 h-5 text-orange-500" />
                            <div>
                              <p className="font-medium">Bazaario Wallet</p>
                              <p className={`text-sm ${walletBalance < total ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                                Balance: ${walletBalance.toFixed(2)}
                                {walletBalance < total && ' — insufficient'}
                              </p>
                            </div>
                          </div>
                          {paymentMethod === 'wallet' && <CheckCircle2 className="w-5 h-5 text-orange-500" />}
                        </div>
                      </Label>
                    </div>
                    {/* PayNow */}
                    <div className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer ${paymentMethod === 'paynow' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}>
                      <RadioGroupItem value="paynow" id="paynow" />
                      <Label htmlFor="paynow" className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img src={paynowLogo} alt="PayNow" className="w-5 h-5 object-contain self-center flex-shrink-0" />
                            <div>
                              <p className="font-medium">PayNow</p>
                              <p className="text-sm text-gray-500">Instant bank transfer</p>
                            </div>
                          </div>
                          {paymentMethod === 'paynow' && <CheckCircle2 className="w-5 h-5 text-orange-500" />}
                        </div>
                      </Label>
                    </div>
                    {/* Card */}
                    <div className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer ${paymentMethod === 'card' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}>
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <CreditCard className="w-5 h-5 text-blue-500" />
                            <div>
                              <p className="font-medium">Credit/Debit Card</p>
                              <p className="text-sm text-gray-500">Visa, Mastercard, Amex</p>
                            </div>
                          </div>
                          {paymentMethod === 'card' && <CheckCircle2 className="w-5 h-5 text-orange-500" />}
                        </div>
                      </Label>
                    </div>
                    {/* Cash */}
                    <div className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer ${paymentMethod === 'cash' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}>
                      <RadioGroupItem value="cash" id="cash" />
                      <Label htmlFor="cash" className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Banknote className="w-5 h-5 text-green-600" />
                            <div>
                              <p className="font-medium">On-site Cash</p>
                              <p className="text-sm text-gray-500">Pay in cash at the stall</p>
                            </div>
                          </div>
                          {paymentMethod === 'cash' && <CheckCircle2 className="w-5 h-5 text-orange-500" />}
                        </div>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Apply Voucher */}
            <Card className="border-orange-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Ticket className="w-5 h-5 text-orange-500" />
                  <h3 className="text-xl font-bold">Apply Voucher</h3>
                </div>
                {activeVouchers.length === 0 ? (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-500">
                    <Gift className="w-4 h-4 shrink-0" />
                    <span>No active vouchers — earn stamps to unlock vouchers from the Vouchers page</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {activeVouchers.map(v => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVoucher(selectedVoucher?.id === v.id ? null : v)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-colors text-left ${
                          selectedVoucher?.id === v.id
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-orange-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shrink-0">
                            <Ticket className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{v.name}</p>
                            <p className="text-xs text-gray-400 font-mono">{v.id}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-orange-600">${v.discount} off</span>
                          {selectedVoucher?.id === v.id && <CheckCircle2 className="w-4 h-4 text-orange-500" />}
                        </div>
                      </button>
                    ))}
                    {selectedVoucher && (
                      <div className="mt-2 p-3 bg-green-50 rounded-lg flex items-center gap-2 text-sm">
                        <Tag className="w-4 h-4 text-green-600" />
                        <span className="text-green-700 font-medium">-${selectedVoucher.discount.toFixed(2)} discount applied!</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ── Order Summary Sidebar ── */}
          <div>
            <Card className="sticky top-6">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">Order Summary</h3>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Platform Fee (1%)</span>
                    <span className="font-medium">${platformFee.toFixed(2)}</span>
                  </div>
                  {selectedVoucher && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Voucher ({selectedVoucher.name})</span>
                      <span className="font-medium">-${discount.toFixed(2)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total {isCash && <span className="text-xs font-normal text-gray-400">(rounded)</span>}</span>
                    <span className="text-orange-600">${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Stamp earning preview */}
                <div className="mb-4 p-3 bg-orange-50 rounded-lg flex items-center gap-2 text-sm text-orange-700">
                  <Star className="w-4 h-4 fill-orange-400 text-orange-400" />
                  {paymentMethod === 'wallet'
                    ? <span>You'll earn <strong>{Math.floor(total / 5)} stamp{Math.floor(total / 5) !== 1 ? 's' : ''}</strong> on this order</span>
                    : <span className="text-gray-500">Pay with Bazaario Wallet to earn stamps</span>}
                </div>

                <Button
                  className="w-full h-12 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 mb-4"
                  onClick={handlePlaceOrder}
                  disabled={insufficientFunds}
                >
                  {isCash ? `Place Order — $${total.toFixed(2)} cash` : `Place Order — $${total.toFixed(2)}`}
                </Button>

                {insufficientFunds && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    Insufficient wallet balance. Please top up or choose another payment method.
                  </div>
                )}

                <div className="mt-4 pt-4 border-t space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>{payload.eventStatus === 'ongoing' ? 'Ready in 15–20 mins' : 'Collect at event start'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>Earn loyalty stamps</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>Easy pickup & tracking</span>
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
