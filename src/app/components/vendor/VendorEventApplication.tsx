import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { User } from '../../App';
import {
  MapPin, Calendar, Clock, DollarSign, Users, Gavel,
  ArrowLeft, Info, Upload, FileText, CheckCircle, AlertCircle,
  TrendingUp, Tag,
} from 'lucide-react';
import VendorNavBar from './VendorNavBar';
import { pasarMalamEvents, getEventStatus } from '../../data/pasarMalamData';
import { getEventVendors } from '../../data/vendors';

interface VendorEventApplicationProps {
  user: User;
  onLogout: () => void;
}

interface StallCategory {
  id: string;
  name: string;
  description: string;
  basePrice: number;   // for fixed-price events
  minBid: number;      // for bidding events
  sizes: { id: string; name: string; dimensions: string; priceModifier: number }[];
}

type PricingModel = 'fixed' | 'bidding';

function eventPricingModel(id: string): PricingModel {
  return parseInt(id) % 2 === 0 ? 'fixed' : 'bidding';
}

const STALL_CATEGORIES: StallCategory[] = [
  {
    id: 'food',
    name: 'Food Stall',
    description: 'Cooked food, snacks, and beverages',
    basePrice: 150,
    minBid: 150,
    sizes: [
      { id: 'small',  name: 'Small',  dimensions: '3m × 2m', priceModifier: 1   },
      { id: 'medium', name: 'Medium', dimensions: '4m × 3m', priceModifier: 1.5 },
      { id: 'large',  name: 'Large',  dimensions: '5m × 4m', priceModifier: 2   },
    ],
  },
  {
    id: 'non-food',
    name: 'Non-Food Stall',
    description: 'Retail goods, accessories, and merchandise',
    basePrice: 120,
    minBid: 120,
    sizes: [
      { id: 'small',  name: 'Small',  dimensions: '3m × 2m', priceModifier: 1   },
      { id: 'medium', name: 'Medium', dimensions: '4m × 3m', priceModifier: 1.5 },
    ],
  },
  {
    id: 'premium',
    name: 'Premium Corner',
    description: 'High-traffic corner location with extra visibility',
    basePrice: 250,
    minBid: 250,
    sizes: [
      { id: 'large', name: 'Large', dimensions: '5m × 5m', priceModifier: 1 },
    ],
  },
];

const EVENT_IMAGES = [
  'https://images.unsplash.com/photo-1763621470208-efe14b618119?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaW5nYXBvcmUlMjBuaWdodCUyMG1hcmtldCUyMGZvb2QlMjBzdGFsbHN8ZW58MXx8fHwxNzcyNzE4OTUzfDA&ixlib=rb-4.1.0&q=80&w=800',
  'https://images.unsplash.com/photo-1771804359368-0f91f81ee83b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMHN0cmVldCUyMGZvb2QlMjBjb2xvcmZ1bHxlbnwxfHx8fDE3NzI3MTg5NTR8MA&ixlib=rb-4.1.0&q=80&w=800',
  'https://images.unsplash.com/photo-1768900318217-4c7677ffc2c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuaWdodCUyMG1hcmtldCUyMGxhbnRlcm5zJTIwYXNpYXxlbnwxfHx8fDE3NzI3MTg5NTR8MA&ixlib=rb-4.1.0&q=80&w=800',
];

