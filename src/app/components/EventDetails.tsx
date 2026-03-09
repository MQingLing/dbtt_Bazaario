import { Link, useParams } from 'react-router';
import CustomerNav from './CustomerNav';
import { User } from '../App';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { MapPin, Clock, Users, Star, Map, ArrowLeft, Calendar, Share2 } from 'lucide-react';

interface EventDetailsProps {
  user: User;
  onLogout: () => void;
}

export default function EventDetails({ user, onLogout }: EventDetailsProps) {
  const { id } = useParams();

  const event = {
    id: id,
    name: 'Geylang Serai Pasar Malam',
    location: 'Geylang Serai',
    address: '1 Geylang Serai, Singapore 402001',
    date: 'Mar 5 - Mar 15, 2026',
    time: '6:00 PM - 12:00 AM',
    image: 'https://images.unsplash.com/photo-1763621470208-efe14b618119?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaW5nYXBvcmUlMjBuaWdodCUyMG1hcmtldCUyMGZvb2QlMjBzdGFsbHN8ZW58MXx8fHwxNzcyNzE4OTUzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    vendors: 45,
    rating: 4.8,
    reviews: 234,
    status: 'ongoing',
    description: 'Experience the vibrant atmosphere of Geylang Serai Pasar Malam, one of Singapore\'s most beloved night markets. Indulge in delicious street food, shop for unique products, and immerse yourself in the colorful sights and sounds of this cultural celebration.',
    highlights: [
      'Over 45 diverse vendors',
      'Authentic local street food',
      'Handicrafts and unique products',
      'Live cultural performances',
      'Family-friendly atmosphere'
    ]
  };

  const vendors = [
    { id: '1', name: "Wong's Satay", category: 'Food', image: 'https://images.unsplash.com/photo-1722704689022-98d1b7795589?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYXRheSUyMGZvb2QlMjBzdGFsbHxlbnwxfHx8fDE3NzI3MTg5NTR8MA&ixlib=rb-4.1.0&q=80&w=1080', rating: 4.9, stall: 'A12' },
    { id: '2', name: 'Bubble Tea Paradise', category: 'Drinks', image: 'https://images.unsplash.com/photo-1670468642364-6cacadfb7bb0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidWJibGUlMjB0ZWElMjBkcmlua3N8ZW58MXx8fHwxNzcyNzE0OTA5fDA&ixlib=rb-4.1.0&q=80&w=1080', rating: 4.7, stall: 'B08' },
    { id: '3', name: 'Golden Snacks', category: 'Food', image: 'https://images.unsplash.com/photo-1738599935343-991708a2895b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmllZCUyMHNuYWNrcyUyMGZvb2R8ZW58MXx8fHwxNzcyNzE4OTU1fDA&ixlib=rb-4.1.0&q=80&w=1080', rating: 4.6, stall: 'A05' },
    { id: '4', name: 'Artisan Crafts', category: 'Products', image: 'https://images.unsplash.com/photo-1724709166740-96947d362a17?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpc2FuJTIwaGFuZGljcmFmdHMlMjBtYXJrZXR8ZW58MXx8fHwxNzcyNzE4OTU2fDA&ixlib=rb-4.1.0&q=80&w=1080', rating: 4.8, stall: 'C15' },
    { id: '5', name: 'Spice Junction', category: 'Food', image: 'https://images.unsplash.com/photo-1771804359368-0f91f81ee83b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMHN0cmVldCUyMGZvb2QlMjBjb2xvcmZ1bHxlbnwxfHx8fDE3NzI3MTg5NTR8MA&ixlib=rb-4.1.0&q=80&w=1080', rating: 4.5, stall: 'A18' },
    { id: '6', name: 'Fashion Accessories', category: 'Products', image: 'https://images.unsplash.com/photo-1625261528853-9e82b0bc509d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMGNsb3RoaW5nJTIwYWNjZXNzb3JpZXN8ZW58MXx8fHwxNzcyNzE4OTU2fDA&ixlib=rb-4.1.0&q=80&w=1080', rating: 4.4, stall: 'C22' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <CustomerNav user={user} onLogout={onLogout} />

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <Link to="/customer/events" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Link>

        {/* Hero Image */}
        <Card className="overflow-hidden mb-6">
          <div className="relative h-64 md:h-96">
            <img src={event.image} alt={event.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <Badge 
                className={`mb-3 ${
                  event.status === 'ongoing' 
                    ? 'bg-green-500 hover:bg-green-600' 
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {event.status === 'ongoing' ? 'Live Now' : 'Upcoming'}
              </Badge>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{event.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  <span>{event.rating} ({event.reviews} reviews)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{event.vendors} vendors</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <Link to={`/customer/events/${id}/map`}>
            <Button className="w-full h-12 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600">
              <Map className="w-5 h-5 mr-2" />
              View Interactive Map
            </Button>
          </Link>
          <Button variant="outline" className="w-full h-12">
            <Share2 className="w-5 h-5 mr-2" />
            Share Event
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="vendors">Vendors</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-4">About This Event</h3>
                    <p className="text-gray-600 mb-6">{event.description}</p>
                    
                    <h4 className="font-bold mb-3">Highlights</h4>
                    <ul className="space-y-2">
                      {event.highlights.map((highlight, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Star className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="vendors" className="mt-6">
                <div className="grid md:grid-cols-2 gap-4">
                  {vendors.map((vendor) => (
                    <Link key={vendor.id} to={`/customer/vendor/${vendor.id}`}>
                      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                        <div className="relative h-32">
                          <img src={vendor.image} alt={vendor.name} className="w-full h-full object-cover" />
                          <Badge className="absolute top-2 right-2 bg-white text-gray-900">
                            Stall {vendor.stall}
                          </Badge>
                        </div>
                        <CardContent className="p-4">
                          <h4 className="font-bold text-gray-900">{vendor.name}</h4>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm text-gray-500">{vendor.category}</span>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                              <span className="text-sm font-medium">{vendor.rating}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center py-8">
                      <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Reviews coming soon</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div>
            <Card className="sticky top-6">
              <CardContent className="p-6">
                <h3 className="font-bold mb-4">Event Details</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <MapPin className="w-5 h-5 text-orange-500" />
                      <span className="font-medium">Location</span>
                    </div>
                    <p className="text-sm text-gray-700 ml-7">{event.address}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Calendar className="w-5 h-5 text-pink-500" />
                      <span className="font-medium">Date</span>
                    </div>
                    <p className="text-sm text-gray-700 ml-7">{event.date}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Clock className="w-5 h-5 text-purple-500" />
                      <span className="font-medium">Operating Hours</span>
                    </div>
                    <p className="text-sm text-gray-700 ml-7">{event.time}</p>
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
