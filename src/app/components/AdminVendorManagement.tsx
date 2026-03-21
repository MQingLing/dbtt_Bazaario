import { useState } from 'react';
import AdminNav from './AdminNav';
import { User } from '../App';
import { ADMIN_VENDORS, AdminVendor } from '../data/mockData';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Search, CheckCircle2, XCircle, Eye, Mail, Phone } from 'lucide-react';

interface AdminVendorManagementProps {
  user: User;
  onLogout: () => void;
}

export default function AdminVendorManagement({ user, onLogout }: AdminVendorManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const [vendors, setVendors] = useState<AdminVendor[]>(ADMIN_VENDORS);

  const approveVendor = (id: string) => {
    setVendors(vendors.map(v => v.id === id ? { ...v, status: 'active' } : v));
  };

  const rejectVendor = (id: string) => {
    if (confirm('Are you sure you want to reject this vendor application?')) {
      setVendors(vendors.filter(v => v.id !== id));
    }
  };

  const suspendVendor = (id: string) => {
    if (confirm('Are you sure you want to suspend this vendor?')) {
      setVendors(vendors.map(v => v.id === id ? { ...v, status: 'suspended' } : v));
    }
  };

  const filteredVendors = vendors.filter(vendor =>
    vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vendor.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vendor.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getVendorsByStatus = (status: string) => {
    if (status === 'all') return filteredVendors;
    return filteredVendors.filter(vendor => vendor.status === status);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case 'suspended':
        return <Badge className="bg-red-500">Suspended</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <AdminNav user={user} onLogout={onLogout} />

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Vendor Management</h1>
          <p className="text-gray-600">Manage and approve vendor applications</p>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search vendors by name, owner, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Vendor Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{vendors.length}</p>
              <p className="text-sm text-gray-600">Total Vendors</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{vendors.filter(v => v.status === 'active').length}</p>
              <p className="text-sm text-gray-600">Active</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-yellow-600">{vendors.filter(v => v.status === 'pending').length}</p>
              <p className="text-sm text-gray-600">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-red-600">{vendors.filter(v => v.status === 'suspended').length}</p>
              <p className="text-sm text-gray-600">Suspended</p>
            </CardContent>
          </Card>
        </div>

        {/* Vendors Tabs */}
        <Tabs defaultValue="all">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="all">All ({filteredVendors.length})</TabsTrigger>
            <TabsTrigger value="active">Active ({getVendorsByStatus('active').length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({getVendorsByStatus('pending').length})</TabsTrigger>
            <TabsTrigger value="suspended">Suspended ({getVendorsByStatus('suspended').length})</TabsTrigger>
          </TabsList>

          {['all', 'active', 'pending', 'suspended'].map(status => (
            <TabsContent key={status} value={status} className="space-y-4">
              {getVendorsByStatus(status).map((vendor) => (
                <Card key={vendor.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-xl font-bold text-gray-900">{vendor.name}</h3>
                          {getStatusBadge(vendor.status)}
                          <Badge variant="outline">{vendor.category}</Badge>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-500">Owner</p>
                            <p className="font-medium text-gray-900">{vendor.owner}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Joined</p>
                            <p className="font-medium text-gray-900">{vendor.joined}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm mb-4">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Mail className="w-4 h-4" />
                            <span>{vendor.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Phone className="w-4 h-4" />
                            <span>{vendor.phone}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                          <div>
                            <p className="text-sm text-gray-600">Total Revenue</p>
                            <p className="text-lg font-bold text-green-600">${vendor.totalRevenue.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Events Participated</p>
                            <p className="text-lg font-bold text-purple-600">{vendor.events}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex md:flex-col gap-2">
                        {vendor.status === 'pending' && (
                          <>
                            <Button 
                              className="flex-1 md:flex-none bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                              onClick={() => approveVendor(vendor.id)}
                            >
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Approve
                            </Button>
                            <Button 
                              variant="outline" 
                              className="flex-1 md:flex-none text-red-600 border-red-600 hover:bg-red-50"
                              onClick={() => rejectVendor(vendor.id)}
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Reject
                            </Button>
                          </>
                        )}
                        {vendor.status === 'active' && (
                          <>
                            <Button variant="outline" className="flex-1 md:flex-none">
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                            <Button 
                              variant="outline" 
                              className="flex-1 md:flex-none text-red-600 border-red-600 hover:bg-red-50"
                              onClick={() => suspendVendor(vendor.id)}
                            >
                              Suspend
                            </Button>
                          </>
                        )}
                        {vendor.status === 'suspended' && (
                          <Button 
                            variant="outline" 
                            className="flex-1 md:flex-none"
                            onClick={() => approveVendor(vendor.id)}
                          >
                            Reactivate
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {getVendorsByStatus(status).length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-700 mb-2">No vendors found</h3>
                    <p className="text-gray-500">No vendors match your current filter</p>
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
