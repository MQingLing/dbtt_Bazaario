import { useState } from 'react';
import { Link } from 'react-router';
import { User } from '../../App';
import {
  Calendar, MapPin, DollarSign, Clock,
  FileText, AlertCircle, CheckCircle, XCircle,
  Hourglass, CreditCard, Search,
} from 'lucide-react';
import VendorNav from './VendorNav';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../shared/dialog';
import { Badge } from '../shared/badge';

interface VendorMyApplicationsProps {
  user: User;
  onLogout: () => void;
}

type ApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'under-review'
  | 'approved'
  | 'paid'
  | 'waitlisted'
  | 'rejected'
  | 'cancelled';

interface Application {
  id: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  eventImage: string;
  stallCategory: string;
  stallSize: string;
  bidAmount?: number;
  fixedPrice?: number;
  submittedDate: string;
  status: ApplicationStatus;
  statusMessage?: string;
  assignedStall?: string;
  paymentDue?: string;
  pricingModel: 'fixed' | 'bidding';
}

const mockApplications: Application[] = [
  {
    id: 'APP001',
    eventName: 'Chinatown CNY Night Market',
    eventDate: '2026-01-25',
    eventLocation: 'Chinatown Complex',
    eventImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&auto=format&fit=crop',
    stallCategory: 'Food Stall',
    stallSize: 'Medium (4m x 3m)',
    bidAmount: 225,
    submittedDate: '2025-12-15',
    status: 'approved',
    statusMessage: 'Congratulations! Your bid has been accepted.',
    paymentDue: '2026-01-05',
    pricingModel: 'bidding',
  },
  {
    id: 'APP002',
    eventName: 'Geylang Serai Ramadan Bazaar',
    eventDate: '2026-03-15',
    eventLocation: 'Geylang Serai Market',
    eventImage: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400&auto=format&fit=crop',
    stallCategory: 'Food Stall',
    stallSize: 'Large (5m x 4m)',
    fixedPrice: 400,
    submittedDate: '2026-01-20',
    status: 'paid',
    statusMessage: 'Payment received. Stall confirmed!',
    assignedStall: 'A-12',
    pricingModel: 'fixed',
  },
  {
    id: 'APP003',
    eventName: 'Marina Bay Countdown Market',
    eventDate: '2026-12-31',
    eventLocation: 'Marina Bay',
    eventImage: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&auto=format&fit=crop',
    stallCategory: 'Premium Corner Stall',
    stallSize: 'Large (5m x 5m)',
    bidAmount: 450,
    submittedDate: '2026-02-01',
    status: 'under-review',
    statusMessage: 'Your application is being reviewed by the organizers.',
    pricingModel: 'bidding',
  },
  {
    id: 'APP004',
    eventName: 'Bugis Street Night Festival',
    eventDate: '2026-04-10',
    eventLocation: 'Bugis Street',
    eventImage: 'https://images.unsplash.com/photo-1523942839745-7848c839b661?w=400&auto=format&fit=crop',
    stallCategory: 'Food Stall',
    stallSize: 'Small (3m x 2m)',
    fixedPrice: 120,
    submittedDate: '2026-02-10',
    status: 'waitlisted',
    statusMessage: 'All stalls are currently allocated. You are on the waitlist.',
    pricingModel: 'fixed',
  },
  {
    id: 'APP005',
    eventName: 'Sentosa Beach Night Market',
    eventDate: '2026-06-01',
    eventLocation: 'Siloso Beach, Sentosa',
    eventImage: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&auto=format&fit=crop',
    stallCategory: 'Beverages',
    stallSize: 'Medium (4m x 3m)',
    bidAmount: 180,
    submittedDate: '2026-02-25',
    status: 'rejected',
    statusMessage: 'Unfortunately, your bid was not successful this time.',
    pricingModel: 'bidding',
  },
];

