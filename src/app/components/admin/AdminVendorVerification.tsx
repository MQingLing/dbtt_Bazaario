import { useState } from 'react';
import AdminNav from './AdminNav';
import { User } from '../../App';
import { Card, CardContent } from '../shared/card';
import { Badge } from '../shared/badge';
import { Button } from '../shared/button';
import { getAllVendorSubmissions, VendorDocSubmission } from '../../services/dataStore';
import { updateUser, getAllUsers } from '../../services/authStore';
import { CheckCircle2, XCircle, Clock, FileText, User as UserIcon, Mail, Tag, ChevronDown, ChevronUp } from 'lucide-react';

interface AdminVendorVerificationProps {
  user: User;
  onLogout: () => void;
}

export default function AdminVendorVerification({ user, onLogout }: AdminVendorVerificationProps) {
  const [submissions, setSubmissions] = useState<VendorDocSubmission[]>(() => getAllVendorSubmissions());
  const [expanded,  setExpanded]  = useState<string | null>(null);
  const [rejectId,  setRejectId]  = useState<string | null>(null);
  const [reason,    setReason]    = useState('');
  const [statuses,  setStatuses]  = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    getAllUsers().forEach(u => { if (u.verificationStatus) map[u.id] = u.verificationStatus; });
    return map;
  });

  const refresh = () => {
    setSubmissions(getAllVendorSubmissions());
    const map: Record<string, string> = {};
    getAllUsers().forEach(u => { if (u.verificationStatus) map[u.id] = u.verificationStatus; });
    setStatuses(map);
  };

  const handleApprove = (vendorId: string) => {
    updateUser(vendorId, { verificationStatus: 'approved', verificationRejectionReason: undefined });
    refresh();
  };

  const handleReject = (vendorId: string) => {
    if (!reason.trim()) return;
    updateUser(vendorId, { verificationStatus: 'rejected', verificationRejectionReason: reason.trim() });
    setRejectId(null);
    setReason('');
    refresh();
  };

  const getStatusBadge = (vendorId: string) => {
    const s = statuses[vendorId] ?? 'pending';
    switch (s) {
      case 'approved':  return <Badge className="bg-green-100 text-green-700 border-green-200">Approved</Badge>;
      case 'rejected':  return <Badge className="bg-red-100 text-red-700 border-red-200">Rejected</Badge>;
      case 'submitted': return <Badge className="bg-orange-100 text-orange-700 border-orange-200">Pending Review</Badge>;
      default:          return <Badge className="bg-gray-100 text-gray-600 border-gray-200">Pending Docs</Badge>;
    }
  };

  const pendingCount = submissions.filter(s => statuses[s.vendorId] === 'submitted').length;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <AdminNav user={user} onLogout={onLogout} />

      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Vendor Verification</h1>
            <p className="text-gray-500">Review and approve vendor document submissions</p>
          </div>
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
              const statusVal = statuses[sub.vendorId] ?? 'pending';
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
                        {getStatusBadge(sub.vendorId)}
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
                            <p className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                              <UserIcon className="w-4 h-4" /> Vendor Notes
                            </p>
                            <p className="text-sm text-gray-600 bg-white border rounded-lg px-3 py-2">{sub.notes}</p>
                          </div>
                        )}

                        {/* Actions — only for pending review */}
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
      </div>
    </div>
  );
}
