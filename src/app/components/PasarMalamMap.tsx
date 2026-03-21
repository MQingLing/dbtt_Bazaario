import { useState } from 'react';
import { Link, useParams } from 'react-router';
import CustomerNav from './CustomerNav';
import { User } from '../App';
import { MAP_STALLS, MapStall } from '../data/mockData';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ArrowLeft, MapPin, Star, Search } from 'lucide-react';
import { Input } from './ui/input';

interface EventDetailsProps {
  user: User;
  onLogout: () => void;
}

export default function PasarMalamMap({ user, onLogout }: EventDetailsProps) {
  const { eventId } = useParams();
  const [selectedStall, setSelectedStall] = useState<MapStall | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const stalls: MapStall[] = MAP_STALLS;

  const filteredStalls = stalls.filter(stall =>
    stall.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stall.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stall.number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Food':
        return 'fill-orange-500 hover:fill-orange-600';
      case 'Drinks':
        return 'fill-blue-500 hover:fill-blue-600';
      case 'Desserts':
        return 'fill-pink-500 hover:fill-pink-600';
      case 'Products':
        return 'fill-purple-500 hover:fill-purple-600';
      default:
        return 'fill-gray-500 hover:fill-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <CustomerNav user={user} onLogout={onLogout} />

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <Link to={`/customer/events/${eventId}`} className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Event Details
        </Link>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Interactive Stall Map</h1>
          <p className="text-gray-600">Tap on any stall to view vendor details</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search vendors or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Legend */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-center">
              <span className="font-medium text-sm">Categories:</span>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-500 rounded" />
                <span className="text-sm">Food</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded" />
                <span className="text-sm">Drinks</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-pink-500 rounded" />
                <span className="text-sm">Desserts</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-purple-500 rounded" />
                <span className="text-sm">Products</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <CardContent className="p-6">
                <div className="bg-gray-100 rounded-lg p-4 overflow-auto">
                  <svg viewBox="0 0 100 90" className="w-full min-h-[400px] md:min-h-[600px]">
                    {/* Entrance */}
                    <rect x="45" y="0" width="10" height="5" fill="#10b981" />
                    <text x="50" y="3" textAnchor="middle" fontSize="2" fill="white" fontWeight="bold">ENTRANCE</text>
                    
                    {/* Stalls */}
                    {filteredStalls.map((stall) => (
                      <g key={stall.id}>
                        <rect
                          x={stall.x}
                          y={stall.y}
                          width="12"
                          height="8"
                          className={`cursor-pointer transition-all ${getCategoryColor(stall.category)} ${
                            selectedStall?.id === stall.id ? 'stroke-2 stroke-yellow-500' : 'stroke-1 stroke-white'
                          }`}
                          onClick={() => setSelectedStall(stall)}
                          rx="1"
                        />
                        <text
                          x={stall.x + 6}
                          y={stall.y + 5}
                          textAnchor="middle"
                          fontSize="2.5"
                          fill="white"
                          fontWeight="bold"
                          className="pointer-events-none"
                        >
                          {stall.number}
                        </text>
                      </g>
                    ))}
                    
                    {/* Pathways */}
                    <rect x="5" y="5" width="90" height="85" fill="none" stroke="#cbd5e1" strokeWidth="0.5" strokeDasharray="1,1" />
                  </svg>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stall Details */}
          <div>
            {selectedStall ? (
              <Card className="sticky top-6">
                <CardContent className="p-6">
                  <Badge className="mb-3">{selectedStall.category}</Badge>
                  <h3 className="text-xl font-bold mb-2">{selectedStall.vendorName}</h3>
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Stall {selectedStall.number}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-6">
                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    <span className="font-medium">{selectedStall.rating}</span>
                    <span className="text-sm text-gray-500">rating</span>
                  </div>
                  <div className="space-y-3">
                    <Link to={`/customer/vendor/${selectedStall.id}`}>
                      <Button className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600">
                        View Vendor Page
                      </Button>
                    </Link>
                    <Link to={`/customer/vendor/${selectedStall.id}/menu`}>
                      <Button variant="outline" className="w-full">
                        View Menu
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="font-bold text-gray-700 mb-2">Select a Stall</h3>
                  <p className="text-sm text-gray-500">Tap on any stall on the map to view details</p>
                </CardContent>
              </Card>
            )}

            {/* Quick Stats */}
            <Card className="mt-4">
              <CardContent className="p-4">
                <h4 className="font-bold mb-3">Quick Stats</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Stalls:</span>
                    <span className="font-medium">{stalls.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Food Vendors:</span>
                    <span className="font-medium">{stalls.filter(s => s.category === 'Food').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Drink Stalls:</span>
                    <span className="font-medium">{stalls.filter(s => s.category === 'Drinks').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Products:</span>
                    <span className="font-medium">{stalls.filter(s => s.category === 'Products').length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
