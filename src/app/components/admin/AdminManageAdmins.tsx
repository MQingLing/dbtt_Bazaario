import { useState } from 'react';
import { User } from '../../App';
import AdminNav from './AdminNav';
import { getAllUsers, addUser, updateUser, deleteUser, StoredUser } from '../../services/authStore';
import { Button } from '../shared/button';
import { Input } from '../shared/input';
import { Label } from '../shared/label';
import { Badge } from '../shared/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../shared/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../shared/dialog';
import { ShieldCheck, Plus, Copy, Check, Eye, EyeOff, Users, Edit2, Trash2 } from 'lucide-react';

interface Props { user: User; onLogout: () => void; }

function generateDefaultPassword(): string {
  const digits = Math.floor(1000 + Math.random() * 9000);
  return `Bazaario@${digits}`;
}

function getAdmins() {
  return getAllUsers().filter(u => u.role === 'admin');
}

export default function AdminManageAdmins({ user, onLogout }: Props) {
  const [admins, setAdmins] = useState<StoredUser[]>(getAdmins);

  // ── Add state ──────────────────────────────────────────────────────────────
  const [showAddModal, setShowAddModal] = useState(false);
  const [addName, setAddName]           = useState('');
  const [addEmail, setAddEmail]         = useState('');
  const [addError, setAddError]         = useState('');
  const [generatedPw, setGeneratedPw]   = useState('');
  const [showPw, setShowPw]             = useState(false);
  const [copied, setCopied]             = useState(false);
  const [isCreating, setIsCreating]     = useState(false);

  // ── Edit state ─────────────────────────────────────────────────────────────
  const [editTarget, setEditTarget]   = useState<StoredUser | null>(null);
  const [editName, setEditName]       = useState('');
  const [editEmail, setEditEmail]     = useState('');
  const [editError, setEditError]     = useState('');
  const [editSaved, setEditSaved]     = useState(false);

  // ── Delete state ───────────────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState<StoredUser | null>(null);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const refresh = () => setAdmins(getAdmins());

  // ── Add ────────────────────────────────────────────────────────────────────
  const openAdd = () => {
    setAddName(''); setAddEmail(''); setAddError(''); setGeneratedPw('');
    setShowPw(false); setCopied(false);
    setShowAddModal(true);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    if (getAllUsers().some(u => u.email.toLowerCase() === addEmail.toLowerCase())) {
      setAddError('An account with this email already exists.'); return;
    }
    setIsCreating(true);
    setTimeout(() => {
      const pw = generateDefaultPassword();
      addUser({
        id: `admin-${Date.now()}`,
        name: addName,
        email: addEmail,
        passwordHash: pw,        // stored as plaintext here; real app would hash
        role: 'admin',
        isDefaultPassword: true,
        createdAt: new Date().toISOString(),
      });
      refresh();
      setGeneratedPw(pw);
      setIsCreating(false);
    }, 300);
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(generatedPw).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    });
  };

  // ── Edit ───────────────────────────────────────────────────────────────────
  const openEdit = (admin: StoredUser) => {
    setEditTarget(admin);
    setEditName(admin.name);
    setEditEmail(admin.email);
    setEditError('');
    setEditSaved(false);
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    setEditError('');
    const conflict = getAllUsers().find(
      u => u.email.toLowerCase() === editEmail.toLowerCase() && u.id !== editTarget.id
    );
    if (conflict) { setEditError('Email is already in use by another account.'); return; }
    updateUser(editTarget.id, { name: editName.trim(), email: editEmail.trim() });
    refresh();
    setEditSaved(true);
    setTimeout(() => setEditTarget(null), 1200);
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteUser(deleteTarget.id);
    refresh();
    setDeleteTarget(null);
  };

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
              <p className="text-sm text-gray-500">Add, edit and remove administrator accounts</p>
            </div>
          </div>
          <Button onClick={openAdd} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 gap-2">
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
                <p className="text-2xl font-bold text-gray-900">{admins.filter(a => a.isDefaultPassword).length}</p>
                <p className="text-sm text-gray-500">Pending Password Change</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
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
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
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
                        {admin.isDefaultPassword
                          ? <Badge className="bg-orange-100 text-orange-700 text-xs">Pending Password Change</Badge>
                          : <Badge className="bg-green-100 text-green-700 text-xs">Active</Badge>}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(admin.createdAt).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEdit(admin)}
                            className="p-1.5 rounded hover:bg-blue-50 text-blue-500 hover:text-blue-700 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => admin.id !== user.id && setDeleteTarget(admin)}
                            disabled={admin.id === user.id}
                            className="p-1.5 rounded hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            title={admin.id === user.id ? "Can't delete your own account" : "Delete"}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Add Admin Modal ── */}
      <Dialog open={showAddModal} onOpenChange={(open) => { if (!open) { setShowAddModal(false); setGeneratedPw(''); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Plus className="w-4 h-4" /> Add New Admin</DialogTitle>
          </DialogHeader>
          {!generatedPw ? (
            <form onSubmit={handleAdd} className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label>Full Name</Label>
                <Input placeholder="Admin full name" value={addName} onChange={e => { setAddName(e.target.value); setAddError(''); }} required className="h-10" />
              </div>
              <div className="space-y-1.5">
                <Label>Email Address</Label>
                <Input type="email" placeholder="admin@bazaario.com" value={addEmail} onChange={e => { setAddEmail(e.target.value); setAddError(''); }} required className="h-10" />
              </div>
              {addError && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{addError}</p>}
              <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">A default password will be auto-generated. The admin must change it on first login.</p>
              <div className="flex gap-2 pt-1">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>Cancel</Button>
                <Button type="submit" disabled={isCreating} className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                  {isCreating ? 'Creating…' : 'Create Admin'}
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
                <p className="text-sm text-green-700">Share the credentials below with <span className="font-medium">{addName}</span>.</p>
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <div className="h-10 px-3 flex items-center bg-gray-50 rounded-md border text-sm text-gray-700">{addEmail}</div>
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
              <Button onClick={() => { setShowAddModal(false); setGeneratedPw(''); }} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">Done</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Edit Admin Modal ── */}
      <Dialog open={!!editTarget} onOpenChange={(open) => { if (!open) setEditTarget(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Edit2 className="w-4 h-4" /> Edit Admin</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Full Name</Label>
              <Input value={editName} onChange={e => { setEditName(e.target.value); setEditError(''); }} required className="h-10" />
            </div>
            <div className="space-y-1.5">
              <Label>Email Address</Label>
              <Input type="email" value={editEmail} onChange={e => { setEditEmail(e.target.value); setEditError(''); }} required className="h-10" />
            </div>
            {editError && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{editError}</p>}
            {editSaved && <p className="text-sm text-green-600 bg-green-50 rounded-lg px-3 py-2">Changes saved.</p>}
            <div className="flex gap-2 pt-1">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setEditTarget(null)}>Cancel</Button>
              <Button type="submit" className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">Save Changes</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Modal ── */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600"><Trash2 className="w-4 h-4" /> Delete Admin</DialogTitle>
          </DialogHeader>
          <div className="mt-2 space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete <span className="font-semibold">{deleteTarget?.name}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteTarget(null)}>Cancel</Button>
              <Button onClick={confirmDelete} className="flex-1 bg-red-500 hover:bg-red-600 text-white">Delete</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
