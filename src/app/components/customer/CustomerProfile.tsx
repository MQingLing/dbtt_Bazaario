import { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import CustomerNav from './CustomerNav';
import { User } from '../../App';
import { Card, CardContent } from '../shared/card';
import { Button } from '../shared/button';
import { Input } from '../shared/input';
import { Badge } from '../shared/badge';
import { updateUser, hashPassword, getUserById } from '../../services/authStore';
import {
  User as UserIcon, Mail, Lock, CheckCircle2, AlertCircle,
  Edit2, Save, X, Eye, EyeOff, Wallet, Gift, QrCode, Camera,
} from 'lucide-react';

interface CustomerProfileProps {
  user: User;
  onLogout: () => void;
  onUserUpdate: (u: User) => void;
}

export default function CustomerProfile({ user, onLogout, onUserUpdate }: CustomerProfileProps) {
  const navigate = useNavigate();

  // ── Edit profile state ──────────────────────────────────────────────────────
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      updateUser(user.id, { profilePic: dataUrl });
      onUserUpdate({ ...user, profilePic: dataUrl });
    };
    reader.readAsDataURL(file);
  };

  const [editMode, setEditMode]   = useState(false);
  const [name, setName]           = useState(user.name);
  const [email, setEmail]         = useState(user.email);
  const [profileMsg, setProfileMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // ── Change password state ───────────────────────────────────────────────────
  const [showPwSection, setShowPwSection] = useState(false);
  const [currentPw, setCurrentPw]         = useState('');
  const [newPw, setNewPw]                 = useState('');
  const [confirmPw, setConfirmPw]         = useState('');
  const [showCurrent, setShowCurrent]     = useState(false);
  const [showNew, setShowNew]             = useState(false);
  const [pwMsg, setPwMsg]                 = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // ── Save profile ─────────────────────────────────────────────────────────────
  const handleSaveProfile = () => {
    const trimName  = name.trim();
    const trimEmail = email.trim().toLowerCase();
    if (!trimName)  { setProfileMsg({ type: 'err', text: 'Name cannot be empty.' }); return; }
    if (!trimEmail) { setProfileMsg({ type: 'err', text: 'Email cannot be empty.' }); return; }
    const stored = updateUser(user.id, { name: trimName, email: trimEmail });
    if (!stored) { setProfileMsg({ type: 'err', text: 'Failed to save. Please try again.' }); return; }
    onUserUpdate({ ...user, name: stored.name, email: stored.email });
    setEditMode(false);
    setProfileMsg({ type: 'ok', text: 'Profile updated successfully.' });
    setTimeout(() => setProfileMsg(null), 3000);
  };

  const handleCancelEdit = () => {
    setName(user.name);
    setEmail(user.email);
    setEditMode(false);
    setProfileMsg(null);
  };

  // ── Change password ───────────────────────────────────────────────────────────
  const handleChangePassword = async () => {
    if (!currentPw) { setPwMsg({ type: 'err', text: 'Enter your current password.' }); return; }
    if (newPw.length < 6) { setPwMsg({ type: 'err', text: 'New password must be at least 6 characters.' }); return; }
    if (newPw !== confirmPw) { setPwMsg({ type: 'err', text: 'Passwords do not match.' }); return; }

    const currentHash = await hashPassword(currentPw);
    const stored = getUserById(user.id);
    if (!stored || stored.passwordHash !== currentHash) {
      setPwMsg({ type: 'err', text: 'Current password is incorrect.' });
      return;
    }
    const newHash = await hashPassword(newPw);
    updateUser(user.id, { passwordHash: newHash, isDefaultPassword: false });
    setCurrentPw(''); setNewPw(''); setConfirmPw('');
    setShowPwSection(false);
    setPwMsg({ type: 'ok', text: 'Password changed successfully.' });
    setTimeout(() => setPwMsg(null), 3000);
  };

  const initials = user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <CustomerNav user={user} onLogout={onLogout} />

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

        {/* Avatar + name header */}
        <Card className="mb-4 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-pink-500 h-20" />
          <CardContent className="px-6 pb-6">
            <div className="flex items-end justify-between -mt-8 mb-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="relative w-16 h-16 rounded-full bg-white ring-4 ring-white shadow group overflow-hidden"
                title="Change profile photo"
              >
                {user.profilePic ? (
                  <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <span className="w-full h-full flex items-center justify-center text-2xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                    {initials}
                  </span>
                )}
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-5 h-5 text-white" />
                </div>
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => navigate('/customer/qr-payment')} className="text-xs gap-1">
                  <QrCode className="w-3.5 h-3.5" />QR Code
                </Button>
                {!editMode && (
                  <Button size="sm" className="bg-gradient-to-r from-orange-500 to-pink-500 text-xs gap-1" onClick={() => { setEditMode(true); setProfileMsg(null); }}>
                    <Edit2 className="w-3.5 h-3.5" />Edit
                  </Button>
                )}
              </div>
            </div>
            <p className="text-xl font-bold text-gray-900">{user.name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                <Wallet className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Wallet Balance</p>
                <p className="text-lg font-bold text-orange-600">${user.walletBalance?.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center shrink-0">
                <Gift className="w-5 h-5 text-pink-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Loyalty Stamps</p>
                <p className="text-lg font-bold text-pink-600">{user.loyaltyStamps ?? 0}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile info / edit */}
        <Card className="mb-4">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-orange-500" />Personal Info
              </h2>
              {editMode && (
                <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs">Editing</Badge>
              )}
            </div>

            {profileMsg && (
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${profileMsg.type === 'ok' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                {profileMsg.type === 'ok' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                {profileMsg.text}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Full Name</label>
                {editMode ? (
                  <Input value={name} onChange={e => setName(e.target.value)} placeholder="Full name" />
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-800">
                    <UserIcon className="w-4 h-4 text-gray-400 shrink-0" />{user.name}
                  </div>
                )}
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Email Address</label>
                {editMode ? (
                  <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" />
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-800">
                    <Mail className="w-4 h-4 text-gray-400 shrink-0" />{user.email}
                  </div>
                )}
              </div>
            </div>

            {editMode && (
              <div className="flex gap-2 pt-1">
                <Button onClick={handleSaveProfile} className="bg-gradient-to-r from-orange-500 to-pink-500 flex-1 gap-1">
                  <Save className="w-4 h-4" />Save Changes
                </Button>
                <Button variant="outline" onClick={handleCancelEdit} className="gap-1">
                  <X className="w-4 h-4" />Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Change password */}
        <Card>
          <CardContent className="p-6">
            <button
              className="w-full flex items-center justify-between"
              onClick={() => { setShowPwSection(v => !v); setPwMsg(null); }}
            >
              <span className="font-bold text-gray-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-orange-500" />Change Password
              </span>
              <span className="text-xs text-gray-400">{showPwSection ? 'Hide' : 'Show'}</span>
            </button>

            {showPwSection && (
              <div className="mt-4 space-y-3">
                {pwMsg && (
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${pwMsg.type === 'ok' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                    {pwMsg.type === 'ok' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                    {pwMsg.text}
                  </div>
                )}
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Current Password</label>
                  <div className="relative">
                    <Input type={showCurrent ? 'text' : 'password'} value={currentPw} onChange={e => setCurrentPw(e.target.value)} placeholder="Current password" />
                    <button type="button" onClick={() => setShowCurrent(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">New Password</label>
                  <div className="relative">
                    <Input type={showNew ? 'text' : 'password'} value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="At least 6 characters" />
                    <button type="button" onClick={() => setShowNew(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Confirm New Password</label>
                  <Input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="Repeat new password" />
                </div>
                <Button onClick={handleChangePassword} className="w-full bg-gradient-to-r from-orange-500 to-pink-500 gap-1">
                  <Lock className="w-4 h-4" />Update Password
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
