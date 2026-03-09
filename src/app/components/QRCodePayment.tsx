import { QRCodeSVG } from 'qrcode.react';
import CustomerNav from './CustomerNav';
import { User } from '../App';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Wallet, CheckCircle2, Sparkles } from 'lucide-react';

interface QRCodePaymentProps {
  user: User;
  onLogout: () => void;
}

export default function QRCodePayment({ user, onLogout }: QRCodePaymentProps) {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <CustomerNav user={user} onLogout={onLogout} />

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment QR Code</h1>
          <p className="text-gray-600">Show this code to vendor for payment</p>
        </div>

        {/* QR Code Card */}
        <Card className="mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white/80 text-sm mb-1">Account Holder</p>
                <p className="text-xl font-bold">{user.name}</p>
              </div>
              <Sparkles className="w-8 h-8 text-white/80" />
            </div>
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              <div>
                <p className="text-white/80 text-sm">Available Balance</p>
                <p className="text-2xl font-bold">${user.walletBalance?.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <CardContent className="p-8">
            <div className="bg-white p-6 rounded-2xl shadow-lg mb-6">
              <div className="flex justify-center mb-4">
                <div className="bg-white p-4 rounded-2xl">
                  <QRCodeSVG
                    value={user.qrCode || 'CUSTOMER-QR-DEFAULT'}
                    size={280}
                    level="H"
                    includeMargin={false}
                    fgColor="#000000"
                  />
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">QR Code ID</p>
                <p className="font-mono text-lg font-bold text-gray-900">{user.qrCode}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">How to Pay</p>
                  <p className="text-sm text-blue-700">Show this QR code to the vendor. They will scan it to process your payment.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-green-900">Instant Payment</p>
                  <p className="text-sm text-green-700">Payments are processed instantly from your wallet balance.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-purple-900">Earn Rewards</p>
                  <p className="text-sm text-purple-700">Collect loyalty stamps with every purchase using this QR code.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Membership Info */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {user.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <p className="font-bold text-lg">{user.name}</p>
                <Badge className="bg-gradient-to-r from-orange-500 to-pink-500">Premium Member</Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">{user.loyaltyStamps}</p>
                <p className="text-sm text-gray-600">Loyalty Stamps</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-pink-600">${user.walletBalance?.toFixed(2)}</p>
                <p className="text-sm text-gray-600">Wallet Balance</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800 text-center">
            <span className="font-bold">Security Tip:</span> Never share screenshots of your QR code. Only show it directly to vendors at the stall.
          </p>
        </div>
      </div>
    </div>
  );
}
