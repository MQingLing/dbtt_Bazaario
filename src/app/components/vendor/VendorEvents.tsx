import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router';
import { User } from '../../App';
import {
  MapPin, Calendar, DollarSign, Users, Gavel, Search, Filter,
  FileText, AlertCircle, CheckCircle, XCircle, Hourglass, CreditCard, Clock,
} from 'lucide-react';
import VendorNav from './VendorNav';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../shared/dialog';
import { Badge } from '../shared/badge';
import { pasarMalamEvents, getEventStatus } from '../../data/pasarMalamData';
import { getEventVendors } from '../../data/vendors';

interface VendorEventsProps {
  user: User;
  onLogout: () => void;
}

// ── Types ────────────────────────────────────────────────────────────────────

type AppStatus     = 'open' | 'closing-soon' | 'closed';
type PricingModel  = 'fixed' | 'bidding';
type AppStatusKey  = 'draft' | 'submitted' | 'under-review' | 'approved' | 'paid' | 'waitlisted' | 'rejected' | 'cancelled';

interface EventListing {
  id: string;
  name: string;
  date: string;
  location: string;
  imageUrl: string;
  totalStalls: number;
  availableStalls: number;
  pricingModel: PricingModel;
  minPrice?: number;
  minBid?: number;
  categories: string[];
  applicationDeadline: string;
  status: AppStatus;
}

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
  status: AppStatusKey;
  statusMessage?: string;
  assignedStall?: string;
  paymentDue?: string;
  pricingModel: PricingModel;
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const EVENT_IMAGES = [
  'https://images.unsplash.com/photo-1763621470208-efe14b618119?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaW5nYXBvcmUlMjBuaWdodCUyMG1hcmtldCUyMGZvb2QlMjBzdGFsbHN8ZW58MXx8fHwxNzcyNzE4OTUzfDA&ixlib=rb-4.1.0&q=80&w=800',
  'https://images.unsplash.com/photo-1771804359368-0f91f81ee83b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMHN0cmVldCUyMGZvb2QlMjBjb2xvcmZ1bHxlbnwxfHx8fDE3NzI3MTg5NTR8MA&ixlib=rb-4.1.0&q=80&w=800',
  'https://images.unsplash.com/photo-1768900318217-4c7677ffc2c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuaWdodCUyMG1hcmtldCUyMGxhbnRlcm5zJTIwYXNpYXxlbnwxfHx8fDE3NzI3MTg5NTR8MA&ixlib=rb-4.1.0&q=80&w=800',
];

