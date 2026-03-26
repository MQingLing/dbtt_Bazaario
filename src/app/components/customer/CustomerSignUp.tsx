import { useState } from 'react';
import { Link } from 'react-router';
import { Button } from '../shared/button';
import { Input } from '../shared/input';
import { Label } from '../shared/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../shared/card';
import { Checkbox } from '../shared/checkbox';
import { User } from '../../App';
import { addUser, emailExists, hashPassword } from '../../services/authStore';
import { ArrowLeft } from 'lucide-react';
import appLogo from '../../../assets/app_logo.png';

interface CustomerSignUpProps {
  onSignUp: (user: User) => void;
}

export default function CustomerSignUp({ onSignUp }: CustomerSignUpProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });

  const [signUpError, setSignUpError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpError('');

    if (formData.password !== formData.confirmPassword) {
      setSignUpError('Passwords do not match.');
      return;
    }
    if (formData.password.length < 8) {
      setSignUpError('Password must be at least 8 characters.');
      return;
    }
    if (emailExists(formData.email)) {
      setSignUpError('An account with this email already exists.');
      return;
    }

    const id = Date.now().toString();
    addUser({
      id,
      name:              formData.name,
      email:             formData.email,
      passwordHash:      await hashPassword(formData.password),
      role:              'customer',
      isDefaultPassword: false,
      createdAt:         new Date().toISOString(),
    });

    onSignUp({
      id,
      name:          formData.name,
      email:         formData.email,
      role:          'customer',
      walletBalance: 0,
      loyaltyStamps: 0,
      qrCode:        `CUSTOMER-QR-${id}`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center text-white mb-6 hover:text-white/80">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Login
        </Link>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4 shadow-lg">
            <img src={appLogo} alt="Bazaario" className="w-12 h-12 object-contain" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Join Pasar Malam</h1>
          <p className="text-white/90">Create your account and start exploring</p>
        </div>

        <Card className="shadow-2xl border-0">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl">Create Account</CardTitle>
            <CardDescription>Sign up to discover night markets near you</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+65 1234 5678"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  required
                />
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="terms" 
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) => setFormData({...formData, agreeToTerms: checked as boolean})}
                  required
                />
                <label htmlFor="terms" className="text-sm text-gray-600 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  I agree to the Terms of Service and Privacy Policy
                </label>
              </div>

              {signUpError && (
                <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{signUpError}</p>
              )}

              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
                disabled={!formData.agreeToTerms}
              >
                Create Account
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-gray-600">Already have an account? </span>
              <Link to="/" className="text-orange-600 hover:text-orange-700 font-medium">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
