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
import { Plus, MapPin, Calendar, Edit, Trash2, Layout, Train, Clock } from 'lucide-react';
import { pasarMalamEvents, PasarMalamEvent, EventStatus, getEventStatus } from '../data/pasarMalamData';

interface AdminEventManagementProps {
  user: User;
  onLogout: () => void;
}

const STATUS_COLORS: Record<EventStatus, string> = {
  ongoing: 'bg-green-500',
  upcoming: 'bg-blue-500',
  completed: 'bg-gray-400',
};

const EMPTY_EVENT: PasarMalamEvent = {
  id: '',
  name: '',
  region: 'Eastern Singapore',
  area: '',
  startDate: '',
  endDate: '',
  openingHours: '',
  venue: '',
  address: '',
  nearestMrt: '',
  description: '',
};

export default function AdminEventManagement({ user, onLogout }: AdminEventManagementProps) {
  const [events, setEvents] = useState<PasarMalamEvent[]>(pasarMalamEvents);
  const [filterStatus, setFilterStatus] = useState<EventStatus | 'all'>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<PasarMalamEvent | null>(null);

  const displayed = filterStatus === 'all' ? events : events.filter(e => getEventStatus(e) === filterStatus);

  const handleAddNew = () => {
    setEditingEvent({ ...EMPTY_EVENT });
    setIsDialogOpen(true);
  };

  const handleEdit = (event: PasarMalamEvent) => {
    setEditingEvent({ ...event });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!editingEvent) return;
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
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Event Management</h1>
            <p className="text-gray-600">Create and manage Pasar Malam events ({events.length} total)</p>
          </div>
          <Button
            onClick={handleAddNew}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Event
          </Button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(['all', 'ongoing', 'upcoming', 'completed'] as const).map(s => (
            <Button
              key={s}
              size="sm"
              variant={filterStatus === s ? 'default' : 'outline'}
              onClick={() => setFilterStatus(s)}
              className={filterStatus === s ? 'bg-purple-600 hover:bg-purple-700' : ''}
            >
              {s === 'all' ? `All (${events.length})` : `${s.charAt(0).toUpperCase() + s.slice(1)} (${events.filter(e => getEventStatus(e) === s).length})`}
            </Button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {displayed.map((event) => {
            const status = getEventStatus(event);
            return (
            <Card key={event.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0 mr-2">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 leading-tight">{event.name}</h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={STATUS_COLORS[status]}>{status}</Badge>
                      <Badge variant="outline" className="text-xs">{event.region}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(event)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(event.id)}>
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">{event.area}</p>
                      <p className="text-gray-500 text-xs">{event.venue}</p>
                      <p className="text-gray-500 text-xs">{event.address}</p>
                    </div>
                  </div>

                  {event.nearestMrt && (
                    <div className="flex items-center gap-2 text-sm">
                      <Train className="w-4 h-4 text-gray-500" />
                      <p className="text-gray-700">{event.nearestMrt}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <p className="text-gray-700">
                      {new Date(event.startDate).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' })} –{' '}
                      {new Date(event.endDate).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>

                  {event.openingHours && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <p className="text-gray-700">{event.openingHours}</p>
                    </div>
                  )}

                  {event.description && (
                    <p className="text-xs text-gray-500 pt-1 line-clamp-2">{event.description}</p>
                  )}

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
            );
          })}
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
                    placeholder="e.g., Geylang Serai Ramadan Bazaar"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="region">Region</Label>
                    <select
                      id="region"
                      value={editingEvent.region}
                      onChange={(e) => setEditingEvent({ ...editingEvent, region: e.target.value as PasarMalamEvent['region'] })}
                      className="w-full h-10 px-3 rounded-md border border-gray-200"
                    >
                      <option>Eastern Singapore</option>
                      <option>Northern Singapore</option>
                      <option>Western Singapore</option>
                      <option>Central Singapore</option>
                      <option>City & CBD</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="area">Area / Street</Label>
                    <Input
                      id="area"
                      value={editingEvent.area}
                      onChange={(e) => setEditingEvent({ ...editingEvent, area: e.target.value })}
                      placeholder="e.g., Geylang Road / Sims Avenue"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="venue">Venue</Label>
                  <Input
                    id="venue"
                    value={editingEvent.venue}
                    onChange={(e) => setEditingEvent({ ...editingEvent, venue: e.target.value })}
                    placeholder="e.g., Wisma Geylang Serai"
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
                <div>
                  <Label htmlFor="nearestMrt">Nearest MRT Station</Label>
                  <Input
                    id="nearestMrt"
                    value={editingEvent.nearestMrt}
                    onChange={(e) => setEditingEvent({ ...editingEvent, nearestMrt: e.target.value })}
                    placeholder="e.g., (CC9|EW8) Paya Lebar"
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
                <div>
                  <Label htmlFor="openingHours">Opening Hours</Label>
                  <Input
                    id="openingHours"
                    value={editingEvent.openingHours}
                    onChange={(e) => setEditingEvent({ ...editingEvent, openingHours: e.target.value })}
                    placeholder="e.g., 10:00am – 11:59pm"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={editingEvent.description}
                    onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                    placeholder="Brief description of the event"
                  />
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
