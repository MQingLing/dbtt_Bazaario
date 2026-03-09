import { useState } from 'react';
import { useNavigate } from 'react-router';
import CustomerNav from './CustomerNav';
import { User } from '../App';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Separator } from './ui/separator';
import { ShoppingCart, Clock, MapPin, CreditCard, Wallet, Gift, Tag, CheckCircle2 } from 'lucide-react';

interface PreOrderCheckoutProps {
  user: User;
  onLogout: () => void;
}

export default function PreOrderCheckout({ user, onLogout }: PreOrderCheckoutProps) {
  const navigate = useNavigate();
  const [pickupTime, setPickupTime] = useState('7:00 PM');
  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [useStamps, setUseStamps] = useState(false);

  // Mock cart items
  const cartItems = [
    {
      id: '1',
      name: 'Chicken Satay (10 sticks)',
      vendor: "Wong's Satay",
      price: 8.00,
      quantity: 2
    },
    {
      id: '2',
      name: 'Bubble Tea - Brown Sugar',
      vendor: 'Bubble Tea Paradise',
      price: 5.50,
      quantity: 1
    },
    {
      id: '3',
      name: 'Fried Spring Rolls (5 pcs)',
      vendor: 'Golden Snacks',
      price: 6.00,
      quantity: 1
    }
  ];

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const platformFee = 0.50;
  const discount = useStamps ? 2.00 : 0;
  const total = subtotal + platformFee - discount;

  const handlePlaceOrder = () => {
    alert('Order placed successfully! You will receive a confirmation shortly. (Demo only)');
    navigate('/customer/home');
  };

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
                    <Label htmlFor="pickup-location">Pickup Location</Label>
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
                      <option>6:30 PM</option>
                      <option>7:00 PM</option>
                      <option>7:30 PM</option>
                      <option>8:00 PM</option>
                      <option>8:30 PM</option>
                      <option>9:00 PM</option>
                    </select>
                    <p className="text-sm text-gray-500 mt-2">
                      Orders are usually ready within 15-20 minutes
                    </p>
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
                    <div className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer ${
                      paymentMethod === 'wallet' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
                    }`}>
                      <RadioGroupItem value="wallet" id="wallet" />
                      <Label htmlFor="wallet" className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Wallet className="w-5 h-5 text-orange-500" />
                            <div>
                              <p className="font-medium">Pasar Malam Wallet</p>
                              <p className="text-sm text-gray-500">Balance: ${user.walletBalance?.toFixed(2)}</p>
                            </div>
                          </div>
                          {paymentMethod === 'wallet' && (
                            <CheckCircle2 className="w-5 h-5 text-orange-500" />
                          )}
                        </div>
                      </Label>
                    </div>

                    <div className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer ${
                      paymentMethod === 'card' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
                    }`}>
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <CreditCard className="w-5 h-5 text-blue-500" />
                            <div>
                              <p className="font-medium">Credit/Debit Card</p>
                              <p className="text-sm text-gray-500">Pay with card</p>
                            </div>
                          </div>
                          {paymentMethod === 'card' && (
                            <CheckCircle2 className="w-5 h-5 text-orange-500" />
                          )}
                        </div>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Apply Rewards */}
            <Card className="bg-gradient-to-r from-orange-50 to-pink-50 border-orange-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Gift className="w-5 h-5 text-orange-500" />
                    <div>
                      <p className="font-medium">Use Loyalty Stamps</p>
                      <p className="text-sm text-gray-600">You have {user.loyaltyStamps} stamps</p>
                    </div>
                  </div>
                  <Button
                    variant={useStamps ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setUseStamps(!useStamps)}
                    className={useStamps ? 'bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600' : ''}
                  >
                    {useStamps ? 'Applied' : 'Apply'}
                  </Button>
                </div>
                {useStamps && (
                  <div className="mt-3 p-3 bg-white rounded-lg flex items-center gap-2 text-sm">
                    <Tag className="w-4 h-4 text-green-600" />
                    <span className="text-green-700 font-medium">-$2.00 discount applied!</span>
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
                    <span className="text-gray-600">Platform Fee</span>
                    <span className="font-medium">${platformFee.toFixed(2)}</span>
                  </div>
                  {useStamps && (
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

                <Button 
                  className="w-full h-12 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 mb-4"
                  onClick={handlePlaceOrder}
                  disabled={paymentMethod === 'wallet' && (user.walletBalance || 0) < total}
                >
                  Place Order
                </Button>

                {paymentMethod === 'wallet' && (user.walletBalance || 0) < total && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    Insufficient wallet balance. Please top up or use a different payment method.
                  </div>
                )}

                <div className="mt-4 pt-4 border-t space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>Order ready in 15-20 mins</span>
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
