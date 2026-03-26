import { useState } from 'react';
import { Link } from 'react-router';
import { Button } from '../shared/button';
import { Input } from '../shared/input';
import { Label } from '../shared/label';
import { addUser, emailExists, hashPassword } from '../../services/authStore';
import { User } from '../../App';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import appLogo from '../../../assets/app_logo.png';

interface VendorSignUpProps {
  onSignUp: (user: User) => void;
}

const CATEGORIES = [
  'Food & Beverage',
  'Clothing & Accessories',
  'Crafts & Handmade',
  'Electronics',
  'Beauty & Health',
  'Home & Garden',
  'Games & Entertainment',
  'Other',
];

export default function VendorSignUp({ onSignUp }: VendorSignUpProps) {
  const [showPw, setShowPw]       = useState(false);
  const [showCpw, setShowCpw]     = useState(false);
  const [error, setError]         = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    businessName:    '',
    ownerName:       '',
    email:           '',
    phone:           '',
    category:        '',
    password:        '',
    confirmPassword: '',
  });

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [field]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password.length < 8)               return setError('Password must be at least 8 characters.');
    if (!/[A-Z]/.test(form.password))           return setError('Password must contain at least one uppercase letter.');
    if (!/[0-9]/.test(form.password))           return setError('Password must contain at least one number.');
    if (form.password !== form.confirmPassword)  return setError('Passwords do not match.');
    if (emailExists(form.email))                 return setError('An account with this email already exists.');

    setIsLoading(true);
    const id = `vendor-${Date.now()}`;
    addUser({
      id,
      name:               form.businessName,
      email:              form.email,
      passwordHash:       await hashPassword(form.password),
      role:               'vendor',
      isDefaultPassword:  false,
      createdAt:          new Date().toISOString(),
      vendorTier:         'starter',
      vendorCategory:     form.category,
      verificationStatus: 'pending',
    });
    setIsLoading(false);
    onSignUp({ id, name: form.businessName, email: form.email, role: 'vendor', vendorTier: 'starter', vendorCategory: form.category, verificationStatus: 'pending' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Link to="/" className="inline-flex items-center text-white mb-6 hover:text-white/80 text-sm">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Sign In
        </Link>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4 shadow-lg">
            <img src={appLogo} alt="Bazaario" className="w-12 h-12 object-contain" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Register Your Stall</h1>
          <p className="text-white/90">Join Bazaario and start selling today</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
            <p className="text-sm text-gray-500 mt-1">Set up your vendor profile</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input id="businessName" placeholder="e.g. Uncle Ali's Satay" value={form.businessName} onChange={set('businessName')} required className="h-10" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ownerName">Owner Name</Label>
                <Input id="ownerName" placeholder="Full name" value={form.ownerName} onChange={set('ownerName')} required className="h-10" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" placeholder="+65 9123 4567" value={form.phone} onChange={set('phone')} required className="h-10" />
              </div>

              <div className="space-y-1.5 col-span-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="business@example.com" value={form.email} onChange={set('email')} required className="h-10" />
              </div>

              <div className="space-y-1.5 col-span-2">
                <Label htmlFor="category">Business Category</Label>
                <select
                  id="category"
                  value={form.category}
                  onChange={set('category')}
                  required
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="" disabled>Select a category…</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input id="password" type={showPw ? 'text' : 'password'} placeholder="Min. 8 characters" value={form.password} onChange={set('password')} required className="h-10 pr-9" />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input id="confirmPassword" type={showCpw ? 'text' : 'password'} placeholder="Re-enter password" value={form.confirmPassword} onChange={set('confirmPassword')} required className="h-10 pr-9" />
                  <button type="button" onClick={() => setShowCpw(!showCpw)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                    {showCpw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 font-semibold mt-2"
            >
              {isLoading ? 'Creating account…' : 'Create Vendor Account'}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{' '}
            <Link to="/" className="text-orange-600 hover:text-orange-700 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
