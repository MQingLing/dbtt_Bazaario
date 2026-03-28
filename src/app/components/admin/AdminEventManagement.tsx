import { useState } from 'react';
import { Link } from 'react-router';
import AdminNav from './AdminNav';
import { User } from '../../App';
import { Card, CardContent } from '../shared/card';
import { Badge } from '../shared/badge';
import { Button } from '../shared/button';
import { Input } from '../shared/input';
import { Label } from '../shared/label';
import { Textarea } from '../shared/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../shared/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../shared/dialog';
import { Plus, MapPin, Calendar, Edit, Trash2, Layout, Train, Clock, CheckCircle2, AlertCircle, XCircle, FileText } from 'lucide-react';
import { pasarMalamEvents, PasarMalamEvent, EventStatus, getEventStatus } from '../../data/pasarMalamData';
import { getEventCompliance, hasEventCompliance, saveEventCompliance, EventCompliance, PermitRecord, PermitStatus } from '../../services/dataStore';

interface AdminEventManagementProps {
  user: User;
  onLogout: () => void;
}

const EVENT_STATUS_COLORS: Record<EventStatus, string> = {
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

// ── Permit helpers ─────────────────────────────────────────────────────────────

const PERMIT_STATUS_CONFIG: Record<PermitStatus, { label: string; className: string }> = {
  not_required: { label: 'Not Required', className: 'bg-gray-100 text-gray-500 border-gray-200'      },
  pending:      { label: 'Pending',      className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  submitted:    { label: 'Submitted',    className: 'bg-blue-100 text-blue-700 border-blue-200'       },
  approved:     { label: 'Approved',     className: 'bg-green-100 text-green-700 border-green-200'    },
  expired:      { label: 'Expired',      className: 'bg-red-100 text-red-700 border-red-200'          },
};

function PermitBadge({ permit, onClick }: { permit: PermitRecord; onClick?: () => void }) {
  const cfg = PERMIT_STATUS_CONFIG[permit.status];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-medium transition-opacity hover:opacity-75 ${cfg.className}`}
    >
      {permit.status === 'approved'     && <CheckCircle2 className="w-3 h-3" />}
      {permit.status === 'expired'      && <XCircle      className="w-3 h-3" />}
      {permit.status === 'submitted'    && <FileText     className="w-3 h-3" />}
      {(permit.status === 'pending' || permit.status === 'not_required') && <AlertCircle className="w-3 h-3" />}
      {cfg.label}
    </button>
  );
}

const AGENCIES: { key: keyof Omit<EventCompliance, 'eventId' | 'updatedAt'>; label: string; description: string }[] = [
  { key: 'scdf', label: 'SCDF',  description: 'Singapore Civil Defence Force — fire safety & crowd safety permit' },
  { key: 'sfa',  label: 'SFA',   description: 'Singapore Food Agency — food stall licensing & hygiene certification' },
  { key: 'ema',  label: 'EMA',   description: 'Energy Market Authority — temporary electrical installation permit' },
];

export default function AdminEventManagement({ user, onLogout }: AdminEventManagementProps) {
  // ── Events state ──────────────────────────────────────────────────────────
  const [events, setEvents] = useState<PasarMalamEvent[]>(pasarMalamEvents);
  const [filterStatus, setFilterStatus] = useState<EventStatus | 'all'>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<PasarMalamEvent | null>(null);

  const STATUS_ORDER: Record<EventStatus, number> = { ongoing: 0, upcoming: 1, completed: 2 };
  const displayed = (filterStatus === 'all' ? events : events.filter(e => getEventStatus(e) === filterStatus))
    .slice()
    .sort((a, b) => STATUS_ORDER[getEventStatus(a)] - STATUS_ORDER[getEventStatus(b)]);

  const EMPTY_PERMITS: { scdf: PermitRecord; sfa: PermitRecord; ema: PermitRecord } = {
    scdf: { status: 'pending' }, sfa: { status: 'pending' }, ema: { status: 'pending' },
  };
  const [editingCompliance, setEditingCompliance] = useState<{ scdf: PermitRecord; sfa: PermitRecord; ema: PermitRecord }>(EMPTY_PERMITS);

  const handleAddNew = () => {
    setEditingEvent({ ...EMPTY_EVENT });
    setEditingCompliance(EMPTY_PERMITS);
    setIsDialogOpen(true);
  };
  const handleEdit = (event: PasarMalamEvent) => {
    setEditingEvent({ ...event });
    const rec = complianceRecords[event.id] ?? getEventCompliance(event.id);
    setEditingCompliance({ scdf: { ...rec.scdf }, sfa: { ...rec.sfa }, ema: { ...rec.ema } });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!editingEvent) return;
    const eventId = editingEvent.id || Date.now().toString();
    if (editingEvent.id) {
      setEvents(events.map(e => e.id === editingEvent.id ? editingEvent : e));
    } else {
      setEvents(prev => [...prev, { ...editingEvent, id: eventId }]);
    }
    const rec: EventCompliance = { eventId, ...editingCompliance, updatedAt: new Date().toISOString() };
    saveEventCompliance(rec);
    setComplianceRecords(r => ({ ...r, [eventId]: rec }));
    setIsDialogOpen(false);
    setEditingEvent(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      setEvents(events.filter(e => e.id !== id));
    }
  };

  // ── Compliance state ──────────────────────────────────────────────────────
  const [complianceRecords, setComplianceRecords] = useState<Record<string, EventCompliance>>(() => {
    const APPROVED: EventCompliance['scdf'] = { status: 'approved' };
    return Object.fromEntries(events.map(e => {
      // If never manually set and event is completed/ongoing, seed as approved
      if (!hasEventCompliance(e.id) && (getEventStatus(e) === 'completed' || getEventStatus(e) === 'ongoing')) {
        const rec: EventCompliance = {
          eventId: e.id, scdf: APPROVED, sfa: APPROVED, ema: APPROVED,
          updatedAt: new Date().toISOString(),
        };
        saveEventCompliance(rec);
        return [e.id, rec];
      }
      return [e.id, getEventCompliance(e.id)];
    }));
  });

  // Modal state for editing a single permit
  const [editPermit, setEditPermit] = useState<{
    eventId: string;
    agency: keyof Omit<EventCompliance, 'eventId' | 'updatedAt'>;
    permit: PermitRecord;
  } | null>(null);

  const openPermitEdit = (
    eventId: string,
    agency: keyof Omit<EventCompliance, 'eventId' | 'updatedAt'>,
  ) => {
    const record = complianceRecords[eventId] ?? getEventCompliance(eventId);
    setEditPermit({ eventId, agency, permit: { ...record[agency] } });
  };

  const savePermit = () => {
    if (!editPermit) return;
    const prev = complianceRecords[editPermit.eventId] ?? getEventCompliance(editPermit.eventId);
    const updated: EventCompliance = {
      ...prev,
      [editPermit.agency]: editPermit.permit,
      updatedAt: new Date().toISOString(),
    };
    saveEventCompliance(updated);
    setComplianceRecords(r => ({ ...r, [editPermit.eventId]: updated }));
    setEditPermit(null);
  };

  // Compliance summary counts (across all events × 3 agencies)
  const allPermits = events.flatMap(e => {
    const rec = complianceRecords[e.id] ?? getEventCompliance(e.id);
    return [rec.scdf, rec.sfa, rec.ema];
  });
  const complianceSummary = {
    total:       allPermits.length,
    approved:    allPermits.filter(p => p.status === 'approved').length,
    pending:     allPermits.filter(p => p.status === 'pending').length,
    submitted:   allPermits.filter(p => p.status === 'submitted').length,
    expired:     allPermits.filter(p => p.status === 'expired').length,
    notRequired: allPermits.filter(p => p.status === 'not_required').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <AdminNav user={user} onLogout={onLogout} />

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Event Management</h1>
            <p className="text-gray-600">Manage Pasar Malam events and regulatory compliance</p>
          </div>
          <Button
            onClick={handleAddNew}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Event
          </Button>
        </div>

        <Tabs defaultValue="events">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="events">Events ({events.length})</TabsTrigger>
            <TabsTrigger value="compliance" className="relative">
              Compliance
              {complianceSummary.expired > 0 && (
                <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold">
                  {complianceSummary.expired}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* ── Events Tab ── */}
          <TabsContent value="events">
            {/* Filter buttons */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {(['all', 'ongoing', 'upcoming', 'completed'] as const).map(s => (
                <Button
                  key={s}
                  size="sm"
                  variant={filterStatus === s ? 'default' : 'outline'}
                  onClick={() => setFilterStatus(s)}
                  className={filterStatus === s ? 'bg-purple-600 hover:bg-purple-700' : ''}
                >
                  {s === 'all'
                    ? `All (${events.length})`
                    : `${s.charAt(0).toUpperCase() + s.slice(1)} (${events.filter(e => getEventStatus(e) === s).length})`}
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
                            <Badge className={EVENT_STATUS_COLORS[status]}>{status}</Badge>
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
          </TabsContent>

          {/* ── Compliance Tab ── */}
          <TabsContent value="compliance">
            {/* Summary stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">{complianceSummary.approved}</p>
                  <p className="text-sm text-gray-500">Approved</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-blue-600">{complianceSummary.submitted}</p>
                  <p className="text-sm text-gray-500">Submitted</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-yellow-600">{complianceSummary.pending}</p>
                  <p className="text-sm text-gray-500">Pending</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-red-600">{complianceSummary.expired}</p>
                  <p className="text-sm text-gray-500">Expired</p>
                </CardContent>
              </Card>
            </div>

            {/* Agency legend */}
            <div className="grid md:grid-cols-3 gap-3 mb-6">
              {AGENCIES.map(a => (
                <div key={a.key} className="bg-white border rounded-xl px-4 py-3">
                  <p className="font-bold text-gray-800 text-sm">{a.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{a.description}</p>
                </div>
              ))}
            </div>

            {/* Per-event compliance table */}
            <div className="space-y-3">
              {[...events].sort((a, b) => STATUS_ORDER[getEventStatus(a)] - STATUS_ORDER[getEventStatus(b)]).map(event => {
                const rec = complianceRecords[event.id] ?? getEventCompliance(event.id);
                const eventStatus = getEventStatus(event);
                const hasIssue = rec.scdf.status === 'expired' || rec.sfa.status === 'expired' || rec.ema.status === 'expired';

                return (
                  <Card key={event.id} className={hasIssue ? 'border-red-200' : ''}>
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        {/* Event info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <p className="font-semibold text-gray-900 truncate">{event.name}</p>
                            <Badge className={`${EVENT_STATUS_COLORS[eventStatus]} text-xs`}>{eventStatus}</Badge>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(event.startDate).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' })}
                              {' – '}
                              {new Date(event.endDate).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                            <span>{event.area}</span>
                          </div>
                        </div>

                        {/* Permit badges — fixed-width grid so columns align across all rows */}
                        <div className="grid grid-cols-3 shrink-0 w-72">
                          {AGENCIES.map(a => (
                            <div key={a.key} className="flex flex-col items-center gap-1">
                              <span className="text-xs font-semibold text-gray-500">{a.label}</span>
                              <PermitBadge
                                permit={rec[a.key]}
                                onClick={() => openPermitEdit(event.id, a.key)}
                              />
                              {rec[a.key].referenceNo && (
                                <span className="text-xs text-gray-400 font-mono text-center truncate w-full px-1">{rec[a.key].referenceNo}</span>
                              )}
                              {rec[a.key].expiryDate && (
                                <span className="text-xs text-gray-400 text-center">
                                  Exp: {new Date(rec[a.key].expiryDate!).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Notes row */}
                      {(rec.scdf.notes || rec.sfa.notes || rec.ema.notes) && (
                        <div className="mt-3 pt-3 border-t grid md:grid-cols-3 gap-2">
                          {AGENCIES.map(a => rec[a.key].notes ? (
                            <p key={a.key} className="text-xs text-gray-500">
                              <span className="font-semibold text-gray-700">{a.label}:</span> {rec[a.key].notes}
                            </p>
                          ) : null)}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* ── Edit/Add Event Dialog ── */}
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
                {/* Regulatory Permits */}
                <div className="border-t pt-4">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Regulatory Permits</p>
                  <div className="space-y-3">
                    {AGENCIES.map(a => {
                      const permit = editingCompliance[a.key];
                      return (
                        <div key={a.key} className="grid grid-cols-1 gap-2 p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs font-semibold text-gray-700">{a.label} <span className="text-gray-400 font-normal">— {a.description}</span></p>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-xs">Status</Label>
                              <select
                                value={permit.status}
                                onChange={e => setEditingCompliance(c => ({ ...c, [a.key]: { ...c[a.key], status: e.target.value as PermitStatus } }))}
                                className="w-full h-9 px-2 rounded-md border border-gray-200 text-sm"
                              >
                                <option value="not_required">Not Required</option>
                                <option value="pending">Pending</option>
                                <option value="submitted">Submitted</option>
                                <option value="approved">Approved</option>
                                <option value="expired">Expired</option>
                              </select>
                            </div>
                            <div>
                              <Label className="text-xs">Reference No.</Label>
                              <Input
                                className="h-9 text-sm"
                                placeholder={`e.g., ${a.label}/2026/001`}
                                value={permit.referenceNo ?? ''}
                                onChange={e => setEditingCompliance(c => ({ ...c, [a.key]: { ...c[a.key], referenceNo: e.target.value } }))}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-xs">Expiry Date</Label>
                              <Input
                                type="date"
                                className="h-9 text-sm"
                                value={permit.expiryDate ?? ''}
                                onChange={e => setEditingCompliance(c => ({ ...c, [a.key]: { ...c[a.key], expiryDate: e.target.value } }))}
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Notes</Label>
                              <Input
                                className="h-9 text-sm"
                                placeholder="Optional remarks"
                                value={permit.notes ?? ''}
                                onChange={e => setEditingCompliance(c => ({ ...c, [a.key]: { ...c[a.key], notes: e.target.value } }))}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
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

        {/* ── Edit Permit Dialog ── */}
        <Dialog open={!!editPermit} onOpenChange={open => { if (!open) setEditPermit(null); }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editPermit && AGENCIES.find(a => a.key === editPermit.agency)?.label} Permit
              </DialogTitle>
              <DialogDescription>
                {editPermit && AGENCIES.find(a => a.key === editPermit.agency)?.description}
              </DialogDescription>
            </DialogHeader>
            {editPermit && (
              <div className="space-y-4 mt-2">
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <select
                    value={editPermit.permit.status}
                    onChange={e => setEditPermit({ ...editPermit, permit: { ...editPermit.permit, status: e.target.value as PermitStatus } })}
                    className="w-full h-10 px-3 rounded-md border border-gray-200 text-sm"
                  >
                    <option value="not_required">Not Required</option>
                    <option value="pending">Pending</option>
                    <option value="submitted">Submitted</option>
                    <option value="approved">Approved</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Reference Number</Label>
                  <Input
                    placeholder="e.g., SCDF/2026/00123"
                    value={editPermit.permit.referenceNo ?? ''}
                    onChange={e => setEditPermit({ ...editPermit, permit: { ...editPermit.permit, referenceNo: e.target.value } })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Expiry Date</Label>
                  <Input
                    type="date"
                    value={editPermit.permit.expiryDate ?? ''}
                    onChange={e => setEditPermit({ ...editPermit, permit: { ...editPermit.permit, expiryDate: e.target.value } })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Notes</Label>
                  <Textarea
                    placeholder="Any remarks or follow-up actions..."
                    value={editPermit.permit.notes ?? ''}
                    onChange={e => setEditPermit({ ...editPermit, permit: { ...editPermit.permit, notes: e.target.value } })}
                    rows={3}
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <Button variant="outline" className="flex-1" onClick={() => setEditPermit(null)}>Cancel</Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    onClick={savePermit}
                  >
                    Save
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
