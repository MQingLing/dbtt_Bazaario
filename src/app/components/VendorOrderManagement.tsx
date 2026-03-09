import { useState } from 'react';
import VendorNav from './VendorNav';
import { User } from '../App';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { CheckCircle2, Clock, Package, XCircle, Search, User as UserIcon } from 'lucide-react';

interface VendorOrderManagementProps {
  user: User;
  onLogout: () => void;
}

export default function VendorOrderManagement({ user, onLogout }: VendorOrderManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const orders = [
    { id: '#1245', customer: 'Sarah Tan', phone: '+65 9123 4567', items: [{ name: 'Chicken Satay', qty: 2, price: 8 }, { name: 'Satay Sauce', qty: 1, price: 2 }], total: 18.00, time: '5 mins ago', status: 'pending', pickupTime: '7:30 PM' },
    { id: '#1244', customer: 'Mike Chen', phone: '+65 8234 5678', items: [{ name: 'Mixed Platter', qty: 1, price: 25 }], total: 25.00, time: '12 mins ago', status: 'preparing', pickupTime: '7:45 PM' },
    { id: '#1243', customer: 'Priya Kumar', phone: '+65 9345 6789', items: [{ name: 'Beef Satay', qty: 3, price: 10 }], total: 30.00, time: '18 mins ago', status: 'ready', pickupTime: '7:15 PM' },
    { id: '#1242', customer: 'John Lim', phone: '+65 8456 7890', items: [{ name: 'Chicken Satay', qty: 1, price: 8 }, { name: 'Satay Sauce', qty: 2, price: 2 }], total: 12.00, time: '25 mins ago', status: 'completed', pickupTime: '7:00 PM' },
    { id: '#1241', customer: 'Lisa Wong', phone: '+65 9567 8901', items: [{ name: 'Mixed Platter', qty: 2, price: 25 }], total: 50.00, time: '32 mins ago', status: 'completed', pickupTime: '6:45 PM' },
    { id: '#1240', customer: 'David Ng', phone: '+65 8678 9012', items: [{ name: 'Lamb Satay', qty: 1, price: 12 }], total: 12.00, time: '15 mins ago', status: 'cancelled', pickupTime: '8:00 PM' },
  ];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return { badge: <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>, icon: Clock, color: 'text-yellow-600' };
      case 'preparing':
        return { badge: <Badge className="bg-blue-500 hover:bg-blue-600">Preparing</Badge>, icon: Package, color: 'text-blue-600' };
      case 'ready':
        return { badge: <Badge className="bg-green-500 hover:bg-green-600">Ready</Badge>, icon: CheckCircle2, color: 'text-green-600' };
      case 'completed':
        return { badge: <Badge variant="outline">Completed</Badge>, icon: CheckCircle2, color: 'text-gray-600' };
      case 'cancelled':
        return { badge: <Badge variant="destructive">Cancelled</Badge>, icon: XCircle, color: 'text-red-600' };
      default:
        return { badge: <Badge>{status}</Badge>, icon: Clock, color: 'text-gray-600' };
    }
  };

  const filteredOrders = orders.filter(order =>
    order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.customer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getOrdersByStatus = (status: string) => {
    if (status === 'all') return filteredOrders;
    return filteredOrders.filter(order => order.status === status);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <VendorNav user={user} onLogout={onLogout} />

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Management</h1>
          <p className="text-gray-600">Manage and track customer orders</p>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by order ID or customer name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Orders Tabs */}
        <Tabs defaultValue="all">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="all">All ({filteredOrders.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({getOrdersByStatus('pending').length})</TabsTrigger>
            <TabsTrigger value="preparing">Preparing ({getOrdersByStatus('preparing').length})</TabsTrigger>
            <TabsTrigger value="ready">Ready ({getOrdersByStatus('ready').length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({getOrdersByStatus('completed').length})</TabsTrigger>
          </TabsList>

          {['all', 'pending', 'preparing', 'ready', 'completed'].map(status => (
            <TabsContent key={status} value={status} className="space-y-4">
              {getOrdersByStatus(status).map((order) => {
                const statusConfig = getStatusConfig(order.status);
                const StatusIcon = statusConfig.icon;

                return (
                  <Card key={order.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-xl font-bold text-gray-900">{order.id}</h3>
                            {statusConfig.badge}
                          </div>

                          <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center gap-2 text-gray-600">
                              <UserIcon className="w-4 h-4" />
                              <div>
                                <p className="font-medium text-gray-900">{order.customer}</p>
                                <p className="text-sm">{order.phone}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Clock className="w-4 h-4" />
                              <div>
                                <p className="text-sm">Pickup: {order.pickupTime}</p>
                                <p className="text-sm text-gray-500">{order.time}</p>
                              </div>
                            </div>
                          </div>

                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">Order Items:</p>
                            <div className="space-y-1">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-sm">
                                  <span className="text-gray-600">{item.qty}x {item.name}</span>
                                  <span className="font-medium">${(item.price * item.qty).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t">
                            <span className="text-sm text-gray-600">Total</span>
                            <span className="text-xl font-bold text-orange-600">${order.total.toFixed(2)}</span>
                          </div>
                        </div>

                        <div className="flex md:flex-col gap-2">
                          {order.status === 'pending' && (
                            <>
                              <Button className="flex-1 md:flex-none bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600">
                                Accept Order
                              </Button>
                              <Button variant="outline" className="flex-1 md:flex-none">
                                Decline
                              </Button>
                            </>
                          )}
                          {order.status === 'preparing' && (
                            <Button className="flex-1 md:flex-none bg-green-600 hover:bg-green-700">
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Mark Ready
                            </Button>
                          )}
                          {order.status === 'ready' && (
                            <Button className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700">
                              Complete Order
                            </Button>
                          )}
                          {order.status === 'completed' && (
                            <Button variant="outline" className="flex-1 md:flex-none" disabled>
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Completed
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {getOrdersByStatus(status).length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-700 mb-2">No orders found</h3>
                    <p className="text-gray-500">Orders will appear here when customers place them</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
