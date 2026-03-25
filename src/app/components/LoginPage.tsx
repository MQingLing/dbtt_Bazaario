import { useState } from 'react';
import { Link } from 'react-router';
import { Button } from './shared/button';
import { Input } from './shared/input';
import { Label } from './shared/label';
import { Badge } from './shared/badge';
import { User } from '../App';
import { ShoppingBag, Store, Shield, Eye, EyeOff, MapPin, Star, Zap } from 'lucide-react';
import { authenticate, getAllUsers } from '../services/authStore';
import logoImage from '../../assets/app_logo.png';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const DEMO_ACCOUNTS = [
  { label: 'Customer', email: 'customer@bazaario.com', password: 'Customer@123', icon: ShoppingBag, color: 'text-orange-500' },
  { label: 'Vendor',   email: 'vendor@bazaario.com',   password: 'Vendor@123',   icon: Store,       color: 'text-pink-500'   },
  { label: 'Admin',    email: 'admin@bazaario.com',     password: 'Admin@123',    icon: Shield,      color: 'text-purple-500' },
];

const ROLE_COLORS: Record<string, string> = {
  customer: 'bg-orange-100 text-orange-700',
  vendor:   'bg-pink-100 text-pink-700',
  admin:    'bg-purple-100 text-purple-700',
};

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading]   = useState(false);
  const [error, setError]           = useState('');
  const [detectedRole, setDetectedRole] = useState<string | null>(null);

  const handleEmailChange = (val: string) => {
    setEmail(val);
    setError('');
    const match = getAllUsers().find((u) => u.email.toLowerCase() === val.toLowerCase());
    setDetectedRole(match?.role ?? null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const stored = await authenticate(email, password);
    if (!stored) {
      setError('Invalid email or password. Please try again.');
      setIsLoading(false);
      return;
    }
    onLogin({
      id:                stored.id,
      name:              stored.name,
      email:             stored.email,
      role:              stored.role,
      isDefaultPassword: stored.isDefaultPassword,
      walletBalance:     stored.role === 'customer' ? 150.00 : undefined,
      loyaltyStamps:     stored.role === 'customer' ? 8 : undefined,
      qrCode:            stored.role === 'customer' ? `QR-${stored.id}` : undefined,
    });
    setIsLoading(false);
  };

  const autofill = (acc: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setDetectedRole(acc.label.toLowerCase());
    setError('');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 p-12 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center overflow-hidden">
            <img src={logoImage} alt="Bazaario" className="w-full h-full object-cover" />
          </div>
          <span className="text-2xl font-bold">Bazaario</span>
        </div>

        <div>
          <h2 className="text-4xl font-bold leading-tight mb-4">
            Singapore's Night Market, Now Digital
          </h2>
          <p className="text-white/80 text-lg mb-10">
            Discover vendors, pre-order your favourites, and never miss a pasar malam again.
          </p>
          <div className="space-y-4">
            {[
              { icon: MapPin, title: 'Interactive Maps', desc: 'Navigate stall layouts in real-time' },
              { icon: Zap,    title: 'Pre-Order & Pay',  desc: 'Skip queues with digital pre-orders'  },
              { icon: Star,   title: 'Loyalty Rewards',  desc: 'Earn stamps and redeem discounts'      },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold">{title}</div>
                  <div className="text-white/70 text-sm">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/50 text-sm">© 2026 Bazaario. All rights reserved.</p>
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gray-50">
        {/* Mobile logo */}
        <div className="lg:hidden flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center overflow-hidden shadow-lg mb-3">
            <img src={logoImage} alt="Bazaario" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Bazaario</h1>
          <p className="text-gray-500 text-sm">Your Night Market Companion</p>
        </div>

        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
              <p className="text-gray-500 text-sm mt-1">Sign in to your Bazaario account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    required
                    className="h-11 pr-24"
                  />
                  {detectedRole && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <Badge className={`text-xs capitalize ${ROLE_COLORS[detectedRole] || ''}`}>
                        {detectedRole}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    required
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 font-semibold"
              >
                {isLoading ? 'Signing in…' : 'Sign In'}
              </Button>
            </form>

            {/* Demo accounts */}
            <div className="mt-6">
              <div className="relative mb-3">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-400">Demo accounts</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {DEMO_ACCOUNTS.map((acc) => {
                  const Icon = acc.icon;
                  return (
                    <button
                      key={acc.label}
                      type="button"
                      onClick={() => autofill(acc)}
                      className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors text-xs font-medium text-gray-600 hover:text-gray-900"
                    >
                      <Icon className={`w-5 h-5 ${acc.color}`} />
                      {acc.label}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-400 text-center mt-2">
                Click a role to auto-fill credentials, then press Sign In
              </p>
            </div>

            {/* Sign-up links */}
            <div className="mt-6 pt-5 border-t border-gray-100 text-center space-y-1.5 text-sm text-gray-500">
              <p>
                New customer?{' '}
                <Link to="/signup" className="text-orange-600 hover:text-orange-700 font-medium">
                  Create account
                </Link>
              </p>
              <p>
                Vendor?{' '}
                <Link to="/vendor/signup" className="text-pink-600 hover:text-pink-700 font-medium">
                  Register your stall
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
