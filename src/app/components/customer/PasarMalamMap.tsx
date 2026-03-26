import { useState } from 'react';
import { Link, useParams } from 'react-router';
import CustomerNav from './CustomerNav';
import { User } from '../../App';
import { getEventVendors, Vendor } from '../../data/vendors';
import { pasarMalamEvents } from '../../data/pasarMalamData';
import { Card, CardContent } from '../shared/card';
import { Button } from '../shared/button';
import { Badge } from '../shared/badge';
import { ArrowLeft, MapPin, Star, Search } from 'lucide-react';
import { Input } from '../shared/input';

interface PasarMalamMapProps {
  user: User;
  onLogout: () => void;
}

// ── SVG grid constants (shared with MiniStallMap in VendorStorePage) ─────────
const CELL_W    = 14;
const CELL_H    = 10;
const STEP_X    = CELL_W + 2;  // 16 per col
const STEP_Y    = CELL_H + 5;  // 15 per row
const PAD       = 7;
const ENT_H     = 12;           // vertical space reserved for ENTRANCE label

function stallX(label: string): number {
  const col = parseInt(label.slice(1)) - 1; // A01 → col 0
  return PAD + col * STEP_X;
}
function stallY(label: string): number {
  const row = label.charCodeAt(0) - 65; // A=0, B=1 …
  return ENT_H + row * STEP_Y;
}

// ── Category colour mapping ────────────────────────────────────────────────
type MapCategory = 'Food' | 'Drinks' | 'Desserts' | 'Products' | 'Games';

function mapCategory(vendorCategory: string): MapCategory {
  if (['Hot Food', 'Snacks', 'Trendy Food'].includes(vendorCategory)) return 'Food';
  if (vendorCategory === 'Drinks')                                      return 'Drinks';
  if (vendorCategory === 'Desserts')                                    return 'Desserts';
  if (vendorCategory === 'Games & Entertainment')                       return 'Games';
  return 'Products';
}

const FILL_NORMAL: Record<MapCategory, string> = {
  Food:     '#f97316', // orange-500
  Drinks:   '#3b82f6', // blue-500
  Desserts: '#ec4899', // pink-500
  Products: '#a855f7', // purple-500
  Games:    '#10b981', // emerald-500
};
const FILL_HOVER: Record<MapCategory, string> = {
  Food:     '#ea580c',
  Drinks:   '#2563eb',
  Desserts: '#db2777',
  Products: '#9333ea',
  Games:    '#059669',
};
const LEGEND: { label: string; cat: MapCategory; colour: string }[] = [
  { label: 'Food',     cat: 'Food',     colour: '#f97316' },
  { label: 'Drinks',   cat: 'Drinks',   colour: '#3b82f6' },
  { label: 'Desserts', cat: 'Desserts', colour: '#ec4899' },
  { label: 'Products', cat: 'Products', colour: '#a855f7' },
  { label: 'Games',    cat: 'Games',    colour: '#10b981' },
];

