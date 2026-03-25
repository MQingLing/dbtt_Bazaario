import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import AdminNav from './AdminNav';
import { User } from '../../App';
import { Card, CardContent } from '../shared/card';
import { Button } from '../shared/button';
import { Input } from '../shared/input';
import { Label } from '../shared/label';
import { Textarea } from '../shared/textarea';
import { 
  ArrowLeft, Plus, Trash2, DollarSign, Gavel, 
  Layout, Grid, Save, Info 
} from 'lucide-react';

interface AdminEventStallConfigProps {
  user: User;
  onLogout: () => void;
}

interface StallCategory {
  id: string;
  name: string;
  description: string;
  totalStalls: number;
  price?: number;
  minBid?: number;
}

interface EventConfig {
  eventName: string;
  pricingModel: 'fixed' | 'bidding';
  categories: StallCategory[];
}

export default function AdminEventStallConfig({ user, onLogout }: AdminEventStallConfigProps) {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [config, setConfig] = useState<EventConfig>({
    eventName: 'Chinatown CNY Night Market',
    pricingModel: 'bidding',
    categories: [
      {
        id: '1',
        name: 'Food Stall',
        description: 'Cooked food, snacks, and beverages',
        totalStalls: 60,
        minBid: 150
      },
      {
        id: '2',
        name: 'Non-Food Stall',
        description: 'Retail goods and merchandise',
        totalStalls: 40,
        minBid: 120
      },
      {
        id: '3',
        name: 'Premium Corner Stall',
        description: 'High-traffic corner locations',
        totalStalls: 20,
        minBid: 250
      }
    ]
  });

  const handleAddCategory = () => {
    const newCategory: StallCategory = {
      id: Date.now().toString(),
      name: '',
      description: '',
      totalStalls: 0,
      ...(config.pricingModel === 'fixed' ? { price: 0 } : { minBid: 0 })
    };
    setConfig({
      ...config,
      categories: [...config.categories, newCategory]
    });
  };

  const handleRemoveCategory = (id: string) => {
    setConfig({
      ...config,
      categories: config.categories.filter(cat => cat.id !== id)
    });
  };

  const handleUpdateCategory = (id: string, field: string, value: any) => {
    setConfig({
      ...config,
      categories: config.categories.map(cat =>
        cat.id === id ? { ...cat, [field]: value } : cat
      )
    });
  };

  const handlePricingModelChange = (model: 'fixed' | 'bidding') => {
    const updatedCategories = config.categories.map(cat => {
      const updated = { ...cat };
      if (model === 'fixed') {
        delete (updated as any).minBid;
        updated.price = 0;
      } else {
        delete (updated as any).price;
        updated.minBid = 0;
      }
      return updated;
    });

    setConfig({
      ...config,
      pricingModel: model,
      categories: updatedCategories
    });
  };

  const handleSave = () => {
    // In real app, save to backend
    alert('Stall configuration saved successfully!');
    navigate('/admin/events');
  };

  const totalStalls = config.categories.reduce((sum, cat) => sum + cat.totalStalls, 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <AdminNav user={user} onLogout={onLogout} />

      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/admin/events"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Events
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Configure Event Stalls</h1>
          <p className="text-gray-600">{config.eventName}</p>
        </div>

        {/* Summary Card */}
        <Card className="mb-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Grid className="w-5 h-5" />
                  <span className="text-white/80 text-sm">Total Stalls</span>
                </div>
                <p className="text-3xl font-bold">{totalStalls}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Layout className="w-5 h-5" />
                  <span className="text-white/80 text-sm">Categories</span>
                </div>
                <p className="text-3xl font-bold">{config.categories.length}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {config.pricingModel === 'fixed' ? (
                    <DollarSign className="w-5 h-5" />
                  ) : (
                    <Gavel className="w-5 h-5" />
                  )}
                  <span className="text-white/80 text-sm">Pricing Model</span>
                </div>
                <p className="text-2xl font-bold capitalize">{config.pricingModel}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Model Selection */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing Model</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={() => handlePricingModelChange('fixed')}
                className={`p-6 border-2 rounded-lg text-left transition-all ${
                  config.pricingModel === 'fixed'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    config.pricingModel === 'fixed' ? 'bg-purple-500' : 'bg-gray-200'
                  }`}>
                    <DollarSign className={`w-5 h-5 ${
                      config.pricingModel === 'fixed' ? 'text-white' : 'text-gray-500'
                    }`} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Fixed Price</h4>
                    <p className="text-sm text-gray-600">Set a fixed price per stall</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Vendors pay a predetermined fixed amount for each stall category and size.
                </p>
              </button>

              <button
                onClick={() => handlePricingModelChange('bidding')}
                className={`p-6 border-2 rounded-lg text-left transition-all ${
                  config.pricingModel === 'bidding'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    config.pricingModel === 'bidding' ? 'bg-purple-500' : 'bg-gray-200'
                  }`}>
                    <Gavel className={`w-5 h-5 ${
                      config.pricingModel === 'bidding' ? 'text-white' : 'text-gray-500'
                    }`} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Bidding</h4>
                    <p className="text-sm text-gray-600">Let vendors bid for stalls</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Vendors submit bids above the minimum amount. You select the best offers.
                </p>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Stall Categories */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Stall Categories</h3>
              <Button onClick={handleAddCategory} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </div>

            <div className="space-y-4">
              {config.categories.map((category, index) => (
                <div key={category.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900">Category {index + 1}</h4>
                    {config.categories.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveCategory(category.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Category Name</Label>
                      <Input
                        value={category.name}
                        onChange={(e) => handleUpdateCategory(category.id, 'name', e.target.value)}
                        placeholder="e.g., Food Stall"
                      />
                    </div>

                    <div>
                      <Label>Total Stalls</Label>
                      <Input
                        type="number"
                        value={category.totalStalls}
                        onChange={(e) => handleUpdateCategory(category.id, 'totalStalls', parseInt(e.target.value) || 0)}
                        placeholder="0"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label>Description</Label>
                      <Textarea
                        value={category.description}
                        onChange={(e) => handleUpdateCategory(category.id, 'description', e.target.value)}
                        placeholder="Brief description of this stall category"
                        rows={2}
                      />
                    </div>

                    <div>
                      <Label>
                        {config.pricingModel === 'fixed' ? 'Fixed Price (SGD)' : 'Minimum Bid (SGD)'}
                      </Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          type="number"
                          value={config.pricingModel === 'fixed' ? category.price : category.minBid}
                          onChange={(e) => handleUpdateCategory(
                            category.id,
                            config.pricingModel === 'fixed' ? 'price' : 'minBid',
                            parseFloat(e.target.value) || 0
                          )}
                          placeholder="0"
                          className="pl-9"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {config.categories.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                <Layout className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">No stall categories configured</p>
                <Button onClick={handleAddCategory}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Category
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Box */}
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">Configuration Tips</p>
                <ul className="list-disc list-inside space-y-1 text-blue-800">
                  <li>Choose Fixed Price for standard pricing, or Bidding for competitive allocation</li>
                  <li>Add multiple categories to organize different types of vendors</li>
                  <li>Set minimum bids strategically to maximize revenue while attracting quality vendors</li>
                  <li>Total stalls across all categories determines event capacity</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button onClick={handleSave} className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
            <Save className="w-4 h-4 mr-2" />
            Save Configuration
          </Button>
          <Button variant="outline" onClick={() => navigate('/admin/events')}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
