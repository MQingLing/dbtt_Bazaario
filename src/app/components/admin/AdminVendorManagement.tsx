import { useState } from 'react';
import AdminNav from './AdminNav';
import { User } from '../../App';
import { ADMIN_VENDORS, AdminVendor } from '../../data/mockData';
import { Card, CardContent } from '../shared/card';
import { Badge } from '../shared/badge';
import { Button } from '../shared/button';
import { Input } from '../shared/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../shared/tabs';
import { Search, CheckCircle2, XCircle, Eye, Mail, Phone, Clock, FileText, Tag, ChevronDown, ChevronUp } from 'lucide-react';
import { getAllVendorSubmissions, VendorDocSubmission } from '../../services/dataStore';
import { updateUser, getAllUsers } from '../../services/authStore';

interface AdminVendorManagementProps {
  user: User;
  onLogout: () => void;
}

export default function AdminVendorManagement({ user, onLogout }: AdminVendorManagementProps) {
  // ── Vendor list state ──────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [vendors, setVendors] = useState<AdminVendor[]>(ADMIN_VENDORS);

  const approveVendor = (id: string) => {
    setVendors(vendors.map(v => v.id === id ? { ...v, status: 'active' } : v));
  };

  const rejectVendor = (id: string) => {
    if (confirm('Are you sure you want to reject this vendor application?')) {
      setVendors(vendors.filter(v => v.id !== id));
    }
  };

  const suspendVendor = (id: string) => {
    if (confirm('Are you sure you want to suspend this vendor?')) {
      setVendors(vendors.map(v => v.id === id ? { ...v, status: 'suspended' } : v));
    }
  };

  const filteredVendors = vendors.filter(vendor =>
    vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vendor.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vendor.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getVendorsByStatus = (status: string) => {
    if (status === 'all') return filteredVendors;
    return filteredVendors.filter(vendor => vendor.status === status);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':    return <Badge className="bg-green-500">Active</Badge>;
      case 'pending':   return <Badge className="bg-yellow-500">Pending</Badge>;
      case 'suspended': return <Badge className="bg-red-500">Suspended</Badge>;
      default:          return <Badge>{status}</Badge>;
    }
  };

  // ── Verification state ─────────────────────────────────────────────────────
  const [submissions, setSubmissions] = useState<VendorDocSubmission[]>(() => getAllVendorSubmissions());
  const [expanded,  setExpanded]  = useState<string | null>(null);
  const [rejectId,  setRejectId]  = useState<string | null>(null);
  const [reason,    setReason]    = useState('');
  const [verStatuses, setVerStatuses] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    getAllUsers().forEach(u => { if (u.verificationStatus) map[u.id] = u.verificationStatus; });
    return map;
  });

  const refreshVerification = () => {
    setSubmissions(getAllVendorSubmissions());
    const map: Record<string, string> = {};
    getAllUsers().forEach(u => { if (u.verificationStatus) map[u.id] = u.verificationStatus; });
    setVerStatuses(map);
  };

  const handleApprove = (vendorId: string) => {
    updateUser(vendorId, { verificationStatus: 'approved', verificationRejectionReason: undefined });
    refreshVerification();
  };

  const handleReject = (vendorId: string) => {
    if (!reason.trim()) return;
    updateUser(vendorId, { verificationStatus: 'rejected', verificationRejectionReason: reason.trim() });
    setRejectId(null);
    setReason('');
    refreshVerification();
  };

  const getVerStatusBadge = (vendorId: string) => {
    const s = verStatuses[vendorId] ?? 'pending';
    switch (s) {
      case 'approved':  return <Badge className="bg-green-100 text-green-700 border-green-200">Approved</Badge>;
      case 'rejected':  return <Badge className="bg-red-100 text-red-700 border-red-200">Rejected</Badge>;
      case 'submitted': return <Badge className="bg-orange-100 text-orange-700 border-orange-200">Pending Review</Badge>;
      default:          return <Badge className="bg-gray-100 text-gray-600 border-gray-200">Pending Docs</Badge>;
    }
  };

  const pendingCount = submissions.filter(s => verStatuses[s.vendorId] === 'submitted').length;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <AdminNav user={user} onLogout={onLogout} />

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Vendor Management</h1>
          <p className="text-gray-600">Manage vendor accounts and verify document submissions</p>
        </div>

        <Tabs defaultValue="vendors">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="vendors">Vendors</TabsTrigger>
            <TabsTrigger value="verification" className="relative">
              Verification
              {pendingCount > 0 && (
                <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-orange-500 text-white text-xs font-bold">
                  {pendingCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* ── Vendors Tab ── */}
          <TabsContent value="vendors">
            {/* Search */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search vendors by name, owner, or category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">{vendors.length}</p>
                  <p className="text-sm text-gray-600">Total Vendors</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">{vendors.filter(v => v.status === 'active').length}</p>
                  <p className="text-sm text-gray-600">Active</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-yellow-600">{vendors.filter(v => v.status === 'pending').length}</p>
                  <p className="text-sm text-gray-600">Pending</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-red-600">{vendors.filter(v => v.status === 'suspended').length}</p>
                  <p className="text-sm text-gray-600">Suspended</p>
                </CardContent>
              </Card>
            </div>

            {/* Vendor sub-tabs */}
            <Tabs defaultValue="all">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="all">All ({filteredVendors.length})</TabsTrigger>
                <TabsTrigger value="active">Active ({getVendorsByStatus('active').length})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({getVendorsByStatus('pending').length})</TabsTrigger>
                <TabsTrigger value="suspended">Suspended ({getVendorsByStatus('suspended').length})</TabsTrigger>
              </TabsList>

              {['all', 'active', 'pending', 'suspended'].map(status => (
                <TabsContent key={status} value={status} className="space-y-4">
                  {getVendorsByStatus(status).map((vendor) => (
                    <Card key={vendor.id}>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h3 className="text-xl font-bold text-gray-900">{vendor.name}</h3>
                              {getStatusBadge(vendor.status)}
                              <Badge variant="outline">{vendor.category}</Badge>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <p className="text-sm text-gray-500">Owner</p>
                                <p className="font-medium text-gray-900">{vendor.owner}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Joined</p>
                                <p className="font-medium text-gray-900">{vendor.joined}</p>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-4 text-sm mb-4">
                              <div className="flex items-center gap-2 text-gray-600">
                                <Mail className="w-4 h-4" />
                                <span>{vendor.email}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <Phone className="w-4 h-4" />
                                <span>{vendor.phone}</span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                              <div>
                                <p className="text-sm text-gray-600">Total Revenue</p>
                                <p className="text-lg font-bold text-green-600">${vendor.totalRevenue.toFixed(2)}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Events Participated</p>
                                <p className="text-lg font-bold text-purple-600">{vendor.events}</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex md:flex-col gap-2">
                            {vendor.status === 'pending' && (
                              <>
                                <Button
                                  className="flex-1 md:flex-none bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                                  onClick={() => approveVendor(vendor.id)}
                                >
                                  <CheckCircle2 className="w-4 h-4 mr-2" />
                                  Approve
                                </Button>
                                <Button
                                  variant="outline"
                                  className="flex-1 md:flex-none text-red-600 border-red-600 hover:bg-red-50"
                                  onClick={() => rejectVendor(vendor.id)}
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Reject
                                </Button>
                              </>
                            )}
                            {vendor.status === 'active' && (
                              <>
                                <Button variant="outline" className="flex-1 md:flex-none">
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </Button>
                                <Button
                                  variant="outline"
                                  className="flex-1 md:flex-none text-red-600 border-red-600 hover:bg-red-50"
                                  onClick={() => suspendVendor(vendor.id)}
                                >
                                  Suspend
                                </Button>
                              </>
                            )}
                            {vendor.status === 'suspended' && (
                              <Button
                                variant="outline"
                                className="flex-1 md:flex-none"
                                onClick={() => approveVendor(vendor.id)}
                              >
                                Reactivate
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {getVendorsByStatus(status).length === 0 && (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-700 mb-2">No vendors found</h3>
                        <p className="text-gray-500">No vendors match your current filter</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </TabsContent>

          {/* ── Verification Tab ── */}
          <TabsContent value="verification">
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-500 text-sm">Review and approve vendor document submissions</p>
              {pendingCount > 0 && (
                <Badge className="bg-orange-500 text-white text-sm px-3 py-1">{pendingCount} Pending</Badge>
              )}
            </div>

            {submissions.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center text-gray-400">
                  <Clock className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No submissions yet</p>
                  <p className="text-sm mt-1">Vendor document submissions will appear here</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {submissions.map(sub => {
                  const statusVal = verStatuses[sub.vendorId] ?? 'pending';
                  const isExpanded = expanded === sub.vendorId;

                  return (
                    <Card key={sub.vendorId} className={`overflow-hidden ${statusVal === 'submitted' ? 'border-orange-200' : ''}`}>
                      <CardContent className="p-0">
                        {/* Summary row */}
                        <div
                          className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => setExpanded(isExpanded ? null : sub.vendorId)}
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                              {sub.vendorName.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 truncate">{sub.vendorName}</p>
                              <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                                <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{sub.vendorEmail}</span>
                                <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{sub.vendorCategory || 'N/A'}</span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(sub.submittedAt).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0 ml-4">
                            {getVerStatusBadge(sub.vendorId)}
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                          </div>
                        </div>

                        {/* Expanded details */}
                        {isExpanded && (
                          <div className="border-t px-4 pb-4 pt-4 bg-gray-50 space-y-4">
                            {/* Documents */}
                            <div>
                              <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                                <FileText className="w-4 h-4" /> Submitted Documents
                              </p>
                              <div className="grid grid-cols-2 gap-2">
                                {[
                                  { key: 'businessLicense',   label: 'Business License (ACRA)' },
                                  { key: 'sfaLicense',        label: 'SFA Food Stall License'  },
                                  { key: 'personalId',        label: 'Personal ID (NRIC/Passport)' },
                                  { key: 'pastParticipation', label: 'Past Participation Proof' },
                                ].map(({ key, label }) => {
                                  const checked = sub.documents[key as keyof typeof sub.documents];
                                  return (
                                    <div key={key} className={`flex items-center gap-2 p-2 rounded-lg text-sm ${
                                      checked ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-400'
                                    }`}>
                                      {checked
                                        ? <CheckCircle2 className="w-4 h-4 shrink-0" />
                                        : <XCircle className="w-4 h-4 shrink-0" />}
                                      {label}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Notes */}
                            {sub.notes && (
                              <div>
                                <p className="text-sm font-semibold text-gray-700 mb-1">Vendor Notes</p>
                                <p className="text-sm text-gray-600 bg-white border rounded-lg px-3 py-2">{sub.notes}</p>
                              </div>
                            )}

                            {/* Actions */}
                            {statusVal === 'submitted' && (
                              <div className="flex flex-col gap-3">
                                {rejectId === sub.vendorId ? (
                                  <div className="space-y-2">
                                    <textarea
                                      value={reason}
                                      onChange={e => setReason(e.target.value)}
                                      placeholder="Enter rejection reason for the vendor..."
                                      rows={3}
                                      className="w-full rounded-lg border border-red-200 bg-white px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
                                    />
                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        onClick={() => handleReject(sub.vendorId)}
                                        disabled={!reason.trim()}
                                        className="bg-red-500 hover:bg-red-600 text-white"
                                      >
                                        Confirm Rejection
                                      </Button>
                                      <Button size="sm" variant="outline" onClick={() => { setRejectId(null); setReason(''); }}>
                                        Cancel
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex gap-3">
                                    <Button
                                      onClick={() => handleApprove(sub.vendorId)}
                                      className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                                    >
                                      <CheckCircle2 className="w-4 h-4 mr-2" />
                                      Approve Vendor
                                    </Button>
                                    <Button
                                      variant="outline"
                                      onClick={() => setRejectId(sub.vendorId)}
                                      className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                                    >
                                      <XCircle className="w-4 h-4 mr-2" />
                                      Reject
                                    </Button>
                                  </div>
                                )}
                              </div>
                            )}

                            {statusVal === 'approved' && (
                              <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                                <CheckCircle2 className="w-4 h-4 shrink-0" />
                                This vendor has been approved and has full portal access.
                              </div>
                            )}

                            {statusVal === 'rejected' && (
                              <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                                <XCircle className="w-4 h-4 shrink-0" />
                                Application rejected. Vendor can resubmit after addressing the feedback.
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
