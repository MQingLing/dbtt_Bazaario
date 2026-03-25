import { Link, useParams } from 'react-router';
import CustomerNav from './CustomerNav';
import { User } from '../../App';
import { PRODUCTS, MAP_STALLS } from '../../data/mockData';
import { Card, CardContent } from '../shared/card';
import { Badge } from '../shared/badge';
import { Button } from '../shared/button';
import { ArrowLeft, Star, MapPin, Clock, Heart, Share2, ShoppingCart } from 'lucide-react';

interface VendorStorePageProps {
  user: User;
  onLogout: () => void;
}

const CATEGORY_IMAGES: Record<string, string> = {
  Food:     'https://images.unsplash.com/photo-1722704689022-98d1b7795589?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
  Drinks:   'https://images.unsplash.com/photo-1571091718767-18b5b1457add?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
  Desserts: 'https://images.unsplash.com/photo-1488900128323-21503983a07e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
  Products: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
};

export default function VendorStorePage({ user, onLogout }: VendorStorePageProps) {
  const { id } = useParams();

  const stall = MAP_STALLS.find(s => s.id === id);

  if (!stall) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
        <CustomerNav user={user} onLogout={onLogout} />
        <div className="container mx-auto px-4 py-20 text-center">
          <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Vendor Not Found</h2>
          <p className="text-gray-500 mb-6">This vendor page doesn't exist or has been removed.</p>
          <Link to="/customer/events">
            <Button className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600">
              Browse Events
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const vendorProducts = PRODUCTS.filter(p => p.vendorId === id);
  const featuredItems  = vendorProducts.filter(p => p.popular);
  const heroImage      = CATEGORY_IMAGES[stall.category] ?? CATEGORY_IMAGES.Food;
  const hasRating      = stall.rating > 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <CustomerNav user={user} onLogout={onLogout} />

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <Link to="/customer/events/1" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Event
        </Link>

        {/* Hero */}
        <Card className="overflow-hidden mb-6">
          <div className="relative h-64 md:h-80">
            <img src={heroImage} alt={stall.vendorName} className="w-full h-full object-cover" />
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
              <Badge className="mb-3 bg-orange-500">{stall.category}</Badge>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{stall.vendorName}</h1>
              <div className="flex flex-wrap items-center gap-4">
                {hasRating ? (
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                    <span className="font-medium">{stall.rating}</span>
                    <span className="text-white/80">rating</span>
                  </div>
                ) : (
                  <span className="text-white/70 text-sm">No reviews yet</span>
                )}
                <div className="flex items-center gap-1">
                  <MapPin className="w-5 h-5" />
                  <span>Stall {stall.number}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Featured items */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">
                  {vendorProducts.length > 0 ? 'Featured Items' : 'Menu'}
                </h3>
                {vendorProducts.length > 0 && (
                  <Link to={`/customer/vendor/${id}/menu`}>
                    <Button variant="link" className="text-orange-600">View Full Menu →</Button>
                  </Link>
                )}
              </div>

              {featuredItems.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {featuredItems.map((item) => (
                    <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative h-40">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        <Badge className="absolute top-2 right-2 bg-yellow-500 hover:bg-yellow-600">Popular</Badge>
                      </div>
                      <CardContent className="p-4">
                        <h4 className="font-bold mb-2">{item.name}</h4>
                        <div className="flex items-center justify-between">
                          <span className="text-xl font-bold text-orange-600">${item.price.toFixed(2)}</span>
                          <Button size="sm" className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600">
                            <ShoppingCart className="w-4 h-4 mr-1" /> Add
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center text-gray-500">
                    <ShoppingCart className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                    <p className="font-medium">No products listed yet</p>
                    <p className="text-sm mt-1">Check back soon or visit the stall directly.</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Reviews */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">Customer Reviews</h3>
                {hasRating ? (
                  <div className="space-y-4">
                    {[
                      { name: 'Sarah L.', rating: 5, comment: 'Highly recommend — great quality and friendly service!' },
                      { name: 'Mike T.', rating: 5, comment: 'One of the best stalls at the bazaar. Will be back!' },
                    ].map((review, i) => (
                      <div key={i} className="border-b last:border-0 pb-4 last:pb-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {review.name[0]}
                          </div>
                          <div>
                            <p className="font-medium">{review.name}</p>
                            <div className="flex items-center gap-1">
                              {[...Array(review.rating)].map((_, j) => (
                                <Star key={j} className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                              ))}
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <Star className="w-10 h-10 mx-auto mb-2 text-gray-200" />
                    <p className="font-medium">No reviews yet</p>
                    <p className="text-sm mt-1">Be the first to visit this stall!</p>
                  </div>
                )}
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
                    <p className="font-medium">Geylang Serai Pasar Malam</p>
                    <p className="text-gray-600">Stall {stall.number}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Category</p>
                    <p className="font-medium">{stall.category}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Operating Hours</p>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-orange-500" />
                      <p className="font-medium">6:00 PM – 12:00 AM</p>
                    </div>
                  </div>
                  {hasRating && (
                    <div>
                      <p className="text-gray-500 mb-1">Rating</p>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                        <span className="font-medium">{stall.rating} / 5.0</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {vendorProducts.length > 0 && (
              <Link to={`/customer/vendor/${id}/menu`}>
                <Button className="w-full h-12 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600">
                  View Full Menu
                </Button>
              </Link>
            )}

            <Link to="/customer/events/1/map">
              <Button variant="outline" className="w-full h-12">
                <MapPin className="w-5 h-5 mr-2" /> View on Map
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
