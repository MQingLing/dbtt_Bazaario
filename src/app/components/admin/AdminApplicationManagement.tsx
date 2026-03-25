import { useState } from 'react';
import AdminNav from './AdminNav';
import { User } from '../../App';
import { VendorApplication, ApplicationStatus } from '../../data/mockData';
import { getApplications, updateApplicationStatus } from '../../services/dataStore';
import { Card, CardContent } from '../shared/card';
import { Badge } from '../shared/badge';
import { Button } from '../shared/button';
import { Input } from '../shared/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../shared/dialog';
import { 
  Search, Filter, Calendar, DollarSign,
  CheckCircle, XCircle, Clock, FileText, User as UserIcon,
  Mail, Phone, TrendingUp 
} from 'lucide-react';

interface AdminApplicationManagementProps {
  user: User;
  onLogout: () => void;
}


const getStatusConfig = (status: ApplicationStatus) => {
  switch (status) {
    case 'submitted':
      return { label: 'Submitted', color: 'bg-blue-100 text-blue-700', variant: 'default' as const };
    case 'under-review':
      return { label: 'Under Review', color: 'bg-yellow-100 text-yellow-700', variant: 'default' as const };
    case 'approved':
      return { label: 'Approved', color: 'bg-green-100 text-green-700', variant: 'default' as const };
    case 'paid':
      return { label: 'Paid', color: 'bg-purple-100 text-purple-700', variant: 'default' as const };
    case 'waitlisted':
      return { label: 'Waitlisted', color: 'bg-orange-100 text-orange-700', variant: 'default' as const };
    case 'rejected':
      return { label: 'Rejected', color: 'bg-red-100 text-red-700', variant: 'destructive' as const };
    default:
      return { label: status, color: 'bg-gray-100 text-gray-700', variant: 'default' as const };
  }
};

