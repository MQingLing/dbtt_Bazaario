import { Link, useParams } from 'react-router';
import CustomerNav from './CustomerNav';
import { User } from '../App';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ArrowLeft, Star, MapPin, Clock, Tag, Heart, Share2, ShoppingCart } from 'lucide-react';

interface VendorStorePageProps {
  user: User;
  onLogout: () => void;
}

export default function VendorStorePage({ user, onLogout }: VendorStorePageProps) {
  const { id } = useParams();

  const vendor = {
    id: id,
    name: "Wong's Satay",
    category: 'Food',
    image: 'https://images.unsplash.com/photo-1722704689022-98d1b7795589?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYXRheSUyMGZvb2QlMjBzdGFsbHxlbnwxfHx8fDE3NzI3MTg5NTR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.9,
    reviews: 156,
    stall: 'A12',
    event: 'Geylang Serai Pasar Malam',
    description: 'Authentic Malaysian-style satay grilled to perfection. Family recipe passed down for 3 generations.',
    specialties: ['Chicken Satay', 'Beef Satay', 'Lamb Satay', 'Satay Sauce'],
    operatingHours: '6:00 PM - 12:00 AM',
    currentPromo: '20% OFF on orders above $20'
  };

  const featuredItems = [
    {
      id: '1',
      name: 'Chicken Satay (10 sticks)',
      price: 8.00,
      image: 'https://images.unsplash.com/photo-1722704689022-98d1b7795589?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYXRheSUyMGZvb2QlMjBzdGFsbHxlbnwxfHx8fDE3NzI3MTg5NTR8MA&ixlib=rb-4.1.0&q=80&w=1080',
      popular: true
    },
    {
      id: '2',
      name: 'Beef Satay (10 sticks)',
      price: 10.00,
      image: 'https://images.unsplash.com/photo-1771804359368-0f91f81ee83b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMHN0cmVldCUyMGZvb2QlMjBjb2xvcmZ1bHxlbnwxfHx8fDE3NzI3MTg5NTR8MA&ixlib=rb-4.1.0&q=80&w=1080',
      popular: false
    },
    {
      id: '3',
      name: 'Mixed Satay Platter',
      price: 25.00,
      image: 'https://images.unsplash.com/photo-1763621470208-efe14b618119?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaW5nYXBvcmUlMjBuaWdodCUyMG1hcmtldCUyMGZvb2QlMjBzdGFsbHN8ZW58MXx8fHwxNzcyNzE4OTUzfDA&ixlib=rb-4.1.0&q=80&w=1080',
      popular: true
    },
    {
      id: '4',
      name: 'Satay Sauce (Extra)',
      price: 2.00,
      image: 'https://images.unsplash.com/photo-1771804359368-0f91f81ee83b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMHN0cmVldCUyMGZvb2QlMjBjb2xvcmZ1bHxlbnwxfHx8fDE3NzI3MTg5NTR8MA&ixlib=rb-4.1.0&q=80&w=1080',
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <CustomerNav user={user} onLogout={onLogout} />

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <Link to="/customer/events/1" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Event
        </Link>

        {/* Hero Section */}
        <Card className="overflow-hidden mb-6">
          <div className="relative h-64 md:h-80">
            <img src={vendor.image} alt={vendor.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute top-4 right-4 flex gap-2">
              <Button size="icon" variant="secondary" className="rounded-full">
                <Heart className="w-5 h-5" />
              </Button>
              <Button size="icon" variant="secondary" className="rounded-full">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <Badge className="mb-3 bg-orange-500">{vendor.category}</Badge>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{vendor.name}</h1>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                  <span className="font-medium">{vendor.rating}</span>
                  <span className="text-white/80">({vendor.reviews} reviews)</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-5 h-5" />
                  <span>Stall {vendor.stall}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Current Promotion */}
        {vendor.currentPromo && (
          <Card className="mb-6 bg-gradient-to-r from-orange-500 to-pink-500 text-white border-0">
            <CardContent className="p-4 flex items-center gap-3">
              <Tag className="w-6 h-6" />
              <div>
                <p className="font-bold">Special Offer!</p>
                <p className="text-sm text-white/90">{vendor.currentPromo}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">About</h3>
                <p className="text-gray-600 mb-4">{vendor.description}</p>
                <div>
                  <h4 className="font-bold mb-2">Our Specialties</h4>
                  <div className="flex flex-wrap gap-2">
                    {vendor.specialties.map((specialty, index) => (
                      <Badge key={index} variant="outline">{specialty}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Featured Items */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Featured Items</h3>
                <Link to={`/customer/vendor/${id}/menu`}>
                  <Button variant="link" className="text-orange-600">View Full Menu →</Button>
                </Link>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {featuredItems.map((item) => (
                  <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative h-40">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      {item.popular && (
                        <Badge className="absolute top-2 right-2 bg-yellow-500 hover:bg-yellow-600">
                          Popular
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h4 className="font-bold mb-2">{item.name}</h4>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-orange-600">${item.price.toFixed(2)}</span>
                        <Button size="sm" className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600">
                          <ShoppingCart className="w-4 h-4 mr-1" />
                          Add
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Reviews Preview */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">Customer Reviews</h3>
                <div className="space-y-4">
                  {[
                    { name: 'Sarah L.', rating: 5, comment: 'Best satay I\'ve ever had! The sauce is amazing.' },
                    { name: 'Mike T.', rating: 5, comment: 'Always fresh and perfectly grilled. A must-try!' },
                    { name: 'Priya K.', rating: 4, comment: 'Delicious! Wish the portions were a bit bigger.' }
                  ].map((review, index) => (
                    <div key={index} className="border-b last:border-0 pb-4 last:pb-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {review.name[0]}
                        </div>
                        <div>
                          <p className="font-medium">{review.name}</p>
                          <div className="flex items-center gap-1">
                            {[...Array(review.rating)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold mb-4">Vendor Info</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-500 mb-1">Location</p>
                    <p className="font-medium">{vendor.event}</p>
                    <p className="text-gray-600">Stall {vendor.stall}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Operating Hours</p>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-orange-500" />
                      <p className="font-medium">{vendor.operatingHours}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Link to={`/customer/vendor/${id}/menu`}>
              <Button className="w-full h-12 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600">
                View Full Menu
              </Button>
            </Link>

            <Link to={`/customer/events/1/map`}>
              <Button variant="outline" className="w-full h-12">
                <MapPin className="w-5 h-5 mr-2" />
                View on Map
              </Button>
            </Link>

            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="p-4">
                <p className="text-sm text-gray-700">
                  <span className="font-bold">💡 Tip:</span> Pre-order now to skip the queue!
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
