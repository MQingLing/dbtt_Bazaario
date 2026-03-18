import { Link, useParams } from 'react-router';
import CustomerNav from './CustomerNav';
import { User } from '../App';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { MapPin, Clock, Users, Star, Map, ArrowLeft, Calendar, Share2, Train, Music, ShoppingBag, Gamepad2 } from 'lucide-react';
import { pasarMalamEvents, getEventStatus } from '../data/pasarMalamData';
import { getEventVendors, getEventConcert } from '../data/vendors';

interface EventDetailsProps {
  user: User;
  onLogout: () => void;
}

const EVENT_IMAGES = [
  'https://images.unsplash.com/photo-1763621470208-efe14b618119?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaW5nYXBvcmUlMjBuaWdodCUyMG1hcmtldCUyMGZvb2QlMjBzdGFsbHN8ZW58MXx8fHwxNzcyNzE4OTUzfDA&ixlib=rb-4.1.0&q=80&w=1080',
  'https://images.unsplash.com/photo-1771804359368-0f91f81ee83b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMHN0cmVldCUyMGZvb2QlMjBjb2xvcmZ1bHxlbnwxfHx8fDE3NzI3MTg5NTR8MA&ixlib=rb-4.1.0&q=80&w=1080',
  'https://images.unsplash.com/photo-1768900318217-4c7677ffc2c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuaWdodCUyMG1hcmtldCUyMGxhbnRlcm5zJTIwYXNpYXxlbnwxfHx8fDE3NzI3MTg5NTR8MA&ixlib=rb-4.1.0&q=80&w=1080',
];

const VENDOR_IMAGES: Record<string, string> = {
  'Hot Food': 'https://images.unsplash.com/photo-1771804359368-0f91f81ee83b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMHN0cmVldCUyMGZvb2QlMjBjb2xvcmZ1bHxlbnwxfHx8fDE3NzI3MTg5NTR8MA&ixlib=rb-4.1.0&q=80&w=400',
  'Drinks': 'https://images.unsplash.com/photo-1670468642364-6cacadfb7bb0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidWJibGUlMjB0ZWElMjBkcmlua3N8ZW58MXx8fHwxNzcyNzE0OTA5fDA&ixlib=rb-4.1.0&q=80&w=400',
  'Desserts': 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
  'Snacks': 'https://images.unsplash.com/photo-1738599935343-991708a2895b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmllZCUyMHNuYWNrcyUyMGZvb2R8ZW58MXx8fHwxNzcyNzE4OTU1fDA&ixlib=rb-4.1.0&q=80&w=400',
  'Trendy Food': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
  'Household Items': 'https://images.unsplash.com/photo-1724709166740-96947d362a17?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpc2FuJTIwaGFuZGljcmFmdHMlMjBtYXJrZXR8ZW58MXx8fHwxNzcyNzE4OTU2fDA&ixlib=rb-4.1.0&q=80&w=400',
  'Games & Entertainment': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Hot Food': <ShoppingBag className="w-3 h-3" />,
  'Drinks': <ShoppingBag className="w-3 h-3" />,
  'Desserts': <ShoppingBag className="w-3 h-3" />,
  'Snacks': <ShoppingBag className="w-3 h-3" />,
  'Trendy Food': <ShoppingBag className="w-3 h-3" />,
  'Household Items': <ShoppingBag className="w-3 h-3" />,
  'Games & Entertainment': <Gamepad2 className="w-3 h-3" />,
};