export default function VendorEventApplication({ user, onLogout }: VendorEventApplicationProps) {
  const { eventId } = useParams();
  const navigate     = useNavigate();

  // ── Load real event data ──────────────────────────────────────────────────
  const event = useMemo(() => pasarMalamEvents.find(e => e.id === eventId), [eventId]);

  const pricingModel = useMemo<PricingModel>(
    () => (event ? eventPricingModel(event.id) : 'fixed'),
    [event],
  );

  const { totalStalls, availableStalls, applicationDeadline, imageUrl } = useMemo(() => {
    if (!event) return { totalStalls: 0, availableStalls: 0, applicationDeadline: '', imageUrl: EVENT_IMAGES[0] };
    const vendors      = getEventVendors(event.id);
    const total        = vendors.length + 5 + (parseInt(event.id) % 10);
    const available    = Math.max(1, Math.floor(total * (0.3 + (parseInt(event.id) % 5) * 0.1)));
    const deadlineDate = new Date(event.startDate);
    deadlineDate.setDate(deadlineDate.getDate() - 14);
    const deadline = deadlineDate < new Date()
      ? new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)
      : deadlineDate.toISOString().slice(0, 10);
    return {
      totalStalls:         total,
      availableStalls:     available,
      applicationDeadline: deadline,
      imageUrl:            EVENT_IMAGES[parseInt(event.id) % EVENT_IMAGES.length],
    };
  }, [event]);

  const eventStatus = event ? getEventStatus(event) : 'upcoming';

  // ── Event duration (days) ─────────────────────────────────────────────────
  const eventDays = useMemo(() => {
    if (!event) return 1;
    const ms = new Date(event.endDate).getTime() - new Date(event.startDate).getTime();
    return Math.max(1, Math.round(ms / 86400000) + 1);
  }, [event]);

  // ── Form state ────────────────────────────────────────────────────────────
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSize,     setSelectedSize]     = useState('');
  const [bidAmount,        setBidAmount]        = useState('');
  const [notes,            setNotes]            = useState('');
  const [docs,             setDocs]             = useState<Record<string, boolean>>({});
  const [premiumIsFood,    setPremiumIsFood]    = useState(false);
  const [showSuccess,      setShowSuccess]      = useState(false);

  const categoryData = STALL_CATEGORIES.find(c => c.id === selectedCategory);
  const sizeData     = categoryData?.sizes.find(s => s.id === selectedSize);

  // Food stall: always food. Premium: depends on checkbox. Non-food: never.
  const isFoodCategory = selectedCategory === 'food' || (selectedCategory === 'premium' && premiumIsFood);

  // Per-day rate × days for fixed; base amount for bidding
  const dailyRate = categoryData
    ? (pricingModel === 'fixed' ? categoryData.basePrice : categoryData.minBid)
    : 0;
  const pricePerDay    = sizeData ? Math.round(dailyRate * sizeData.priceModifier) : 0;
  const confirmedPrice = pricingModel === 'fixed' ? pricePerDay * eventDays : pricePerDay;
  const minBidRequired = pricePerDay;

  const bidNum   = parseFloat(bidAmount) || 0;
  const bidValid = bidNum >= minBidRequired && bidNum > 0;

  // Required docs: business licence + personal ID always; SFA for food vendors
  const requiredDocs = ['businessLicence', 'personalId', ...(isFoodCategory ? ['sfaLicense'] : [])];
  const docsComplete = requiredDocs.every(k => docs[k]);

  const canSubmit = !!selectedCategory && !!selectedSize && docsComplete &&
    (pricingModel === 'fixed' || bidValid);

  const toggleDoc = (key: string) =>
    setDocs(prev => ({ ...prev, [key]: !prev[key] }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setShowSuccess(true);
    setTimeout(() => navigate('/vendor/my-applications'), 2500);
  };

  // ── Event not found ───────────────────────────────────────────────────────
  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
        <VendorNavBar user={user} onLogout={onLogout} currentPage="apply" />
        <div className="max-w-6xl mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Event not found</h2>
          <Link to="/vendor/events" className="text-purple-600 hover:underline">
            ← Back to events
          </Link>
        </div>
      </div>
    );
  }

  const REQUIREMENTS = [
    'Valid Food Hygiene Certificate (for food stalls)',
    'Business registration documents',
    'Product liability insurance',
    'Photos of your products / menu',
    'Previous event experience (preferred)',
  ];
  const RULES = [
    'Setup must be completed by 5:00 PM on event day',
    'All stalls must operate for the full event duration',
    'No external generators allowed — power will be provided',
    'Minimum waste policy — vendors must dispose of waste properly',
    'Compliance with NEA food safety standards',
    'Payment must be completed within 48 hours of approval',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
      <VendorNavBar user={user} onLogout={onLogout} currentPage="apply" />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back */}
        <Link
          to="/vendor/events"
          className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Events
        </Link>

        {/* Event Header */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="relative h-64">
            <img src={imageUrl} alt={event.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  pricingModel === 'fixed' ? 'bg-blue-500' : 'bg-purple-500'
                }`}>
                  {pricingModel === 'fixed' ? (
                    <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />Fixed Price Rental</span>
                  ) : (
                    <span className="flex items-center gap-1"><Gavel className="w-3 h-3" />Competitive Bidding</span>
                  )}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  eventStatus === 'ongoing' ? 'bg-green-500' : 'bg-orange-500'
                }`}>
                  {eventStatus === 'ongoing' ? 'Open Now' : 'Upcoming'}
                </span>
              </div>
              <h1 className="text-3xl font-bold mb-2">{event.name}</h1>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {new Date(event.startDate).toLocaleDateString('en-SG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {event.openingHours || '5:00 PM – 11:00 PM'}
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {event.area}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-5 h-5 text-purple-600" />
                  <span className="text-sm text-gray-600">Available Stalls</span>
                </div>
                <p className="text-2xl font-bold text-purple-900">{availableStalls} / {totalStalls}</p>
              </div>
              <div className={`rounded-lg p-4 ${pricingModel === 'fixed' ? 'bg-gradient-to-br from-blue-50 to-purple-50' : 'bg-gradient-to-br from-orange-50 to-pink-50'}`}>
                <div className="flex items-center gap-2 mb-1">
                  {pricingModel === 'fixed'
                    ? <DollarSign className="w-5 h-5 text-blue-600" />
                    : <Gavel className="w-5 h-5 text-orange-600" />}
                  <span className="text-sm text-gray-600">Pricing Model</span>
                </div>
                <p className={`text-xl font-bold ${pricingModel === 'fixed' ? 'text-blue-900' : 'text-orange-900'}`}>
                  {pricingModel === 'fixed' ? 'Fixed Price Rental' : 'Competitive Bidding'}
                </p>
              </div>
              <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-5 h-5 text-pink-600" />
                  <span className="text-sm text-gray-600">Apply By</span>
                </div>
                <p className="text-2xl font-bold text-pink-900">
                  {new Date(applicationDeadline).toLocaleDateString('en-SG', { month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>
            <p className="text-gray-700">{event.description}</p>
          </div>
        </div>

        {/* Pricing model explainer banner */}
        {pricingModel === 'fixed' ? (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
            <Tag className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-900">Fixed Price Rental</p>
              <p className="text-sm text-blue-700 mt-0.5">
                Stall prices are fixed. Select your preferred category and size — the price is set and you'll be charged
                that amount if your application is approved. No bidding required.
              </p>
            </div>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-xl flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-purple-900">Competitive Bidding</p>
              <p className="text-sm text-purple-700 mt-0.5">
                Stalls are allocated through competitive bidding. Enter your bid above the minimum — higher bids improve
                your chances of securing a spot. You are only charged if your application is approved.
              </p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* ── Application Form ── */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
              <h2 className="text-xl font-bold text-gray-800">Submit Application</h2>

              {/* Stall Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Stall Category <span className="text-red-500">*</span>
                </label>
                <div className="grid md:grid-cols-2 gap-3">
                  {STALL_CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => { setSelectedCategory(cat.id); setSelectedSize(''); setBidAmount(''); setPremiumIsFood(false); setDocs({}); }}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        selectedCategory === cat.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <h3 className="font-semibold text-gray-800 mb-1">{cat.name}</h3>
                      <p className="text-sm text-gray-500 mb-2">{cat.description}</p>
                      <p className="text-sm font-semibold text-purple-600">
                        {pricingModel === 'fixed'
                          ? `From $${cat.basePrice}/day`
                          : `Min bid: $${cat.minBid}`}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Premium Corner — food stall checkbox */}
              {selectedCategory === 'premium' && (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={premiumIsFood}
                      onChange={e => { setPremiumIsFood(e.target.checked); setDocs({}); }}
                      className="mt-0.5 w-4 h-4 accent-purple-600 shrink-0"
                    />
                    <div>
                      <p className="font-medium text-purple-900 text-sm">This is a food stall</p>
                      <p className="text-xs text-purple-600 mt-0.5">
                        Check this if your Premium Corner stall will be selling food or beverages.
                        An SFA Food Stall License will be required.
                      </p>
                    </div>
                  </label>
                </div>
              )}

              {/* Stall Size */}
              {selectedCategory && categoryData && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Stall Size <span className="text-red-500">*</span>
                  </label>
                  <div className="grid md:grid-cols-3 gap-3">
                    {categoryData.sizes.map(size => {
                      const price = Math.round(
                        (pricingModel === 'fixed' ? categoryData.basePrice : categoryData.minBid) * size.priceModifier,
                      );
                      return (
                        <button
                          key={size.id}
                          type="button"
                          onClick={() => { setSelectedSize(size.id); setBidAmount(''); }}
                          className={`p-4 border-2 rounded-lg text-left transition-all ${
                            selectedSize === size.id
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-purple-300'
                          }`}
                        >
                          <h3 className="font-semibold text-gray-800 mb-1">{size.name}</h3>
                          <p className="text-sm text-gray-500 mb-2">{size.dimensions}</p>
                          <p className="text-sm font-semibold text-purple-600">
                            {pricingModel === 'fixed' ? `$${price}/day` : `Min: $${price}`}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── FIXED: price confirmation ── */}
              {pricingModel === 'fixed' && selectedSize && pricePerDay > 0 && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                    <p className="font-semibold text-blue-900">Rental Fee Breakdown</p>
                  </div>
                  <div className="text-sm text-blue-700 space-y-1 mb-2">
                    <div className="flex justify-between">
                      <span>{categoryData?.name} · {sizeData?.name} ({sizeData?.dimensions})</span>
                      <span className="font-medium">${pricePerDay}/day</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration</span>
                      <span className="font-medium">{eventDays} day{eventDays !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-baseline border-t border-blue-200 pt-2">
                    <span className="text-sm font-semibold text-blue-800">Total Rental Fee</span>
                    <span className="text-2xl font-bold text-blue-700">${confirmedPrice}</span>
                  </div>
                  <p className="text-xs text-blue-500 mt-1">Invoiced within 48 hours of approval.</p>
                </div>
              )}

              {/* ── BIDDING: bid input ── */}
              {pricingModel === 'bidding' && selectedSize && confirmedPrice > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Bid Amount (SGD) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      value={bidAmount}
                      onChange={e => setBidAmount(e.target.value)}
                      min={minBidRequired}
                      step="1"
                      placeholder={`Minimum: $${minBidRequired}`}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div className="mt-2 space-y-1 text-sm text-gray-500">
                    <p>Minimum bid for this selection: <span className="font-semibold text-gray-700">${minBidRequired}</span></p>
                    {bidNum > 0 && bidNum < minBidRequired && (
                      <p className="text-red-600 font-medium">Bid must be at least ${minBidRequired}</p>
                    )}
                    {bidValid && (
                      <p className="text-green-600 font-medium flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Bid of ${bidNum.toFixed(0)} accepted — you'll only be charged if approved
                      </p>
                    )}
                  </div>

                  {/* Bid tips */}
                  <div className="mt-3 p-3 bg-purple-50 border border-purple-100 rounded-lg text-sm text-purple-700 space-y-1">
                    <p className="font-medium">Bidding Tips</p>
                    <ul className="list-disc list-inside space-y-0.5 text-purple-600">
                      <li>Higher bids significantly improve your chances</li>
                      <li>All bids are confidential — other vendors cannot see yours</li>
                      <li>You are only charged if your application is approved</li>
                      <li>Bids cannot be changed after submission</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Additional Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Tell us about your business, menu items, or any special requests..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              {/* Supporting Documents */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supporting Documents
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Mark each document as uploaded. <span className="text-red-500 font-medium">Required</span> documents must be provided before submitting.
                </p>
                <div className="space-y-2">
                  {[
                    { key: 'businessLicence', label: 'Business Licence (ACRA)',        required: true  },
                    { key: 'personalId',      label: 'Personal ID (NRIC / Passport)',  required: true  },
                    ...(isFoodCategory
                      ? [{ key: 'sfaLicense', label: 'SFA Food Stall License',         required: true  }]
                      : []),
                    { key: 'pastParticipation', label: 'Past Participation Proof',     required: false },
                  ].map(({ key, label, required }) => {
                    const uploaded = !!docs[key];
                    return (
                      <div
                        key={key}
                        className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                          uploaded ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <FileText className={`w-4 h-4 shrink-0 ${uploaded ? 'text-green-500' : 'text-gray-400'}`} />
                          <span className="text-sm text-gray-800 truncate">{label}</span>
                          {required
                            ? <span className="text-xs text-red-500 font-medium shrink-0">Required</span>
                            : <span className="text-xs text-gray-400 shrink-0">Optional</span>}
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleDoc(key)}
                          className={`ml-3 shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            uploaded
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                          }`}
                        >
                          {uploaded ? (
                            <><CheckCircle className="w-3.5 h-3.5" /> Uploaded</>
                          ) : (
                            <><Upload className="w-3.5 h-3.5" /> Upload</>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
                {!docsComplete && selectedCategory && (
                  <p className="mt-2 text-xs text-red-500">Please upload all required documents to proceed.</p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {pricingModel === 'fixed'
                  ? canSubmit
                    ? `Submit Application — $${pricePerDay}/day × ${eventDays} days = $${confirmedPrice}`
                    : 'Select stall, upload required docs to continue'
                  : canSubmit
                    ? `Submit Bid — $${bidNum.toFixed(0)}`
                    : 'Select stall, upload required docs and enter bid to continue'}
              </button>
            </form>
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-6">
            {/* Pricing model detail */}
            <div className={`rounded-xl shadow-sm p-6 ${pricingModel === 'fixed' ? 'bg-blue-50 border border-blue-200' : 'bg-purple-50 border border-purple-200'}`}>
              <div className="flex items-center gap-2 mb-3">
                {pricingModel === 'fixed'
                  ? <DollarSign className="w-5 h-5 text-blue-600" />
                  : <Gavel className="w-5 h-5 text-purple-600" />}
                <h3 className={`font-semibold ${pricingModel === 'fixed' ? 'text-blue-900' : 'text-purple-900'}`}>
                  {pricingModel === 'fixed' ? 'Fixed Price Rental' : 'How Bidding Works'}
                </h3>
              </div>
              {pricingModel === 'fixed' ? (
                <ul className={`text-sm space-y-2 text-blue-700`}>
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />Price is the same for all applicants</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />Approval based on documents & experience</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />Invoice sent within 48 hours of approval</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />Early applications are prioritised</li>
                </ul>
              ) : (
                <ul className="text-sm space-y-2 text-purple-700">
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />Bids are confidential and sealed</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />Highest bids win available stalls</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />Only charged if your bid is accepted</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />Unsuccessful bidders pay nothing</li>
                </ul>
              )}
            </div>

            {/* Requirements */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Info className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-gray-800">Requirements</h3>
              </div>
              <ul className="space-y-2">
                {REQUIREMENTS.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>

            {/* Rules */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                <h3 className="font-semibold text-gray-800">Event Rules</h3>
              </div>
              <ul className="space-y-2">
                {RULES.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 shrink-0" />
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Application Submitted!</h3>
            <p className="text-gray-600 mb-2">
              {pricingModel === 'fixed'
                ? `Your application for a $${confirmedPrice} stall has been received.`
                : `Your bid of $${bidNum.toFixed(0)} has been submitted.`}
            </p>
            <p className="text-gray-500 text-sm mb-1">You can track its status in "My Applications".</p>
            <p className="text-xs text-gray-400">Redirecting...</p>
          </div>
        </div>
      )}
    </div>
  );
}
