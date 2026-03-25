import { useState } from 'react';
import { User } from '../App';
import { updatePassword } from '../services/authStore';
import { Input } from './shared/input';
import { Label } from './shared/label';
import { Button } from './shared/button';
import { Eye, EyeOff, Lock, ShieldCheck } from 'lucide-react';

interface ChangePasswordPageProps {
  user: User;
  onPasswordChanged: (updatedUser: User) => void;
}

export default function ChangePasswordPage({ user, onPasswordChanged }: ChangePasswordPageProps) {
  const [newPassword, setNewPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew]                 = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);
  const [error, setError]                     = useState('');
  const [isLoading, setIsLoading]             = useState(false);

  const validate = (): string => {
    if (newPassword.length < 8)              return 'Password must be at least 8 characters.';
    if (newPassword !== confirmPassword)     return 'Passwords do not match.';
    if (!/[A-Z]/.test(newPassword))          return 'Password must contain at least one uppercase letter.';
    if (!/[0-9]/.test(newPassword))          return 'Password must contain at least one number.';
    return '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }

    setIsLoading(true);
    setTimeout(() => {
      updatePassword(user.id, newPassword);
      onPasswordChanged({ ...user, isDefaultPassword: false });
      setIsLoading(false);
    }, 300);
  };

  const strength = (() => {
    let score = 0;
    if (newPassword.length >= 8)          score++;
    if (/[A-Z]/.test(newPassword))        score++;
    if (/[0-9]/.test(newPassword))        score++;
    if (/[^A-Za-z0-9]/.test(newPassword)) score++;
    return score;
  })();

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];
  const strengthColor = ['', 'bg-red-400', 'bg-yellow-400', 'bg-blue-400', 'bg-green-500'][strength];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        {/* Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-pink-100 rounded-full flex items-center justify-center mb-3">
            <ShieldCheck className="w-7 h-7 text-orange-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Set Your Password</h1>
          <p className="text-gray-500 text-sm mt-1">
            You're using a default password. Please set a new one to continue.
          </p>
        </div>

        {/* Account info */}
        <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 mb-6">
          <div className="w-9 h-9 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center shrink-0">
            <Lock className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-800">{user.name}</div>
            <div className="text-xs text-gray-500">{user.email}</div>
          </div>
          <span className="ml-auto text-xs font-medium capitalize bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
            {user.role}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* New password */}
          <div className="space-y-1.5">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNew ? 'text' : 'password'}
                placeholder="Minimum 8 characters"
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                required
                className="h-11 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Strength indicator */}
            {newPassword && (
              <div className="space-y-1">
                <div className="flex gap-1 h-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-full transition-colors ${i <= strength ? strengthColor : 'bg-gray-200'}`}
                    />
                  ))}
                </div>
                <p className={`text-xs font-medium ${['', 'text-red-500', 'text-yellow-500', 'text-blue-500', 'text-green-600'][strength]}`}>
                  {strengthLabel}
                </p>
              </div>
            )}
          </div>

          {/* Confirm password */}
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                placeholder="Re-enter your new password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                required
                className="h-11 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          {/* Requirements */}
          <ul className="text-xs text-gray-500 space-y-1 bg-gray-50 rounded-xl px-4 py-3">
            {[
              { ok: newPassword.length >= 8,          text: 'At least 8 characters'        },
              { ok: /[A-Z]/.test(newPassword),         text: 'One uppercase letter'          },
              { ok: /[0-9]/.test(newPassword),         text: 'One number'                    },
              { ok: newPassword === confirmPassword && confirmPassword.length > 0, text: 'Passwords match' },
            ].map(({ ok, text }) => (
              <li key={text} className={`flex items-center gap-2 ${ok ? 'text-green-600' : 'text-gray-400'}`}>
                <span>{ok ? '✓' : '○'}</span> {text}
              </li>
            ))}
          </ul>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 font-semibold"
          >
            {isLoading ? 'Saving…' : 'Set Password & Continue'}
          </Button>
        </form>

        <p className="text-xs text-center text-gray-400 mt-4">
          This step is required and cannot be skipped.
        </p>
      </div>
    </div>
  );
}