const getStatusConfig = (status: ApplicationStatus) => {
  switch (status) {
    case 'draft':        return { label: 'Draft',                   color: 'bg-gray-100 text-gray-700',   icon: FileText,    iconColor: 'text-gray-500'   };
    case 'submitted':    return { label: 'Submitted',               color: 'bg-blue-100 text-blue-700',   icon: CheckCircle, iconColor: 'text-blue-500'   };
    case 'under-review': return { label: 'Under Review',            color: 'bg-yellow-100 text-yellow-700', icon: Hourglass,  iconColor: 'text-yellow-500' };
    case 'approved':     return { label: 'Approved – Pending Payment', color: 'bg-green-100 text-green-700', icon: CheckCircle, iconColor: 'text-green-500' };
    case 'paid':         return { label: 'Paid & Confirmed',        color: 'bg-purple-100 text-purple-700', icon: CreditCard, iconColor: 'text-purple-500' };
    case 'waitlisted':   return { label: 'Waitlisted',              color: 'bg-orange-100 text-orange-700', icon: Clock,      iconColor: 'text-orange-500' };
    case 'rejected':     return { label: 'Rejected',                color: 'bg-red-100 text-red-700',     icon: XCircle,    iconColor: 'text-red-500'    };
    case 'cancelled':    return { label: 'Cancelled',               color: 'bg-gray-100 text-gray-700',   icon: XCircle,    iconColor: 'text-gray-500'   };
    default:             return { label: status,                    color: 'bg-gray-100 text-gray-700',   icon: FileText,   iconColor: 'text-gray-500'   };
  }
};

