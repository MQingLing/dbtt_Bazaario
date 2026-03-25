import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { User } from '../../App';
import { 
  MapPin, Calendar, Clock, DollarSign, Users, Gavel, 
  ArrowLeft, Info, Upload, FileText, CheckCircle, AlertCircle 
} from 'lucide-react';
import VendorNavBar from './VendorNavBar';

interface VendorEventApplicationProps {
  user: User;
  onLogout: () => void;
}

interface StallCategory {
  id: string;
  name: string;
  description: string;
  basePrice?: number;
  minBid?: number;
  sizes: StallSize[];
}

interface StallSize {
  id: string;
  name: string;
  dimensions: string;
  priceModifier: number; // Multiplier for base price
}

interface EventDetail {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  imageUrl: string;
  description: string;
  totalStalls: number;
  availableStalls: number;
  pricingModel: 'fixed' | 'bidding';
  categories: StallCategory[];
  applicationDeadline: string;
  requirements: string[];
  rules: string[];
}

const mockEventDetail: EventDetail = {
  id: '1',
  name: 'Chinatown CNY Night Market',
  date: '2026-01-25',
  time: '6:00 PM - 11:00 PM',
  location: 'Chinatown Complex',
  imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop',
  description: 'Join us for the most vibrant Chinese New Year celebration in Singapore! This premier night market attracts over 10,000 visitors daily during the festive season.',
  totalStalls: 120,
  availableStalls: 45,
  pricingModel: 'bidding',
  categories: [
    {
      id: 'food',
      name: 'Food Stall',
      description: 'Cooked food, snacks, and beverages',
      minBid: 150,
      sizes: [
        { id: 'small', name: 'Small', dimensions: '3m x 2m', priceModifier: 1 },
        { id: 'medium', name: 'Medium', dimensions: '4m x 3m', priceModifier: 1.5 },
        { id: 'large', name: 'Large', dimensions: '5m x 4m', priceModifier: 2 }
      ]
    },
    {
      id: 'non-food',
      name: 'Non-Food Stall',
      description: 'Retail goods, accessories, and merchandise',
      minBid: 120,
      sizes: [
        { id: 'small', name: 'Small', dimensions: '3m x 2m', priceModifier: 1 },
        { id: 'medium', name: 'Medium', dimensions: '4m x 3m', priceModifier: 1.5 }
      ]
    },
    {
      id: 'premium',
      name: 'Premium Corner Stall',
      description: 'High-traffic corner locations with extra visibility',
      minBid: 250,
      sizes: [
        { id: 'large', name: 'Large', dimensions: '5m x 5m', priceModifier: 1 }
      ]
    }
  ],
  applicationDeadline: '2026-01-10',
  requirements: [
    'Valid Food Hygiene Certificate (for food stalls)',
    'Business registration documents',
    'Product liability insurance',
    'Photos of your products/menu',
    'Previous event experience (preferred)'
  ],
  rules: [
    'Setup must be completed by 5:00 PM on event day',
    'All stalls must operate for the full event duration',
    'No external generators allowed - power will be provided',
    'Minimum waste policy - vendors must dispose of waste properly',
    'Compliance with NEA food safety standards',
    'Payment must be completed within 48 hours of approval'
  ]
};

