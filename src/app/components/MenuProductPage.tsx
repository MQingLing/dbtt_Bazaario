import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router';
import CustomerNav from './CustomerNav';
import { User } from '../App';
import { PRODUCTS } from '../data/mockData';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ArrowLeft, ShoppingCart, Plus, Minus, Bell, Star, Search } from 'lucide-react';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface MenuProductPageProps {
  user: User;
  onLogout: () => void;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  popular: boolean;
  inStock: boolean;
}

export default function MenuProductPage({ user, onLogout }: MenuProductPageProps) {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [searchQuery, setSearchQuery] = useState('');

  const menuItems: MenuItem[] = PRODUCTS;

  const categories = ['All', ...Array.from(new Set(menuItems.map(item => item.category)))];
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (itemId: string) => {
    setCart({ ...cart, [itemId]: (cart[itemId] || 0) + 1 });
  };

  const removeFromCart = (itemId: string) => {
    if (cart[itemId] > 1) {
      setCart({ ...cart, [itemId]: cart[itemId] - 1 });
    } else {
      const newCart = { ...cart };
      delete newCart[itemId];
      setCart(newCart);
    }
  };

  const getTotalItems = () => {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  };

  const getTotalPrice = () => {
    return Object.entries(cart).reduce((sum, [itemId, qty]) => {
      const item = menuItems.find(i => i.id === itemId);
      return sum + (item ? item.price * qty : 0);
    }, 0);
  };

  const handleRemindMe = (itemId: string) => {
    alert('You will be notified when this item is back in stock!');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <CustomerNav user={user} onLogout={onLogout} />

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <Link to={`/customer/vendor/${vendorId}`} className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Vendor
        </Link>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Menu & Products</h1>
          <p className="text-gray-600">Browse our selection and order ahead</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-2 pb-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={activeCategory === category ? 'default' : 'outline'}
                onClick={() => setActiveCategory(category)}
                className={activeCategory === category ? 'bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600' : ''}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Menu Items */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {filteredItems.map((item) => (
            <Card key={item.id} className="overflow-hidden flex flex-col">
              <div className="relative h-48">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                {item.popular && (
                  <Badge className="absolute top-2 left-2 bg-yellow-500 hover:bg-yellow-600">
                    <Star className="w-3 h-3 mr-1" />
                    Popular
                  </Badge>
                )}
                {!item.inStock && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Badge variant="secondary">Out of Stock</Badge>
                  </div>
                )}
              </div>
              <CardContent className="p-4 flex-1 flex flex-col">
                <h3 className="font-bold text-lg mb-2">{item.name}</h3>
                <p className="text-sm text-gray-600 mb-4 flex-1">{item.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-orange-600">${item.price.toFixed(2)}</span>
                  {item.inStock ? (
                    cart[item.id] ? (
                      <div className="flex items-center gap-2">
                        <Button size="icon" variant="outline" onClick={() => removeFromCart(item.id)}>
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="font-bold w-8 text-center">{cart[item.id]}</span>
                        <Button size="icon" onClick={() => addToCart(item.id)} className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button onClick={() => addToCart(item.id)} className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600">
                        <ShoppingCart className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    )
                  ) : (
                    <Button variant="outline" onClick={() => handleRemindMe(item.id)}>
                      <Bell className="w-4 h-4 mr-1" />
                      Remind Me
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <Card className="p-12 text-center">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">No items found</h3>
            <p className="text-gray-500">Try adjusting your search or filter</p>
          </Card>
        )}

        {/* Floating Cart */}
        {getTotalItems() > 0 && (
          <div className="fixed bottom-20 md:bottom-8 left-0 right-0 px-4 z-40">
            <div className="container mx-auto max-w-6xl">
              <Card className="bg-gradient-to-r from-orange-500 to-pink-500 text-white border-0 shadow-2xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-lg">{getTotalItems()} items in cart</p>
                      <p className="text-white/90">Total: ${getTotalPrice().toFixed(2)}</p>
                    </div>
                    <Button 
                      size="lg" 
                      variant="secondary"
                      onClick={() => navigate('/customer/checkout')}
                    >
                      Proceed to Checkout
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
