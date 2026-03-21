import { Link } from 'react-router';
import { useState } from 'react';
import CustomerNav from './CustomerNav';
import { User } from '../App';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { MapPin, Clock, TrendingUp, Star, Train } from 'lucide-react';
import { pasarMalamEvents, getEventStatus } from '../data/pasarMalamData';

interface EventListProps {
  user: User;
  onLogout: () => void;
}

const EVENT_IMAGES = [
  'https://images.unsplash.com/photo-1763621470208-efe14b618119?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaW5nYXBvcmUlMjBuaWdodCUyMG1hcmtldCUyMGZvb2QlMjBzdGFsbHN8ZW58MXx8fHwxNzcyNzE4OTUzfDA&ixlib=rb-4.1.0&q=80&w=1080',
  'https://images.unsplash.com/photo-1771804359368-0f91f81ee83b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMHN0cmVldCUyMGZvb2QlMjBjb2xvcmZ1bHxlbnwxfHx8fDE3NzI3MTg5NTR8MA&ixlib=rb-4.1.0&q=80&w=1080',
  'https://images.unsplash.com/photo-1768900318217-4c7677ffc2c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuaWdodCUyMG1hcmtldCUyMGxhbnRlcm5zJTIwYXNpYXxlbnwxfHx8fDE3NzI3MTg5NTR8MA&ixlib=rb-4.1.0&q=80&w=1080',
];

function getImage(id: string) {
  return EVENT_IMAGES[parseInt(id) % EVENT_IMAGES.length];
}

function formatDateRange(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  const fmt = (d: Date) => d.toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' });
  return `${fmt(s)} – ${fmt(e)}`;
}

export default function EventList({ user, onLogout }: EventListProps) {
  const [activeTab, setActiveTab] = useState('ongoing');

  const filteredEvents = pasarMalamEvents.filter(event => {
    const status = getEventStatus(event);
    if (activeTab === 'ongoing') return status === 'ongoing';
    if (activeTab === 'upcoming') return status === 'upcoming';
    if (activeTab === 'completed') return status === 'completed';
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
            <TabsTrigger value="ongoing">Live Now</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="completed">Past</TabsTrigger>
            <TabsTrigger value="featured">Featured</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {filteredEvents.map((event) => {
              const status = getEventStatus(event);
              return (
              <Link key={event.id} to={`/customer/events/${event.id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="md:flex">
                    <div className="relative md:w-64 h-48 md:h-auto">
                      <img src={getImage(event.id)} alt={event.name} className="w-full h-full object-cover" />
                      <Badge
                        className={`absolute top-3 left-3 ${
                          status === 'ongoing'
                            ? 'bg-green-500 hover:bg-green-600'
                            : status === 'upcoming'
                            ? 'bg-blue-500 hover:bg-blue-600'
                            : 'bg-gray-500 hover:bg-gray-600'
                        }`}
                      >
                        {status === 'ongoing' ? 'Live Now' : status === 'upcoming' ? 'Upcoming' : 'Past'}
                      </Badge>
                      {event.featured && (
                        <Badge className="absolute top-3 right-3 bg-yellow-500 hover:bg-yellow-600">
                          <Star className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                    </div>
                    <CardContent className="flex-1 p-6">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{event.name}</h3>
                        <Badge variant="outline" className="ml-2 shrink-0 text-xs">{event.region}</Badge>
                      </div>
                      <p className="text-sm text-gray-500 mb-3">{event.area}</p>

                      <div className="grid md:grid-cols-2 gap-3 mb-4">
                        <div className="flex items-start gap-2 text-gray-600">
                          <MapPin className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                          <span className="text-sm">{event.venue}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Train className="w-4 h-4 text-pink-500 shrink-0" />
                          <span className="text-sm">{event.nearestMrt || '—'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-4 h-4 text-purple-500 shrink-0" />
                          <span className="text-sm">{formatDateRange(event.startDate, event.endDate)}</span>
                        </div>
                        {event.openingHours && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="w-4 h-4 text-indigo-500 shrink-0" />
                            <span className="text-sm">{event.openingHours}</span>
                          </div>
                        )}
                      </div>

                      {event.description && (
                        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{event.description}</p>
                      )}

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
              );
            })}
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