export default function VendorEventApplication({ user, onLogout }: VendorEventApplicationProps) {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Form state
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [bidAmount, setBidAmount] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [uploadedDocs, setUploadedDocs] = useState<string[]>([]);

  const event = mockEventDetail; // In real app, fetch by eventId

  const selectedCategoryData = event.categories.find(cat => cat.id === selectedCategory);
  const selectedSizeData = selectedCategoryData?.sizes.find(size => size.id === selectedSize);
  
  const calculateMinBid = () => {
    if (!selectedCategoryData || !selectedSizeData) return 0;
    const baseAmount = selectedCategoryData.minBid || selectedCategoryData.basePrice || 0;
    return Math.round(baseAmount * selectedSizeData.priceModifier);
  };

  const minRequiredBid = calculateMinBid();

  const handleFileUpload = () => {
    // Mock file upload
    setUploadedDocs([...uploadedDocs, `document-${uploadedDocs.length + 1}.pdf`]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCategory || !selectedSize) {
      alert('Please select stall category and size');
      return;
    }

    if (event.pricingModel === 'bidding') {
      const bid = parseFloat(bidAmount);
      if (!bid || bid < minRequiredBid) {
        alert(`Bid amount must be at least $${minRequiredBid}`);
        return;
      }
    }

    // Mock submission
    setShowSuccess(true);
    setTimeout(() => {
      navigate('/vendor/my-applications');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
      <VendorNavBar user={user} onLogout={onLogout} currentPage="apply" />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          to="/vendor/apply-events"
          className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Events
        </Link>

        {/* Event Header */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="relative h-64">
            <img
              src={event.imageUrl}
              alt={event.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <h1 className="text-3xl font-bold mb-2">{event.name}</h1>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(event.date).toLocaleDateString('en-SG', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {event.time}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {event.location}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  <span className="text-sm text-gray-600">Available Stalls</span>
                </div>
                <p className="text-2xl font-bold text-purple-900">
                  {event.availableStalls} / {event.totalStalls}
                </p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  {event.pricingModel === 'fixed' ? (
                    <DollarSign className="w-5 h-5 text-orange-600" />
                  ) : (
                    <Gavel className="w-5 h-5 text-orange-600" />
                  )}
                  <span className="text-sm text-gray-600">Pricing Model</span>
                </div>
                <p className="text-2xl font-bold text-orange-900 capitalize">
                  {event.pricingModel}
                </p>
              </div>

              <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-pink-600" />
                  <span className="text-sm text-gray-600">Apply By</span>
                </div>
                <p className="text-2xl font-bold text-pink-900">
                  {new Date(event.applicationDeadline).toLocaleDateString('en-SG', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>

            <div className="prose max-w-none">
              <p className="text-gray-700">{event.description}</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Application Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Submit Application</h2>

              {/* Stall Category Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Stall Category *
                </label>
                <div className="grid md:grid-cols-2 gap-3">
                  {event.categories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(category.id);
                        setSelectedSize('');
                        setBidAmount('');
                      }}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        selectedCategory === category.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <h3 className="font-semibold text-gray-800 mb-1">{category.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                      <p className="text-sm font-medium text-purple-600">
                        {event.pricingModel === 'fixed' ? 'From' : 'Min bid'}: ${category.minBid || category.basePrice}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Stall Size Selection */}
              {selectedCategory && selectedCategoryData && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Stall Size *
                  </label>
                  <div className="grid md:grid-cols-3 gap-3">
                    {selectedCategoryData.sizes.map((size) => {
                      const calculatedPrice = Math.round(
                        (selectedCategoryData.minBid || selectedCategoryData.basePrice || 0) * 
                        size.priceModifier
                      );
                      return (
                        <button
                          key={size.id}
                          type="button"
                          onClick={() => {
                            setSelectedSize(size.id);
                            setBidAmount('');
                          }}
                          className={`p-4 border-2 rounded-lg text-left transition-all ${
                            selectedSize === size.id
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-purple-300'
                          }`}
                        >
                          <h3 className="font-semibold text-gray-800 mb-1">{size.name}</h3>
                          <p className="text-sm text-gray-600 mb-2">{size.dimensions}</p>
                          <p className="text-sm font-medium text-purple-600">
                            {event.pricingModel === 'fixed' ? 'Price' : 'Min'}: ${calculatedPrice}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Bid Amount (for bidding model) */}
              {event.pricingModel === 'bidding' && selectedSize && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Bid Amount (SGD) *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      min={minRequiredBid}
                      step="1"
                      placeholder={`Minimum: $${minRequiredBid}`}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Minimum bid for this configuration: ${minRequiredBid}
                  </p>
                </div>
              )}

              {/* Additional Notes */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Tell us about your business, menu items, or any special requests..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              {/* Document Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supporting Documents
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-3">
                    Upload certificates, licenses, and product photos
                  </p>
                  <button
                    type="button"
                    onClick={handleFileUpload}
                    className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                  >
                    Choose Files
                  </button>
                </div>
                {uploadedDocs.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {uploadedDocs.map((doc, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                        <FileText className="w-4 h-4 text-purple-500" />
                        {doc}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
              >
                Submit Application
              </button>
            </form>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {/* Requirements */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Info className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-gray-800">Requirements</h3>
              </div>
              <ul className="space-y-2">
                {event.requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
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
                {event.rules.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 flex-shrink-0" />
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
            <p className="text-gray-600 mb-4">
              Your application has been received. You can track its status in "My Applications".
            </p>
            <p className="text-sm text-gray-500">
              Redirecting...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
