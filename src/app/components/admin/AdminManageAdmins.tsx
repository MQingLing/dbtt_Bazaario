import { useState } from 'react';
import { User } from '../../App';
import AdminNav from './AdminNav';
import { getAllUsers, addUser, StoredUser, hashPassword } from '../../services/authStore';
import { Button } from '../shared/button';
import { Input } from '../shared/input';
import { Label } from '../shared/label';
import { Badge } from '../shared/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../shared/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../shared/dialog';
import { ShieldCheck, Plus, Copy, Check, Eye, EyeOff, Users } from 'lucide-react';

interface Props { user: User; onLogout: () => void; }

function generateDefaultPassword(): string {
  const digits = Math.floor(1000 + Math.random() * 9000);
  return `Bazaario@${digits}`;
}

export default function AdminManageAdmins({ user, onLogout }: Props) {
  const [admins, setAdmins]             = useState<StoredUser[]>(() => getUsers().filter(u => u.role === 'admin'));
  const [showModal, setShowModal]       = useState(false);
  const [name, setName]                 = useState('');
  const [email, setEmail]               = useState('');
  const [formError, setFormError]       = useState('');
  const [generatedPw, setGeneratedPw]   = useState('');
  const [showPw, setShowPw]             = useState(false);
  const [copied, setCopied]             = useState(false);
  const [isLoading, setIsLoading]       = useState(false);

  const openModal = () => {
    setName(''); setEmail(''); setFormError(''); setGeneratedPw(''); setShowPw(false); setCopied(false);
    setShowModal(true);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    const existing = getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) { setFormError('An account with this email already exists.'); return; }

    setIsLoading(true);
    setTimeout(() => {
      const pw = generateDefaultPassword();
      const newAdmin: StoredUser = {
        id:                `admin-${Date.now()}`,
        name,
        email,
        password:          pw,
        role:              'admin',
        isDefaultPassword: true,
        createdAt:         new Date().toISOString(),
      };
      addUser(newAdmin);
      setAdmins(getUsers().filter(u => u.role === 'admin'));
      setGeneratedPw(pw);
      setIsLoading(false);
    }, 300);
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(generatedPw).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const closeModal = () => { setShowModal(false); setGeneratedPw(''); };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav user={user} onLogout={onLogout} />

      <div className="container mx-auto px-4 py-6 max-w-4xl pb-24 md:pb-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Manage Admins</h1>
              <p className="text-sm text-gray-500">Add and manage administrator accounts</p>
            </div>
          </div>
          <Button
            onClick={openModal}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 gap-2"
          >
            <Plus className="w-4 h-4" /> Add Admin
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{admins.length}</p>
                <p className="text-sm text-gray-500">Total Admins</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {admins.filter(a => a.isDefaultPassword).length}
                </p>
                <p className="text-sm text-gray-500">Pending Password Change</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admins table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Administrator Accounts</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((admin) => (
                    <tr key={admin.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {admin.name.charAt(0).toUpperCase()}
                          </div>
                          {admin.name}
                          {admin.id === user.id && (
                            <Badge className="text-xs bg-blue-100 text-blue-700">You</Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{admin.email}</td>
                      <td className="px-4 py-3">
                        {admin.isDefaultPassword ? (
                          <Badge className="bg-orange-100 text-orange-700 text-xs">Pending Password Change</Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-700 text-xs">Active</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(admin.createdAt).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Admin Modal */}
      <Dialog open={showModal} onOpenChange={(open) => { if (!open) closeModal(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add New Admin
            </DialogTitle>
          </DialogHeader>

          {!generatedPw ? (
            <form onSubmit={handleAdd} className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label htmlFor="adminName">Full Name</Label>
                <Input id="adminName" placeholder="Admin full name" value={name} onChange={(e) => { setName(e.target.value); setFormError(''); }} required className="h-10" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="adminEmail">Email Address</Label>
                <Input id="adminEmail" type="email" placeholder="admin@bazaario.com" value={email} onChange={(e) => { setEmail(e.target.value); setFormError(''); }} required className="h-10" />
              </div>
              {formError && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{formError}</p>}
              <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                A default password will be auto-generated. The admin must change it on first login.
              </p>
              <div className="flex gap-2 pt-1">
                <Button type="button" variant="outline" className="flex-1" onClick={closeModal}>Cancel</Button>
                <Button type="submit" disabled={isLoading} className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                  {isLoading ? 'Creating…' : 'Create Admin'}
                </Button>
              </div>
            </form>
          ) : (
            <div className="mt-2 space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <ShieldCheck className="w-5 h-5 text-green-600" />
                </div>
                <p className="font-semibold text-green-800 mb-1">Admin Created!</p>
                <p className="text-sm text-green-700">Share the credentials below with <span className="font-medium">{name}</span>.</p>
              </div>

              <div className="space-y-1.5">
                <Label>Email</Label>
                <div className="h-10 px-3 flex items-center bg-gray-50 rounded-md border text-sm text-gray-700">{email}</div>
              </div>

              <div className="space-y-1.5">
                <Label>Default Password <span className="text-orange-500 text-xs">(shown once)</span></Label>
                <div className="flex gap-2">
                  <div className="flex-1 h-10 px-3 flex items-center bg-gray-50 rounded-md border text-sm font-mono text-gray-800">
                    {showPw ? generatedPw : '•'.repeat(generatedPw.length)}
                  </div>
                  <button type="button" onClick={() => setShowPw(!showPw)} className="px-2.5 border rounded-md hover:bg-gray-50 text-gray-500">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button type="button" onClick={copyPassword} className="px-2.5 border rounded-md hover:bg-gray-50 text-gray-500">
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-orange-600">⚠ This password will not be shown again. Copy it now.</p>
              </div>

              <Button onClick={closeModal} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                Done
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
