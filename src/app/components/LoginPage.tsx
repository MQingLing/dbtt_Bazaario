import { useState } from 'react';
import { Link } from 'react-router';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { User } from '../App';
import { Sparkles, ShoppingBag } from 'lucide-react';
import logoImage from 'figma:asset/72bbaac8f9569e8deaaa486b9307f2e854bf198b.png';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mock login - determine role based on email
    let role: 'customer' | 'vendor' | 'admin' = 'customer';
    let name = 'User';
    
    if (email.includes('vendor')) {
      role = 'vendor';
      name = 'Vendor User';
    } else if (email.includes('admin')) {
      role = 'admin';
      name = 'Admin User';
    } else {
      name = 'Customer User';
    }
    
    onLogin({
      id: '1',
      name,
      email,
      role,
      walletBalance: 150.00,
      loyaltyStamps: 8,
      qrCode: 'CUSTOMER-QR-12345'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4 shadow-lg overflow-hidden">
            <img src={logoImage} alt="Pasar Malam Logo" className="w-full h-full object-cover" />
          </div>
          {/* <div className="inline-flex items-center justify-center w-32 h-32 mb-4">
            <img src={logoImage} alt="Pasar Malam Logo" className="w-full h-full object-contain" />
          </div> */}
          {/* <h1 className="text-4xl font-bold text-white mb-2">Pasar Malam</h1> */}
          <h1 className="text-4xl font-bold text-white mb-2">Bazaario</h1>
          <p className="text-white/90 text-lg">Your Night Market Companion</p>
        </div>

        <Card className="shadow-2xl border-0">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>Sign in to your account to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <Button type="submit" className="w-full h-11 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600">
                Sign In
              </Button>
            </form>

            <div className="mt-6 space-y-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Demo Accounts</span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-xs">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onLogin({
                    id: '1',
                    name: 'Sarah Tan',
                    email: 'customer@demo.com',
                    role: 'customer',
                    walletBalance: 150.00,
                    loyaltyStamps: 8,
                    qrCode: 'CUSTOMER-QR-12345'
                  })}
                  className="h-auto py-2 flex flex-col items-center gap-1"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Customer</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onLogin({
                    id: '2',
                    name: 'Wong\'s Satay',
                    email: 'vendor@demo.com',
                    role: 'vendor'
                  })}
                  className="h-auto py-2 flex flex-col items-center gap-1"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Vendor</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onLogin({
                    id: '3',
                    name: 'Admin',
                    email: 'admin@demo.com',
                    role: 'admin'
                  })}
                  className="h-auto py-2 flex flex-col items-center gap-1"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Admin</span>
                </Button>
              </div>
            </div>

            <div className="mt-6 text-center text-sm">
              <span className="text-gray-600">Don't have an account? </span>
              <Link to="/signup" className="text-orange-600 hover:text-orange-700 font-medium">
                Sign up as Customer
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-white/80 text-sm mt-6">
          {/* Experience the vibrant world of Singapore's night markets */}
          Powered by Singapore's Night Bazaar
        </p>
      </div>
    </div>
  );
}