export default function VendorMyApplications({ user, onLogout }: VendorMyApplicationsProps) {
  const [searchQuery, setSearchQuery]     = useState('');
  const [filterStatus, setFilterStatus]   = useState<ApplicationStatus | 'all'>('all');
  const [detailsApp, setDetailsApp]       = useState<Application | null>(null);
  const [paidIds, setPaidIds]             = useState<string[]>([]);

  const filteredApplications = mockApplications.filter(app => {
    const matchesSearch =
      app.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.eventLocation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || app.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const statusCounts = {
    all:            mockApplications.length,
    'under-review': mockApplications.filter(a => a.status === 'under-review').length,
    approved:       mockApplications.filter(a => a.status === 'approved').length,
    paid:           mockApplications.filter(a => a.status === 'paid').length,
    waitlisted:     mockApplications.filter(a => a.status === 'waitlisted').length,
    rejected:       mockApplications.filter(a => a.status === 'rejected').length,
  };

  const filterButtons: { label: string; value: ApplicationStatus | 'all'; activeClass: string }[] = [
    { label: `All (${statusCounts.all})`,                       value: 'all',          activeClass: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' },
    { label: `Under Review (${statusCounts['under-review']})`,  value: 'under-review', activeClass: 'bg-yellow-500 text-white' },
    { label: `Approved (${statusCounts.approved})`,             value: 'approved',     activeClass: 'bg-green-500 text-white' },
    { label: `Confirmed (${statusCounts.paid})`,                value: 'paid',         activeClass: 'bg-purple-500 text-white' },
    { label: `Waitlisted (${statusCounts.waitlisted})`,         value: 'waitlisted',   activeClass: 'bg-orange-500 text-white' },
    { label: `Rejected (${statusCounts.rejected})`,             value: 'rejected',     activeClass: 'bg-red-500 text-white' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
      <VendorNav user={user} onLogout={onLogout} />

      <div className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
              My Applications
            </h1>
            <p className="text-gray-600">Track the status of your stall applications</p>
          </div>
          <Link
            to="/vendor/events"
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
          >
            Apply for Event
          </Link>
        </div>

        {/* Filter tabs */}
        <div className="bg-white rounded-xl shadow-sm p-2 mb-6">
          <div className="flex flex-wrap gap-2">
            {filterButtons.map(btn => (
              <button
                key={btn.value}
                onClick={() => setFilterStatus(btn.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filterStatus === btn.value ? btn.activeClass : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by event name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Applications list */}
        <div className="space-y-4">
          {filteredApplications.map((application) => {
            const statusConfig = getStatusConfig(application.status);
            const StatusIcon = statusConfig.icon;
            const justPaid = paidIds.includes(application.id);

            return (
              <div
                key={application.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Event image */}
                    <div className="w-full lg:w-48 h-32 lg:h-auto rounded-lg overflow-hidden flex-shrink-0">
                      <img src={application.eventImage} alt={application.eventName} className="w-full h-full object-cover" />
                    </div>

                    {/* Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-800 mb-1">{application.eventName}</h3>
                          <p className="text-sm text-gray-500">Application ID: {application.id}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.color} flex items-center gap-1 shrink-0`}>
                          <StatusIcon className={`w-3 h-3 ${statusConfig.iconColor}`} />
                          {statusConfig.label}
                        </span>
                      </div>

                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Event Date</p>
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Calendar className="w-4 h-4 text-purple-500" />
                            {new Date(application.eventDate).toLocaleDateString('en-SG', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Location</p>
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <MapPin className="w-4 h-4 text-pink-500" />
                            {application.eventLocation}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Stall</p>
                          <p className="text-sm font-medium text-gray-700">{application.stallCategory} – {application.stallSize}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">{application.pricingModel === 'fixed' ? 'Price' : 'Your Bid'}</p>
                          <div className="flex items-center gap-1 text-sm font-semibold text-purple-600">
                            <DollarSign className="w-4 h-4" />
                            ${application.bidAmount ?? application.fixedPrice}
                          </div>
                        </div>
                      </div>

                      {/* Status message */}
                      {application.statusMessage && (
                        <div className={`flex items-start gap-2 p-3 rounded-lg mb-4 ${
                          application.status === 'approved'     ? 'bg-green-50' :
                          application.status === 'paid'         ? 'bg-purple-50' :
                          application.status === 'under-review' ? 'bg-yellow-50' :
                          application.status === 'waitlisted'   ? 'bg-orange-50' :
                          application.status === 'rejected'     ? 'bg-red-50' : 'bg-gray-50'
                        }`}>
                          <AlertCircle className={`w-4 h-4 mt-0.5 shrink-0 ${
                            application.status === 'approved'     ? 'text-green-600' :
                            application.status === 'paid'         ? 'text-purple-600' :
                            application.status === 'under-review' ? 'text-yellow-600' :
                            application.status === 'waitlisted'   ? 'text-orange-600' :
                            application.status === 'rejected'     ? 'text-red-600' : 'text-gray-600'
                          }`} />
                          <div className="flex-1 text-sm text-gray-700">
                            {application.statusMessage}
                            {application.status === 'approved' && application.paymentDue && (
                              <p className="text-xs text-gray-600 mt-1">
                                Payment due by: {new Date(application.paymentDue).toLocaleDateString('en-SG', { month: 'long', day: 'numeric', year: 'numeric' })}
                              </p>
                            )}
                            {application.status === 'paid' && application.assignedStall && (
                              <p className="text-xs text-purple-700 mt-1 font-medium">Assigned Stall: {application.assignedStall}</p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex gap-3">
                        {application.status === 'approved' && (
                          justPaid ? (
                            <span className="px-4 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-lg">
                              ✓ Payment submitted
                            </span>
                          ) : (
                            <button
                              onClick={() => setPaidIds(prev => [...prev, application.id])}
                              className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all font-medium text-sm"
                            >
                              Complete Payment
                            </button>
                          )
                        )}
                        <button
                          onClick={() => setDetailsApp(application)}
                          className="px-4 py-2 border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 transition-all font-medium text-sm"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredApplications.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No applications found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || filterStatus !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Start by applying for an upcoming event'}
            </p>
            <Link
              to="/vendor/events"
              className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              Browse Events
            </Link>
          </div>
        )}
      </div>

      {/* View Details Dialog */}
      {detailsApp && (
        <Dialog open={!!detailsApp} onOpenChange={(open) => { if (!open) setDetailsApp(null); }}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{detailsApp.eventName}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Application ID</span>
                <span className="text-sm font-medium">{detailsApp.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Status</span>
                <Badge className={`${getStatusConfig(detailsApp.status).color} text-xs`}>
                  {getStatusConfig(detailsApp.status).label}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Event Date</span>
                <span className="text-sm font-medium">
                  {new Date(detailsApp.eventDate).toLocaleDateString('en-SG', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Location</span>
                <span className="text-sm font-medium">{detailsApp.eventLocation}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Stall Category</span>
                <span className="text-sm font-medium">{detailsApp.stallCategory}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Stall Size</span>
                <span className="text-sm font-medium">{detailsApp.stallSize}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{detailsApp.pricingModel === 'fixed' ? 'Fixed Price' : 'Bid Amount'}</span>
                <span className="text-sm font-semibold text-purple-600">
                  ${detailsApp.bidAmount ?? detailsApp.fixedPrice}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Submitted</span>
                <span className="text-sm font-medium">
                  {new Date(detailsApp.submittedDate).toLocaleDateString('en-SG', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              {detailsApp.assignedStall && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Assigned Stall</span>
                  <span className="text-sm font-semibold text-purple-700">{detailsApp.assignedStall}</span>
                </div>
              )}
              {detailsApp.paymentDue && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Payment Due</span>
                  <span className="text-sm font-medium text-orange-600">
                    {new Date(detailsApp.paymentDue).toLocaleDateString('en-SG', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              )}
              {detailsApp.statusMessage && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-gray-500 mb-1">Status Message</p>
                  <p className="text-sm text-gray-700">{detailsApp.statusMessage}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