export default function AdminApplicationManagement({ user, onLogout }: AdminApplicationManagementProps) {
  const [applications, setApplications] = useState<VendorApplication[]>(() => getApplications());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<ApplicationStatus | 'all'>('all');
  const [filterEvent, setFilterEvent] = useState<string>('all');
  const [selectedApplication, setSelectedApplication] = useState<VendorApplication | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [assignedStallNumber, setAssignedStallNumber] = useState('');

  const events = Array.from(new Set(applications.map(app => ({ id: app.eventId, name: app.eventName }))));

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.applicationId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
    const matchesEvent = filterEvent === 'all' || app.eventId === filterEvent;
    return matchesSearch && matchesStatus && matchesEvent;
  });

  const statusCounts = {
    all: applications.length,
    submitted: applications.filter(a => a.status === 'submitted').length,
    'under-review': applications.filter(a => a.status === 'under-review').length,
    approved: applications.filter(a => a.status === 'approved').length,
    paid: applications.filter(a => a.status === 'paid').length,
    waitlisted: applications.filter(a => a.status === 'waitlisted').length,
    rejected: applications.filter(a => a.status === 'rejected').length
  };

  const handleReview = (application: VendorApplication) => {
    setSelectedApplication(application);
    setAssignedStallNumber('');
    setIsReviewDialogOpen(true);
  };

  const applyStatus = (status: ApplicationStatus) => {
    if (!selectedApplication) return;
    updateApplicationStatus(selectedApplication.id, status);
    setApplications(getApplications());
    setIsReviewDialogOpen(false);
    setSelectedApplication(null);
  };

  const handleApprove  = () => applyStatus('approved');
  const handleWaitlist = () => applyStatus('waitlisted');
  const handleReject   = () => {
    if (confirm('Are you sure you want to reject this application?')) applyStatus('rejected');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <AdminNav user={user} onLogout={onLogout} />

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Application Management</h1>
          <p className="text-gray-600">Review and manage vendor stall applications</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-4">
              <p className="text-xs text-blue-700 mb-1">Total</p>
              <p className="text-2xl font-bold text-blue-900">{statusCounts.all}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
            <CardContent className="p-4">
              <p className="text-xs text-yellow-700 mb-1">Under Review</p>
              <p className="text-2xl font-bold text-yellow-900">{statusCounts['under-review']}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-4">
              <p className="text-xs text-green-700 mb-1">Approved</p>
              <p className="text-2xl font-bold text-green-900">{statusCounts.approved}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-4">
              <p className="text-xs text-purple-700 mb-1">Paid</p>
              <p className="text-2xl font-bold text-purple-900">{statusCounts.paid}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-4">
              <p className="text-xs text-orange-700 mb-1">Waitlisted</p>
              <p className="text-2xl font-bold text-orange-900">{statusCounts.waitlisted}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-red-50 to-red-100">
            <CardContent className="p-4">
              <p className="text-xs text-red-700 mb-1">Rejected</p>
              <p className="text-2xl font-bold text-red-900">{statusCounts.rejected}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-gray-50 to-gray-100">
            <CardContent className="p-4">
              <p className="text-xs text-gray-700 mb-1">Submitted</p>
              <p className="text-2xl font-bold text-gray-900">{statusCounts.submitted}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search applications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as ApplicationStatus | 'all')}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="submitted">Submitted</option>
                    <option value="under-review">Under Review</option>
                    <option value="approved">Approved</option>
                    <option value="paid">Paid</option>
                    <option value="waitlisted">Waitlisted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={filterEvent}
                    onChange={(e) => setFilterEvent(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Events</option>
                    {events.map((event, idx) => (
                      <option key={idx} value={event.id}>{event.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Applications Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Application ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stall Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredApplications.map((application) => {
                    const statusConfig = getStatusConfig(application.status);
                    return (
                      <tr key={application.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">{application.applicationId}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{application.vendorName}</div>
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              {application.vendorRating} rating • {application.previousEvents} events
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{application.eventName}</div>
                            <div className="text-sm text-gray-500">
                              {new Date(application.eventDate).toLocaleDateString('en-SG', { 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{application.stallCategory}</div>
                            <div className="text-sm text-gray-500">{application.stallSize}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1 text-sm font-semibold text-purple-600">
                            <DollarSign className="w-4 h-4" />
                            {application.bidAmount || application.fixedPrice}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Button
                            size="sm"
                            onClick={() => handleReview(application)}
                            variant="outline"
                          >
                            Review
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredApplications.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No applications found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Review Dialog */}
      {selectedApplication && (
        <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Review Application</DialogTitle>
              <DialogDescription>
                Application ID: {selectedApplication.applicationId}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Vendor Info */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Vendor Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Name</p>
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-gray-400" />
                      <p className="text-sm font-medium">{selectedApplication.vendorName}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Email</p>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <p className="text-sm font-medium">{selectedApplication.vendorEmail}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Phone</p>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <p className="text-sm font-medium">{selectedApplication.vendorPhone}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Performance</p>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-gray-400" />
                      <p className="text-sm font-medium">
                        {selectedApplication.vendorRating} rating • {selectedApplication.previousEvents} events
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Event & Stall Info */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Stall Request</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Event</p>
                    <p className="text-sm font-medium">{selectedApplication.eventName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Event Date</p>
                    <p className="text-sm font-medium">
                      {new Date(selectedApplication.eventDate).toLocaleDateString('en-SG', { 
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Stall Category</p>
                    <p className="text-sm font-medium">{selectedApplication.stallCategory}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Stall Size</p>
                    <p className="text-sm font-medium">{selectedApplication.stallSize}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">
                      {selectedApplication.pricingModel === 'fixed' ? 'Fixed Price' : 'Bid Amount'}
                    </p>
                    <div className="flex items-center gap-1 text-sm font-semibold text-purple-600">
                      <DollarSign className="w-4 h-4" />
                      ${selectedApplication.bidAmount || selectedApplication.fixedPrice}
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedApplication.notes && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Additional Notes</h3>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {selectedApplication.notes}
                  </p>
                </div>
              )}

              {/* Documents */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Supporting Documents</h3>
                <div className="space-y-2">
                  {selectedApplication.documents.map((doc, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 p-2 rounded">
                      <FileText className="w-4 h-4 text-gray-400" />
                      {doc}
                    </div>
                  ))}
                </div>
              </div>

              {/* Assign Stall (if approving) */}
              {selectedApplication.status !== 'approved' && selectedApplication.status !== 'paid' && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Assign Stall Number (Optional)</h3>
                  <Input
                    type="text"
                    placeholder="e.g., A-12"
                    value={assignedStallNumber}
                    onChange={(e) => setAssignedStallNumber(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    You can assign a stall number now or later
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                {selectedApplication.status !== 'approved' && selectedApplication.status !== 'paid' && (
                  <>
                    <Button
                      onClick={handleApprove}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      onClick={handleWaitlist}
                      className="flex-1 bg-orange-600 hover:bg-orange-700"
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Waitlist
                    </Button>
                    <Button
                      onClick={handleReject}
                      variant="destructive"
                      className="flex-1"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </>
                )}
                {(selectedApplication.status === 'approved' || selectedApplication.status === 'paid') && (
                  <div className="w-full text-center py-4 bg-green-50 text-green-700 rounded-lg">
                    This application has already been {selectedApplication.status}
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
