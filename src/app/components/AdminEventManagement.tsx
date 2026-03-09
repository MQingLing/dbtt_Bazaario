import { useState } from 'react';
import { Link } from 'react-router';
import AdminNav from './AdminNav';
import { User } from '../App';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Plus, MapPin, Calendar, Users, Edit, Trash2, Layout } from 'lucide-react';

interface AdminEventManagementProps {
  user: User;
  onLogout: () => void;
}

export default function AdminEventManagement({ user, onLogout }: AdminEventManagementProps) {
  const [events, setEvents] = useState([
    {
      id: '1',
      name: 'Geylang Serai Pasar Malam',
      location: 'Geylang Serai',
      address: '1 Geylang Serai, Singapore 402001',
      startDate: '2026-03-05',
      endDate: '2026-03-15',
      startTime: '18:00',
      endTime: '00:00',
      vendors: 45,
      status: 'ongoing',
      revenue: 12500
    },
    {
      id: '2',
      name: 'Toa Payoh Night Bazaar',
      location: 'Toa Payoh Central',
      address: 'Toa Payoh Central, Singapore 310177',
      startDate: '2026-03-10',
      endDate: '2026-03-20',
      startTime: '17:30',
      endTime: '23:30',
      vendors: 38,
      status: 'upcoming',
      revenue: 0
    },
    {
      id: '3',
      name: 'Chinatown Street Market',
      location: 'Chinatown',
      address: 'Chinatown Street, Singapore 058357',
      startDate: '2026-03-12',
      endDate: '2026-03-25',
      startTime: '18:00',
      endTime: '01:00',
      vendors: 52,
      status: 'upcoming',
      revenue: 0
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);

  const handleAddNew = () => {
    setEditingEvent({
      id: '',
      name: '',
      location: '',
      address: '',
      startDate: '',
      endDate: '',
      startTime: '18:00',
      endTime: '00:00',
      vendors: 0,
      status: 'upcoming',
      revenue: 0
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (event: any) => {
    setEditingEvent(event);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (editingEvent.id) {
      setEvents(events.map(e => e.id === editingEvent.id ? editingEvent : e));
    } else {
      setEvents([...events, { ...editingEvent, id: Date.now().toString() }]);
    }
    setIsDialogOpen(false);
    setEditingEvent(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      setEvents(events.filter(e => e.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <AdminNav user={user} onLogout={onLogout} />

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Event Management</h1>
            <p className="text-gray-600">Create and manage Pasar Malam events</p>
          </div>
          <Button 
            onClick={handleAddNew}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Event
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {events.map((event) => (
            <Card key={event.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{event.name}</h3>
                    <Badge className={event.status === 'ongoing' ? 'bg-green-500' : 'bg-blue-500'}>
                      {event.status}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(event)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(event.id)}>
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">{event.location}</p>
                      <p className="text-gray-600">{event.address}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <p className="text-gray-700">
                      {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-gray-500" />
                    <p className="text-gray-700">{event.vendors} vendors registered</p>
                  </div>

                  <div className="pt-3 border-t grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Operating Hours</p>
                      <p className="font-medium">{event.startTime} - {event.endTime}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Revenue</p>
                      <p className="font-medium text-green-600">${event.revenue.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t">
                    <Link to={`/admin/events/${event.id}/stalls`}>
                      <Button variant="outline" className="w-full">
                        <Layout className="w-4 h-4 mr-2" />
                        Configure Stalls
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Edit/Add Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingEvent?.id ? 'Edit Event' : 'Create New Event'}</DialogTitle>
              <DialogDescription>
                {editingEvent?.id ? 'Update event details' : 'Create a new Pasar Malam event'}
              </DialogDescription>
            </DialogHeader>
            {editingEvent && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Event Name</Label>
                  <Input
                    id="name"
                    value={editingEvent.name}
                    onChange={(e) => setEditingEvent({ ...editingEvent, name: e.target.value })}
                    placeholder="e.g., Geylang Serai Pasar Malam"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location Name</Label>
                  <Input
                    id="location"
                    value={editingEvent.location}
                    onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })}
                    placeholder="e.g., Geylang Serai"
                  />
                </div>
                <div>
                  <Label htmlFor="address">Full Address</Label>
                  <Textarea
                    id="address"
                    value={editingEvent.address}
                    onChange={(e) => setEditingEvent({ ...editingEvent, address: e.target.value })}
                    placeholder="Enter complete address"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={editingEvent.startDate}
                      onChange={(e) => setEditingEvent({ ...editingEvent, startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={editingEvent.endDate}
                      onChange={(e) => setEditingEvent({ ...editingEvent, endDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={editingEvent.startTime}
                      onChange={(e) => setEditingEvent({ ...editingEvent, startTime: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={editingEvent.endTime}
                      onChange={(e) => setEditingEvent({ ...editingEvent, endTime: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    value={editingEvent.status}
                    onChange={(e) => setEditingEvent({ ...editingEvent, status: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-gray-200"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSave}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {editingEvent.id ? 'Update' : 'Create'} Event
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
