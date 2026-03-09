import { Link } from 'react-router';
import { useState } from 'react';
import CustomerNav from './CustomerNav';
import { User } from '../App';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { MapPin, Clock, Users, TrendingUp, Star } from 'lucide-react';

interface EventListProps {
  user: User;
  onLogout: () => void;
}

export default function EventList({ user, onLogout }: EventListProps) {
  const [activeTab, setActiveTab] = useState('all');

  const events = [
    {
      id: '1',
      name: 'Geylang Serai Pasar Malam',
      location: 'Geylang Serai',
      date: 'Mar 5 - Mar 15, 2026',
      time: '6:00 PM - 12:00 AM',
      image: 'https://images.unsplash.com/photo-1763621470208-efe14b618119?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaW5nYXBvcmUlMjBuaWdodCUyMG1hcmtldCUyMGZvb2QlMjBzdGFsbHN8ZW58MXx8fHwxNzcyNzE4OTUzfDA&ixlib=rb-4.1.0&q=80&w=1080',
      vendors: 45,
      rating: 4.8,
      status: 'ongoing',
      featured: true
    },
    {
      id: '2',
      name: 'Toa Payoh Night Bazaar',
      location: 'Toa Payoh Central',
      date: 'Mar 10 - Mar 20, 2026',
      time: '5:30 PM - 11:30 PM',
      image: 'https://images.unsplash.com/photo-1771804359368-0f91f81ee83b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMHN0cmVldCUyMGZvb2QlMjBjb2xvcmZ1bHxlbnwxfHx8fDE3NzI3MTg5NTR8MA&ixlib=rb-4.1.0&q=80&w=1080',
      vendors: 38,
      rating: 4.6,
      status: 'upcoming',
      featured: false
    },
    {
      id: '3',
      name: 'Chinatown Street Market',
      location: 'Chinatown',
      date: 'Mar 12 - Mar 25, 2026',
      time: '6:00 PM - 1:00 AM',
      image: 'https://images.unsplash.com/photo-1768900318217-4c7677ffc2c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuaWdodCUyMG1hcmtldCUyMGxhbnRlcm5zJTIwYXNpYXxlbnwxfHx8fDE3NzI3MTg5NTR8MA&ixlib=rb-4.1.0&q=80&w=1080',
      vendors: 52,
      rating: 4.9,
      status: 'upcoming',
      featured: true
    },
    {
      id: '4',
      name: 'Woodlands Night Market',
      location: 'Woodlands',
      date: 'Mar 8 - Mar 18, 2026',
      time: '5:00 PM - 11:00 PM',
      image: 'https://images.unsplash.com/photo-1763621470208-efe14b618119?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaW5nYXBvcmUlMjBuaWdodCUyMG1hcmtldCUyMGZvb2QlMjBzdGFsbHN8ZW58MXx8fHwxNzcyNzE4OTUzfDA&ixlib=rb-4.1.0&q=80&w=1080',
      vendors: 42,
      rating: 4.5,
      status: 'ongoing',
      featured: false
    },
    {
      id: '5',
      name: 'Tampines Mega Bazaar',
      location: 'Tampines',
      date: 'Mar 15 - Mar 30, 2026',
      time: '6:00 PM - 12:00 AM',
      image: 'https://images.unsplash.com/photo-1771804359368-0f91f81ee83b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMHN0cmVldCUyMGZvb2QlMjBjb2xvcmZ1bHxlbnwxfHx8fDE3NzI3MTg5NTR8MA&ixlib=rb-4.1.0&q=80&w=1080',
      vendors: 60,
      rating: 4.7,
      status: 'upcoming',
      featured: false
    }
  ];

  const filteredEvents = events.filter(event => {
    if (activeTab === 'ongoing') return event.status === 'ongoing';
    if (activeTab === 'upcoming') return event.status === 'upcoming';
    if (activeTab === 'featured') return event.featured;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <CustomerNav user={user} onLogout={onLogout} />

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pasar Malam Events</h1>
          <p className="text-gray-600">Discover exciting night markets happening around Singapore</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="all">All Events</TabsTrigger>
            <TabsTrigger value="ongoing">Live Now</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="featured">Featured</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {filteredEvents.map((event) => (
              <Link key={event.id} to={`/customer/events/${event.id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="md:flex">
                    <div className="relative md:w-64 h-48 md:h-auto">
                      <img src={event.image} alt={event.name} className="w-full h-full object-cover" />
                      <Badge 
                        className={`absolute top-3 left-3 ${
                          event.status === 'ongoing' 
                            ? 'bg-green-500 hover:bg-green-600' 
                            : 'bg-blue-500 hover:bg-blue-600'
                        }`}
                      >
                        {event.status === 'ongoing' ? 'Live Now' : 'Upcoming'}
                      </Badge>
                      {event.featured && (
                        <Badge className="absolute top-3 right-3 bg-yellow-500 hover:bg-yellow-600">
                          <Star className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                    </div>
                    <CardContent className="flex-1 p-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">{event.name}</h3>
                      
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-5 h-5 text-orange-500" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Users className="w-5 h-5 text-pink-500" />
                          <span>{event.vendors} vendors participating</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-5 h-5 text-purple-500" />
                          <span>{event.date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                          <span>{event.rating} rating</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <Button className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600">
                          View Details
                        </Button>
                        <Button variant="outline">
                          View Map
                        </Button>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </Link>
            ))}
          </TabsContent>
        </Tabs>

        {filteredEvents.length === 0 && (
          <Card className="p-12 text-center">
            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">No events found</h3>
            <p className="text-gray-500">Try selecting a different filter</p>
          </Card>
        )}
      </div>
    </div>
  );
}
