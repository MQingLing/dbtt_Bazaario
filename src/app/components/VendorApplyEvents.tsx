import { useState } from 'react';
import { Link } from 'react-router';
import { User } from '../App';
import { MapPin, Calendar, DollarSign, Users, Gavel, Search, Filter } from 'lucide-react';
import VendorNavBar from './VendorNavBar';

interface VendorApplyEventsProps {
  user: User;
  onLogout: () => void;
}

interface EventListing {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  imageUrl: string;
  totalStalls: number;
  availableStalls: number;
  pricingModel: 'fixed' | 'bidding';
  minPrice?: number;
  minBid?: number;
  categories: string[];
  applicationDeadline: string;
  status: 'open' | 'closing-soon' | 'closed';
}

const mockEvents: EventListing[] = [
  {
    id: '1',
    name: 'Chinatown CNY Night Market',
    date: '2026-01-25',
    time: '6:00 PM - 11:00 PM',
    location: 'Chinatown Complex',
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop',
    totalStalls: 120,
    availableStalls: 45,
    pricingModel: 'bidding',
    minBid: 150,
    categories: ['Food Stall', 'Non-Food Stall', 'Premium Corner'],
    applicationDeadline: '2026-01-10',
    status: 'open'
  },
  {
    id: '2',
    name: 'Geylang Serai Ramadan Bazaar',
    date: '2026-03-15',
    time: '5:00 PM - 12:00 AM',
    location: 'Geylang Serai Market',
    imageUrl: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=800&auto=format&fit=crop',
    totalStalls: 200,
    availableStalls: 120,
    pricingModel: 'fixed',
    minPrice: 200,
    categories: ['Food Stall', 'Clothing', 'Religious Items', 'Premium Corner'],
    applicationDeadline: '2026-02-20',
    status: 'open'
  },
  {
    id: '3',
    name: 'Marina Bay Countdown Market',
    date: '2026-12-31',
    time: '4:00 PM - 2:00 AM',
    location: 'Marina Bay',
    imageUrl: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&auto=format&fit=crop',
    totalStalls: 150,
    availableStalls: 8,
    pricingModel: 'bidding',
    minBid: 300,
    categories: ['Food Stall', 'Beverages', 'Premium Corner'],
    applicationDeadline: '2026-11-30',
    status: 'closing-soon'
  },
  {
    id: '4',
    name: 'Bugis Street Night Festival',
    date: '2026-04-10',
    time: '6:00 PM - 11:00 PM',
    location: 'Bugis Street',
    imageUrl: 'https://images.unsplash.com/photo-1523942839745-7848c839b661?w=800&auto=format&fit=crop',
    totalStalls: 80,
    availableStalls: 60,
    pricingModel: 'fixed',
    minPrice: 120,
    categories: ['Food Stall', 'Fashion', 'Accessories', 'Art & Crafts'],
    applicationDeadline: '2026-03-20',
    status: 'open'
  },
  {
    id: '5',
    name: 'Sentosa Beach Night Market',
    date: '2026-06-01',
    time: '5:00 PM - 10:00 PM',
    location: 'Siloso Beach, Sentosa',
    imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&auto=format&fit=crop',
    totalStalls: 100,
    availableStalls: 85,
    pricingModel: 'bidding',
    minBid: 180,
    categories: ['Food Stall', 'Beverages', 'Beach Items', 'Premium Corner'],
    applicationDeadline: '2026-05-10',
    status: 'open'
  }
];

export default function VendorApplyEvents({ user, onLogout }: VendorApplyEventsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModel, setFilterModel] = useState<'all' | 'fixed' | 'bidding'>('all');

  const filteredEvents = mockEvents.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterModel === 'all' || event.pricingModel === filterModel;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
      <VendorNavBar user={user} onLogout={onLogout} currentPage="apply" />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Apply for Pasar Malam
          </h1>
          <p className="text-gray-600">
            Browse upcoming events and submit your stall applications
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search events or locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filterModel}
                onChange={(e) => setFilterModel(e.target.value as 'all' | 'fixed' | 'bidding')}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none bg-white"
              >
                <option value="all">All Pricing Models</option>
                <option value="fixed">Fixed Price Only</option>
                <option value="bidding">Bidding Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <Link
              key={event.id}
              to={`/vendor/apply-events/${event.id}`}
              className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all group"
            >
              {/* Event Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={event.imageUrl}
                  alt={event.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    event.status === 'open' ? 'bg-green-500 text-white' :
                    event.status === 'closing-soon' ? 'bg-orange-500 text-white' :
                    'bg-gray-500 text-white'
                  }`}>
                    {event.status === 'open' ? 'Open' :
                     event.status === 'closing-soon' ? 'Closing Soon' :
                     'Closed'}
                  </span>
                </div>
                <div className="absolute top-3 left-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    event.pricingModel === 'fixed' ? 'bg-blue-500 text-white' : 'bg-purple-500 text-white'
                  }`}>
                    {event.pricingModel === 'fixed' ? (
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        Fixed Price
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Gavel className="w-3 h-3" />
                        Bidding
                      </div>
                    )}
                  </span>
                </div>
              </div>

              {/* Event Details */}
              <div className="p-5">
                <h3 className="font-semibold text-lg mb-3 text-gray-800 group-hover:text-purple-600 transition-colors">
                  {event.name}
                </h3>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 text-purple-500" />
                    <span>{new Date(event.date).toLocaleDateString('en-SG', { 
                      weekday: 'short', 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-pink-500" />
                    <span>{event.location}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4 text-orange-500" />
                    <span>{event.availableStalls} / {event.totalStalls} stalls available</span>
                  </div>
                </div>

                {/* Pricing */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">
                      {event.pricingModel === 'fixed' ? 'Starting from' : 'Minimum bid'}
                    </p>
                    <p className="font-semibold text-lg text-purple-600">
                      ${event.pricingModel === 'fixed' ? event.minPrice : event.minBid}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">Apply by</p>
                    <p className="text-sm font-medium text-gray-700">
                      {new Date(event.applicationDeadline).toLocaleDateString('en-SG', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>

                {/* Categories */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {event.categories.slice(0, 3).map((category, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 text-xs rounded-full"
                    >
                      {category}
                    </span>
                  ))}
                  {event.categories.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{event.categories.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No events found</h3>
            <p className="text-gray-600">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
