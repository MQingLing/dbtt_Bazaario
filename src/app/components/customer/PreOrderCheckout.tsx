import { useState } from 'react';
import { useNavigate } from 'react-router';
import CustomerNav from './CustomerNav';
import { User } from '../../App';
import { Card, CardContent } from '../shared/card';
import { Badge } from '../shared/badge';
import { Button } from '../shared/button';
import { Label } from '../shared/label';
import { Textarea } from '../shared/textarea';
import { RadioGroup, RadioGroupItem } from '../shared/radio-group';
import { Separator } from '../shared/separator';
import { ShoppingCart, Clock, MapPin, CreditCard, Wallet, Gift, Tag, CheckCircle2, Star } from 'lucide-react';
import { updateUser } from '../../services/authStore';

interface PreOrderCheckoutProps {
  user: User;
  onLogout: () => void;
  onUserUpdate: (updatedUser: User) => void;
}

export default function PreOrderCheckout({ user, onLogout, onUserUpdate }: PreOrderCheckoutProps) {
  const navigate = useNavigate();
  const [pickupTime, setPickupTime] = useState('7:00 PM');
  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [useStamps, setUseStamps] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [stampsEarned, setStampsEarned] = useState(0);

  // Mock cart items
  const cartItems = [
    { id: '1', name: 'Chicken Satay (10 sticks)', vendor: "Wong's Satay",      price: 8.00, quantity: 2 },
    { id: '2', name: 'Bubble Tea - Brown Sugar',  vendor: 'Bubble Tea Paradise', price: 5.50, quantity: 1 },
    { id: '3', name: 'Fried Spring Rolls (5 pcs)', vendor: 'Golden Snacks',    price: 6.00, quantity: 1 },
  ];

  const subtotal    = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const platformFee = 0.50;
  const stampsRequired = 10;
  const canUseStamps = (user.loyaltyStamps ?? 0) >= stampsRequired;
  const discount = useStamps && canUseStamps ? 2.00 : 0;
  const total    = subtotal + platformFee - discount;

  const walletBalance = user.walletBalance ?? 0;
  const insufficientFunds = paymentMethod === 'wallet' && walletBalance < total;

  const handlePlaceOrder = () => {
    const newStamps = Math.floor(total / 5); // 1 stamp per $5 spent

    // Deduct wallet if paying by wallet
    const newBalance = paymentMethod === 'wallet' ? walletBalance - total : walletBalance;

    // Deduct stamps if used, then add earned stamps
    const currentStamps = user.loyaltyStamps ?? 0;
    const stampsAfterRedeem = useStamps && canUseStamps ? currentStamps - stampsRequired : currentStamps;
    const newStampTotal = stampsAfterRedeem + newStamps;

    // Persist to storage
    const stored = updateUser(user.id, {
      walletBalance: Math.max(0, newBalance),
      loyaltyStamps: newStampTotal,
    });

    if (stored) {
      onUserUpdate({
        ...user,
        walletBalance: stored.walletBalance,
        loyaltyStamps: stored.loyaltyStamps,
      });
    }

    setStampsEarned(newStamps);
    setOrderPlaced(true);
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
        <CustomerNav user={user} onLogout={onLogout} />
        <div className="container mx-auto px-4 py-16 max-w-lg text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h2>
          <p className="text-gray-600 mb-6">Your pickup is confirmed for <span className="font-semibold">{pickupTime}</span> at Geylang Serai Pasar Malam.</p>

          <div className="bg-white rounded-xl border p-5 mb-6 text-left space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Amount paid</span>
              <span className="font-bold">${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Payment method</span>
              <span className="font-medium capitalize">{paymentMethod === 'wallet' ? 'Bazaario Wallet' : 'Card'}</span>
            </div>
            {paymentMethod === 'wallet' && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Remaining balance</span>
                <span className="font-bold text-orange-600">${(user.walletBalance ?? 0).toFixed(2)}</span>
              </div>
            )}
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-orange-600 font-medium">
                <Star className="w-4 h-4 fill-orange-500" />
                Stamps earned
              </div>
              <Badge className="bg-orange-500">+{stampsEarned} stamp{stampsEarned !== 1 ? 's' : ''}</Badge>
            </div>
            <p className="text-xs text-gray-500">You now have {user.loyaltyStamps ?? 0} stamps total</p>
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

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <CustomerNav user={user} onLogout={onLogout} />

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your pre-order for pickup</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <ShoppingCart className="w-5 h-5 text-orange-500" />
                  <h3 className="text-xl font-bold">Your Order</h3>
                </div>
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0">
                      <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                        <ShoppingCart className="w-8 h-8 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-500">{item.vendor}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                          <span className="font-bold text-orange-600">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
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
                  <div>
                    <Label>Pickup Location</Label>
                    <div className="mt-2 p-4 bg-gray-50 rounded-lg flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Geylang Serai Pasar Malam</p>
                        <p className="text-sm text-gray-600">1 Geylang Serai, Singapore 402001</p>
                        <Badge className="mt-2 bg-green-500">Open Now</Badge>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="pickup-time">Preferred Pickup Time</Label>
                    <select
                      id="pickup-time"
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      className="mt-2 w-full h-10 px-3 rounded-md border border-gray-200"
                    >
                      {['6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM'].map(t => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                    <p className="text-sm text-gray-500 mt-2">Orders are usually ready within 15–20 minutes</p>
                  </div>
                  <div>
                    <Label htmlFor="instructions">Special Instructions (Optional)</Label>
                    <Textarea
                      id="instructions"
                      placeholder="E.g., No peanuts, extra spicy, etc."
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
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
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Apply Rewards */}
            <Card className={`border-orange-200 ${canUseStamps ? 'bg-gradient-to-r from-orange-50 to-pink-50' : 'bg-gray-50 opacity-70'}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Gift className="w-5 h-5 text-orange-500" />
                    <div>
                      <p className="font-medium">Use Loyalty Stamps</p>
                      <p className="text-sm text-gray-600">
                        {canUseStamps
                          ? `You have ${user.loyaltyStamps} stamps — redeem 10 for $2 off`
                          : `${user.loyaltyStamps ?? 0} / 10 stamps — collect more to unlock`}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant={useStamps ? 'default' : 'outline'}
                    size="sm"
                    disabled={!canUseStamps}
                    onClick={() => setUseStamps(!useStamps)}
                    className={useStamps ? 'bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600' : ''}
                  >
                    {useStamps ? 'Applied' : 'Apply'}
                  </Button>
                </div>
                {useStamps && (
                  <div className="mt-3 p-3 bg-white rounded-lg flex items-center gap-2 text-sm">
                    <Tag className="w-4 h-4 text-green-600" />
                    <span className="text-green-700 font-medium">-$2.00 discount applied! (10 stamps will be deducted)</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary Sidebar */}
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
                  {useStamps && canUseStamps && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Stamp Discount</span>
                      <span className="font-medium">-${discount.toFixed(2)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-orange-600">${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Stamp earning preview */}
                <div className="mb-4 p-3 bg-orange-50 rounded-lg flex items-center gap-2 text-sm text-orange-700">
                  <Star className="w-4 h-4 fill-orange-400 text-orange-400" />
                  <span>You'll earn <strong>{Math.floor(total / 5)} stamp{Math.floor(total / 5) !== 1 ? 's' : ''}</strong> on this order</span>
                </div>

                <Button
                  className="w-full h-12 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 mb-4"
                  onClick={handlePlaceOrder}
                  disabled={insufficientFunds}
                >
                  Place Order — ${total.toFixed(2)}
                </Button>

                {insufficientFunds && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    Insufficient wallet balance. Please top up or pay by card.
                  </div>
                )}

                <div className="mt-4 pt-4 border-t space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>Ready in 15–20 mins</span>
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