const mockApplications: Application[] = [
  { id: 'APP001', eventName: 'Chinatown CNY Night Market',      eventDate: '2026-01-25', eventLocation: 'Chinatown Complex',    eventImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&auto=format&fit=crop',    stallCategory: 'Food Stall',             stallSize: 'Medium (4m x 3m)', bidAmount: 225, submittedDate: '2025-12-15', status: 'approved',     statusMessage: 'Congratulations! Your bid has been accepted.',                    paymentDue: '2026-01-05',  pricingModel: 'bidding' },
  { id: 'APP002', eventName: 'Geylang Serai Ramadan Bazaar',    eventDate: '2026-03-15', eventLocation: 'Geylang Serai Market', eventImage: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400&auto=format&fit=crop',  stallCategory: 'Food Stall',             stallSize: 'Large (5m x 4m)',  fixedPrice: 400, submittedDate: '2026-01-20', status: 'paid',         statusMessage: 'Payment received. Stall confirmed!', assignedStall: 'A-12', pricingModel: 'fixed'   },
  { id: 'APP003', eventName: 'Marina Bay Countdown Market',     eventDate: '2026-12-31', eventLocation: 'Marina Bay',           eventImage: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&auto=format&fit=crop',   stallCategory: 'Premium Corner Stall',   stallSize: 'Large (5m x 5m)',  bidAmount: 450, submittedDate: '2026-02-01', status: 'under-review', statusMessage: 'Your application is being reviewed by the organizers.',          pricingModel: 'bidding' },
  { id: 'APP004', eventName: 'Bugis Street Night Festival',     eventDate: '2026-04-10', eventLocation: 'Bugis Street',         eventImage: 'https://images.unsplash.com/photo-1523942839745-7848c839b661?w=400&auto=format&fit=crop',  stallCategory: 'Food Stall',             stallSize: 'Small (3m x 2m)', fixedPrice: 120, submittedDate: '2026-02-10', status: 'waitlisted',   statusMessage: 'All stalls are currently allocated. You are on the waitlist.',   pricingModel: 'fixed'   },
  { id: 'APP005', eventName: 'Sentosa Beach Night Market',      eventDate: '2026-06-01', eventLocation: 'Siloso Beach, Sentosa', eventImage: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&auto=format&fit=crop', stallCategory: 'Beverages',              stallSize: 'Medium (4m x 3m)', bidAmount: 180, submittedDate: '2026-02-25', status: 'rejected',     statusMessage: 'Unfortunately, your bid was not successful this time.',          pricingModel: 'bidding' },
];

function eventPricingModel(id: string): PricingModel {
  return parseInt(id) % 2 === 0 ? 'fixed' : 'bidding';
}
function eventAppStatus(eventStatus: string, endDate: string): AppStatus {
  if (eventStatus === 'completed') return 'closed';
  const daysLeft = (new Date(endDate).getTime() - Date.now()) / 86400000;
  return daysLeft < 7 ? 'closing-soon' : 'open';
}

const STATUS_CONFIG: Record<AppStatusKey, { label: string; color: string; icon: typeof FileText; iconColor: string }> = {
  draft:          { label: 'Draft',                    color: 'bg-gray-100 text-gray-700',     icon: FileText,    iconColor: 'text-gray-500'   },
  submitted:      { label: 'Submitted',                color: 'bg-blue-100 text-blue-700',     icon: CheckCircle, iconColor: 'text-blue-500'   },
  'under-review': { label: 'Under Review',             color: 'bg-yellow-100 text-yellow-700', icon: Hourglass,   iconColor: 'text-yellow-500' },
  approved:       { label: 'Approved – Pending Payment', color: 'bg-green-100 text-green-700', icon: CheckCircle, iconColor: 'text-green-500'  },
  paid:           { label: 'Paid & Confirmed',         color: 'bg-purple-100 text-purple-700', icon: CreditCard,  iconColor: 'text-purple-500' },
  waitlisted:     { label: 'Waitlisted',               color: 'bg-orange-100 text-orange-700', icon: Clock,       iconColor: 'text-orange-500' },
  rejected:       { label: 'Rejected',                 color: 'bg-red-100 text-red-700',       icon: XCircle,     iconColor: 'text-red-500'    },
  cancelled:      { label: 'Cancelled',                color: 'bg-gray-100 text-gray-700',     icon: XCircle,     iconColor: 'text-gray-500'   },
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function VendorEvents({ user, onLogout }: VendorEventsProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') ?? 'browse') as 'browse' | 'applications';
  const setTab = (tab: 'browse' | 'applications') => setSearchParams({ tab });

  // ── Browse tab state ─────────────────────────────────────────────────
  const [searchQuery,  setSearchQuery]  = useState('');
  const [filterModel,  setFilterModel]  = useState<'all' | 'fixed' | 'bidding'>('all');

  const allListings = useMemo<EventListing[]>(() =>
    pasarMalamEvents
      .filter(e => getEventStatus(e) !== 'completed')
      .map(e => {
        const status       = getEventStatus(e);
        const vendors      = getEventVendors(e.id);
        const totalStalls  = vendors.length + 5 + (parseInt(e.id) % 10);
        const avail        = Math.max(1, Math.floor(totalStalls * (0.3 + (parseInt(e.id) % 5) * 0.1)));
        const pricing      = eventPricingModel(e.id);
        const dl           = new Date(e.startDate);
        dl.setDate(dl.getDate() - 14);
        const deadline     = dl < new Date() ? new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10) : dl.toISOString().slice(0, 10);
        return {
          id: e.id, name: e.name, date: e.startDate, location: e.area,
          imageUrl: EVENT_IMAGES[parseInt(e.id) % EVENT_IMAGES.length],
          totalStalls, availableStalls: avail, pricingModel: pricing,
          ...(pricing === 'fixed' ? { minPrice: 100 + (parseInt(e.id) % 10) * 20 } : { minBid: 120 + (parseInt(e.id) % 8) * 25 }),
          categories: ['Food Stall', 'Non-Food Stall', 'Premium Corner', 'Games'],
          applicationDeadline: deadline,
          status: eventAppStatus(status, e.endDate),
        };
      }),
  []);

  const filteredEvents = allListings.filter(ev =>
    (ev.name.toLowerCase().includes(searchQuery.toLowerCase()) || ev.location.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (filterModel === 'all' || ev.pricingModel === filterModel)
  );

  // ── My Applications tab state ────────────────────────────────────────
  const [appSearch,     setAppSearch]     = useState('');
  const [appFilter,     setAppFilter]     = useState<AppStatusKey | 'all'>('all');
  const [detailsApp,    setDetailsApp]    = useState<Application | null>(null);
  const [paidIds,       setPaidIds]       = useState<string[]>([]);

  const filteredApps = mockApplications.filter(a =>
    (a.eventName.toLowerCase().includes(appSearch.toLowerCase()) || a.eventLocation.toLowerCase().includes(appSearch.toLowerCase())) &&
    (appFilter === 'all' || a.status === appFilter)
  );

  const counts = {
    all:            mockApplications.length,
    'under-review': mockApplications.filter(a => a.status === 'under-review').length,
    approved:       mockApplications.filter(a => a.status === 'approved').length,
    paid:           mockApplications.filter(a => a.status === 'paid').length,
    waitlisted:     mockApplications.filter(a => a.status === 'waitlisted').length,
    rejected:       mockApplications.filter(a => a.status === 'rejected').length,
  };

  const filterButtons: { label: string; value: AppStatusKey | 'all'; activeClass: string }[] = [
    { label: `All (${counts.all})`,                       value: 'all',          activeClass: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' },
    { label: `Under Review (${counts['under-review']})`,  value: 'under-review', activeClass: 'bg-yellow-500 text-white' },
    { label: `Approved (${counts.approved})`,             value: 'approved',     activeClass: 'bg-green-500 text-white' },
    { label: `Confirmed (${counts.paid})`,                value: 'paid',         activeClass: 'bg-purple-500 text-white' },
    { label: `Waitlisted (${counts.waitlisted})`,         value: 'waitlisted',   activeClass: 'bg-orange-500 text-white' },
    { label: `Rejected (${counts.rejected})`,             value: 'rejected',     activeClass: 'bg-red-500 text-white' },
  ];

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
      <VendorNav user={user} onLogout={onLogout} />

      <div className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8">

        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent mb-1">
            Pasar Malam Events
          </h1>
          <p className="text-gray-600">Browse upcoming events, apply for stalls, and track your applications</p>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 bg-white rounded-xl shadow-sm p-1.5 mb-6 w-fit">
          <button
            onClick={() => setTab('browse')}
            className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'browse'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Browse Events
          </button>
          <button
            onClick={() => setTab('applications')}
            className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
              activeTab === 'applications'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            My Applications
            {counts.all > 0 && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                activeTab === 'applications' ? 'bg-white/20' : 'bg-purple-100 text-purple-700'
              }`}>{counts.all}</span>
            )}
          </button>
        </div>

        {/* ── BROWSE TAB ─────────────────────────────────────────────── */}
        {activeTab === 'browse' && (
          <>
            {/* Search + filter */}
            <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search events or locations..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={filterModel}
                    onChange={e => setFilterModel(e.target.value as 'all' | 'fixed' | 'bidding')}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white appearance-none"
                  >
                    <option value="all">All Pricing Models</option>
                    <option value="fixed">Fixed Price</option>
                    <option value="bidding">Bidding</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Event grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map(ev => (
                <Link
                  key={ev.id}
                  to={`/vendor/apply-events/${ev.id}`}
                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all group"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img src={ev.imageUrl} alt={ev.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute top-3 right-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        ev.status === 'open' ? 'bg-green-500 text-white' :
                        ev.status === 'closing-soon' ? 'bg-orange-500 text-white' : 'bg-gray-500 text-white'
                      }`}>
                        {ev.status === 'open' ? 'Open' : ev.status === 'closing-soon' ? 'Closing Soon' : 'Closed'}
                      </span>
                    </div>
                    <div className="absolute top-3 left-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                        ev.pricingModel === 'fixed' ? 'bg-blue-500 text-white' : 'bg-purple-500 text-white'
                      }`}>
                        {ev.pricingModel === 'fixed'
                          ? <><DollarSign className="w-3 h-3" />Fixed Price</>
                          : <><Gavel className="w-3 h-3" />Bidding</>}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-lg mb-3 text-gray-800 group-hover:text-purple-600 transition-colors">{ev.name}</h3>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-purple-500" />
                        {new Date(ev.date).toLocaleDateString('en-SG', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-pink-500" />
                        {ev.location}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-4 h-4 text-orange-500" />
                        {ev.availableStalls} / {ev.totalStalls} stalls available
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">{ev.pricingModel === 'fixed' ? 'Starting from' : 'Min bid'}</p>
                        <p className="font-semibold text-lg text-purple-600">${ev.pricingModel === 'fixed' ? ev.minPrice : ev.minBid}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 mb-1">Apply by</p>
                        <p className="text-sm font-medium text-gray-700">
                          {new Date(ev.applicationDeadline).toLocaleDateString('en-SG', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-3">
                      {ev.categories.slice(0, 3).map((c, i) => (
                        <span key={i} className="px-2 py-1 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 text-xs rounded-full">{c}</span>
                      ))}
                      {ev.categories.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">+{ev.categories.length - 3}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {filteredEvents.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <Search className="w-12 h-12 text-purple-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No events found</h3>
                <p className="text-gray-600">Try adjusting your search or filter</p>
              </div>
            )}
          </>
        )}

        {/* ── MY APPLICATIONS TAB ──────────────────────────────────────── */}
        {activeTab === 'applications' && (
          <>
            {/* Status filter */}
            <div className="bg-white rounded-xl shadow-sm p-2 mb-4">
              <div className="flex flex-wrap gap-2">
                {filterButtons.map(btn => (
                  <button
                    key={btn.value}
                    onClick={() => setAppFilter(btn.value)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      appFilter === btn.value ? btn.activeClass : 'text-gray-600 hover:bg-gray-100'
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
                  value={appSearch}
                  onChange={e => setAppSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Application cards */}
            <div className="space-y-4">
              {filteredApps.map(app => {
                const cfg       = STATUS_CONFIG[app.status];
                const StatusIcon = cfg.icon;
                const justPaid  = paidIds.includes(app.id);
                const statusBg  = {
                  approved: 'bg-green-50', paid: 'bg-purple-50', 'under-review': 'bg-yellow-50',
                  waitlisted: 'bg-orange-50', rejected: 'bg-red-50',
                }[app.status] ?? 'bg-gray-50';

                return (
                  <div key={app.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all">
                    <div className="p-6">
                      <div className="flex flex-col lg:flex-row gap-6">
                        <div className="w-full lg:w-48 h-32 lg:h-auto rounded-lg overflow-hidden flex-shrink-0">
                          <img src={app.eventImage} alt={app.eventName} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-xl font-bold text-gray-800 mb-1">{app.eventName}</h3>
                              <p className="text-sm text-gray-500">Application ID: {app.id}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${cfg.color} flex items-center gap-1 shrink-0`}>
                              <StatusIcon className={`w-3 h-3 ${cfg.iconColor}`} />
                              {cfg.label}
                            </span>
                          </div>

                          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Event Date</p>
                              <div className="flex items-center gap-2 text-sm text-gray-700">
                                <Calendar className="w-4 h-4 text-purple-500" />
                                {new Date(app.eventDate).toLocaleDateString('en-SG', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Location</p>
                              <div className="flex items-center gap-2 text-sm text-gray-700">
                                <MapPin className="w-4 h-4 text-pink-500" />
                                {app.eventLocation}
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Stall</p>
                              <p className="text-sm font-medium text-gray-700">{app.stallCategory} – {app.stallSize}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">{app.pricingModel === 'fixed' ? 'Price' : 'Your Bid'}</p>
                              <div className="flex items-center gap-1 text-sm font-semibold text-purple-600">
                                <DollarSign className="w-4 h-4" />
                                ${app.bidAmount ?? app.fixedPrice}
                              </div>
                            </div>
                          </div>

                          {app.statusMessage && (
                            <div className={`flex items-start gap-2 p-3 rounded-lg mb-4 ${statusBg}`}>
                              <AlertCircle className={`w-4 h-4 mt-0.5 shrink-0 ${cfg.iconColor}`} />
                              <div className="flex-1 text-sm text-gray-700">
                                {app.statusMessage}
                                {app.status === 'approved' && app.paymentDue && (
                                  <p className="text-xs text-gray-600 mt-1">Payment due: {new Date(app.paymentDue).toLocaleDateString('en-SG', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                )}
                                {app.status === 'paid' && app.assignedStall && (
                                  <p className="text-xs text-purple-700 mt-1 font-medium">Assigned Stall: {app.assignedStall}</p>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="flex gap-3 flex-wrap">
                            {app.status === 'approved' && (
                              justPaid ? (
                                <span className="px-4 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-lg">✓ Payment submitted</span>
                              ) : (
                                <button
                                  onClick={() => setPaidIds(prev => [...prev, app.id])}
                                  className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 font-medium text-sm"
                                >
                                  Complete Payment
                                </button>
                              )
                            )}
                            <button
                              onClick={() => setDetailsApp(app)}
                              className="px-4 py-2 border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 font-medium text-sm"
                            >
                              View Details
                            </button>
                            {(app.status === 'rejected' || app.status === 'cancelled') && (
                              <button
                                onClick={() => setTab('browse')}
                                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium text-sm"
                              >
                                Browse Other Events
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredApps.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <FileText className="w-12 h-12 text-purple-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No applications found</h3>
                <p className="text-gray-600 mb-6">
                  {appSearch || appFilter !== 'all' ? 'Try adjusting your search or filter' : 'Apply for an upcoming event to get started'}
                </p>
                <button
                  onClick={() => setTab('browse')}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg"
                >
                  Browse Events
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* View Details Dialog */}
      {detailsApp && (
        <Dialog open={!!detailsApp} onOpenChange={open => { if (!open) setDetailsApp(null); }}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{detailsApp.eventName}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              {[
                { label: 'Application ID', value: detailsApp.id },
                { label: 'Event Date', value: new Date(detailsApp.eventDate).toLocaleDateString('en-SG', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' }) },
                { label: 'Location', value: detailsApp.eventLocation },
                { label: 'Stall Category', value: detailsApp.stallCategory },
                { label: 'Stall Size', value: detailsApp.stallSize },
                { label: 'Submitted', value: new Date(detailsApp.submittedDate).toLocaleDateString('en-SG', { month: 'short', day: 'numeric', year: 'numeric' }) },
                ...(detailsApp.assignedStall ? [{ label: 'Assigned Stall', value: detailsApp.assignedStall }] : []),
                ...(detailsApp.paymentDue ? [{ label: 'Payment Due', value: new Date(detailsApp.paymentDue).toLocaleDateString('en-SG', { month: 'long', day: 'numeric', year: 'numeric' }) }] : []),
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{label}</span>
                  <span className="text-sm font-medium">{value}</span>
                </div>
              ))}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Status</span>
                <Badge className={`${STATUS_CONFIG[detailsApp.status].color} text-xs`}>{STATUS_CONFIG[detailsApp.status].label}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{detailsApp.pricingModel === 'fixed' ? 'Fixed Price' : 'Bid Amount'}</span>
                <span className="text-sm font-semibold text-purple-600">${detailsApp.bidAmount ?? detailsApp.fixedPrice}</span>
              </div>
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