export default function PasarMalamMap({ user, onLogout }: PasarMalamMapProps) {
  const { eventId } = useParams<{ eventId: string }>();
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [searchQuery,    setSearchQuery]    = useState('');
  const [hovered,        setHovered]        = useState<string | null>(null);

  const vendors  = getEventVendors(eventId ?? '');
  const event    = pasarMalamEvents.find(e => e.id === eventId);

  // ── Compute SVG dimensions from actual stall positions ───────────────────
  const maxCol    = Math.max(...vendors.map(v => parseInt(v.stall.slice(1))));
  const maxRowIdx = Math.max(...vendors.map(v => v.stall.charCodeAt(0) - 65));
  const svgW      = PAD + maxCol * STEP_X + PAD;
  const svgH      = ENT_H + (maxRowIdx + 1) * STEP_Y + PAD;

  // Build a stall lookup for empty-cell rendering
  // All rows present in data
  const rows = [...new Set(vendors.map(v => v.stall[0]))].sort();
  const filteredIds = new Set(
    vendors
      .filter(v =>
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.stall.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      .map(v => v.id),
  );

  const categoryCounts: Partial<Record<MapCategory, number>> = {};
  vendors.forEach(v => {
    const c = mapCategory(v.category);
    categoryCounts[c] = (categoryCounts[c] ?? 0) + 1;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <CustomerNav user={user} onLogout={onLogout} />

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <Link
          to={`/customer/events/${eventId}`}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Event Details
        </Link>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Interactive Stall Map</h1>
          {event && <p className="text-gray-500">{event.name} · {vendors.length} stalls</p>}
          <p className="text-gray-600 text-sm mt-1">Tap on any stall to view vendor details</p>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search vendors, categories or stall number…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Legend */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-center">
              <span className="font-medium text-sm text-gray-700">Categories:</span>
              {LEGEND.map(({ label, cat, colour }) => (
                <div key={cat} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: colour }} />
                  <span className="text-sm">
                    {label}
                    {categoryCounts[cat] ? (
                      <span className="text-gray-400 ml-1">({categoryCounts[cat]})</span>
                    ) : null}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <CardContent className="p-4">
                <div className="bg-gray-100 rounded-lg p-3 overflow-auto">
                  <svg
                    viewBox={`0 0 ${svgW} ${svgH}`}
                    className="w-full"
                    style={{ minHeight: 360 }}
                  >
                    {/* Venue boundary */}
                    <rect
                      x="2" y="2" width={svgW - 4} height={svgH - 4}
                      fill="none" stroke="#cbd5e1" strokeWidth="0.5" strokeDasharray="2,2"
                    />

                    {/* Entrance */}
                    <rect x={svgW / 2 - 14} y={2} width={28} height={8} rx={2} fill="#10b981" />
                    <text x={svgW / 2} y={8} textAnchor="middle" fontSize="3.5" fill="white" fontWeight="bold">
                      ENTRANCE
                    </text>

                    {/* Stalls */}
                    {vendors.map(vendor => {
                      const cat         = mapCategory(vendor.category);
                      const isSelected  = selectedVendor?.id === vendor.id;
                      const isHovered   = hovered === vendor.id;
                      const isFiltered  = searchQuery ? !filteredIds.has(vendor.id) : false;
                      const fill        = isHovered || isSelected ? FILL_HOVER[cat] : FILL_NORMAL[cat];
                      const x           = stallX(vendor.stall);
                      const y           = stallY(vendor.stall);

                      return (
                        <g
                          key={vendor.id}
                          className="cursor-pointer"
                          opacity={isFiltered ? 0.2 : 1}
                          onClick={() => setSelectedVendor(isSelected ? null : vendor)}
                          onMouseEnter={() => setHovered(vendor.id)}
                          onMouseLeave={() => setHovered(null)}
                        >
                          <rect
                            x={x} y={y} width={CELL_W} height={CELL_H} rx={1.5}
                            fill={fill}
                            stroke={isSelected ? '#fbbf24' : 'white'}
                            strokeWidth={isSelected ? 1.5 : 0.5}
                          />
                          <text
                            x={x + CELL_W / 2} y={y + CELL_H / 2 + 1.5}
                            textAnchor="middle" fontSize="3" fill="white"
                            fontWeight="bold" className="pointer-events-none"
                          >
                            {vendor.stall}
                          </text>
                        </g>
                      );
                    })}

                    {/* Row labels */}
                    {rows.map(row => (
                      <text
                        key={`row-${row}`}
                        x={PAD - 4}
                        y={stallY(`${row}01`) + CELL_H / 2 + 1.5}
                        textAnchor="middle" fontSize="3.5"
                        fill="#9ca3af" fontWeight="bold"
                      >
                        {row}
                      </text>
                    ))}
                  </svg>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="sticky top-6 space-y-4">
            {selectedVendor ? (
              <Card>
                <CardContent className="p-6">
                  <Badge
                    className="mb-3"
                    style={{ backgroundColor: FILL_NORMAL[mapCategory(selectedVendor.category)] }}
                  >
                    {selectedVendor.category}
                  </Badge>
                  <h3 className="text-xl font-bold mb-2">{selectedVendor.name}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Stall {selectedVendor.stall}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-6">
                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    <span className="font-medium">{selectedVendor.rating}</span>
                    <span className="text-sm text-gray-500">rating</span>
                  </div>
                  <Link to={`/customer/vendor/${selectedVendor.id}`}>
                    <Button className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600">
                      View Vendor Page
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="font-bold text-gray-700 mb-2">Select a Stall</h3>
                  <p className="text-sm text-gray-500">Tap any stall on the map to view details</p>
                </CardContent>
              </Card>
            )}

            {/* Quick Stats */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-bold mb-3">Quick Stats</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Stalls</span>
                    <span className="font-medium">{vendors.length}</span>
                  </div>
                  {LEGEND.map(({ label, cat }) =>
                    categoryCounts[cat] ? (
                      <div key={cat} className="flex justify-between">
                        <span className="text-gray-600">{label}</span>
                        <span className="font-medium">{categoryCounts[cat]}</span>
                      </div>
                    ) : null,
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