export default function EventDetails({ user, onLogout }: EventDetailsProps) {
  const { id } = useParams();

  const event = pasarMalamEvents.find(e => e.id === id);

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
        <CustomerNav user={user} onLogout={onLogout} />
        <div className="container mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Event not found</h2>
          <Link to="/customer/events">
            <Button>Back to Events</Button>
          </Link>
        </div>
      </div>
    );
  }

  const status = getEventStatus(event);
  const vendors = getEventVendors(event.id);
  const concert = getEventConcert(event.id, event.startDate);
  const heroImage = EVENT_IMAGES[parseInt(event.id) % EVENT_IMAGES.length];

  const statusBadgeClass =
    status === 'ongoing' ? 'bg-green-500 hover:bg-green-600' :
    status === 'upcoming' ? 'bg-blue-500 hover:bg-blue-600' :
    'bg-gray-500 hover:bg-gray-600';

  const statusLabel =
    status === 'ongoing' ? 'Live Now' :
    status === 'upcoming' ? 'Upcoming' : 'Past';

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' });

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
            <img src={heroImage} alt={event.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <Badge className={`mb-3 ${statusBadgeClass}`}>{statusLabel}</Badge>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{event.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{vendors.length} vendors</span>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="text-white border-white/60 bg-white/10">{event.region}</Badge>
                </div>
                {concert && (
                  <div className="flex items-center gap-1">
                    <Music className="w-4 h-4 text-yellow-400" />
                    <span>Concert: {concert.artist}</span>
                  </div>
                )}
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
              <TabsList className={`grid w-full ${concert ? 'grid-cols-3' : 'grid-cols-2'}`}>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="vendors">Vendors ({vendors.length})</TabsTrigger>
                {concert && <TabsTrigger value="concert">Concert</TabsTrigger>}
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-4">About This Event</h3>
                    <p className="text-gray-600 mb-6">{event.description}</p>

                    <h4 className="font-bold mb-3">Highlights</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <Star className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{vendors.length} diverse vendors across {[...new Set(vendors.map(v => v.category))].length} categories</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">Authentic local street food and trendy eats</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">Household goods, fashion accessories and more</span>
                      </li>
                      {vendors.some(v => v.category === 'Games & Entertainment') && (
                        <li className="flex items-start gap-2">
                          <Star className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">Carnival games — darts, claw machines and more</span>
                        </li>
                      )}
                      {concert && (
                        <li className="flex items-start gap-2">
                          <Star className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">Live concert by {concert.artist}</span>
                        </li>
                      )}
                      <li className="flex items-start gap-2">
                        <Star className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">Family-friendly atmosphere</span>
                      </li>
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
                          <img
                            src={VENDOR_IMAGES[vendor.category] || VENDOR_IMAGES['Hot Food']}
                            alt={vendor.name}
                            className="w-full h-full object-cover"
                          />
                          <Badge className="absolute top-2 right-2 bg-white text-gray-900 text-xs">
                            Stall {vendor.stall}
                          </Badge>
                          <Badge className="absolute top-2 left-2 bg-black/50 text-white text-xs border-0">
                            {CATEGORY_ICONS[vendor.category]}
                            <span className="ml-1">{vendor.category}</span>
                          </Badge>
                        </div>
                        <CardContent className="p-4">
                          <h4 className="font-bold text-gray-900">{vendor.name}</h4>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500">{vendor.items.length} items</span>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                              <span className="text-sm font-medium">{vendor.rating}</span>
                            </div>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {vendor.items.slice(0, 2).map((item, i) => (
                              <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                {item.name} — ${item.price}
                              </span>
                            ))}
                            {vendor.items.length > 2 && (
                              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                                +{vendor.items.length - 2} more
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </TabsContent>

              {concert && (
                <TabsContent value="concert" className="mt-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <Music className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">Live Concert</h3>
                          <p className="text-gray-500 text-sm">Special performance at {event.name}</p>
                        </div>
                      </div>
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
                        <h4 className="text-2xl font-bold text-gray-900 mb-1">{concert.artist}</h4>
                        <p className="text-purple-600 font-medium mb-4">{concert.genre}</p>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 text-gray-700">
                            <Calendar className="w-5 h-5 text-purple-500" />
                            <span>{new Date(concert.date).toLocaleDateString('en-SG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                          </div>
                          <div className="flex items-center gap-3 text-gray-700">
                            <Clock className="w-5 h-5 text-pink-500" />
                            <span>{concert.time}</span>
                          </div>
                          <div className="flex items-center gap-3 text-gray-700">
                            <MapPin className="w-5 h-5 text-orange-500" />
                            <span>{concert.stage} — {event.venue}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
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
                    <p className="text-sm text-gray-700 ml-7">{event.venue}</p>
                    <p className="text-xs text-gray-500 ml-7">{event.address}</p>
                  </div>
                  {event.nearestMrt && (
                    <div>
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <Train className="w-5 h-5 text-pink-500" />
                        <span className="font-medium">Nearest MRT</span>
                      </div>
                      <p className="text-sm text-gray-700 ml-7">{event.nearestMrt}</p>
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Calendar className="w-5 h-5 text-pink-500" />
                      <span className="font-medium">Dates</span>
                    </div>
                    <p className="text-sm text-gray-700 ml-7">{formatDate(event.startDate)} – {formatDate(event.endDate)}</p>
                  </div>
                  {event.openingHours && (
                    <div>
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <Clock className="w-5 h-5 text-purple-500" />
                        <span className="font-medium">Opening Hours</span>
                      </div>
                      <p className="text-sm text-gray-700 ml-7">{event.openingHours}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
