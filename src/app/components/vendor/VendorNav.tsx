import { Link, useLocation } from 'react-router';
import { LayoutDashboard, TrendingUp, ShoppingBag, Package, LogOut, CalendarDays, CreditCard } from 'lucide-react';

import { Button } from '../shared/button';
import { Badge } from '../shared/badge';
import { User } from '../../App';
import { VendorTier } from '../../services/authStore';

interface VendorNavProps {
  user: User;
  onLogout: () => void;
  currentPage?: string;
}

const TIER_BADGE: Record<VendorTier, { label: string; class: string }> = {
  starter: { label: 'Starter',  class: 'bg-white/20 text-white' },
  growth:  { label: 'Growth',   class: 'bg-blue-200 text-blue-900' },
  pro:     { label: 'Pro',      class: 'bg-orange-200 text-orange-900' },
  anchor:  { label: 'Anchor',   class: 'bg-purple-200 text-purple-900' },
};

export default function VendorNav({ user, onLogout }: VendorNavProps) {
  const location = useLocation();
  const tier = user.vendorTier ?? 'starter';
  const tierBadge = TIER_BADGE[tier];

  const navItems = [
    { path: '/vendor/dashboard',       icon: LayoutDashboard, label: 'Dashboard',    minTier: 'starter' },
    { path: '/vendor/analytics',       icon: TrendingUp,       label: 'Analytics',   minTier: 'growth'  },
    { path: '/vendor/orders',          icon: ShoppingBag,      label: 'Orders',      minTier: 'starter' },
    { path: '/vendor/products',        icon: Package,          label: 'Products',    minTier: 'starter' },
    { path: '/vendor/events',          icon: CalendarDays,     label: 'Events',      minTier: 'starter' },
    { path: '/vendor/subscription',    icon: CreditCard,       label: 'Plan',        minTier: 'starter' },
  ];

  const tierOrder: VendorTier[] = ['starter', 'growth', 'pro', 'anchor'];
  const tierIndex = tierOrder.indexOf(tier);
  const isLocked = (minTier: string) => tierOrder.indexOf(minTier as VendorTier) > tierIndex;

  return (
    <>
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="shrink-0">
            <h1 className="text-xl font-bold leading-tight">Bazaario</h1>
            <p className="text-xs opacity-80 leading-tight">Vendor Portal</p>
          </div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-1 flex-1 min-w-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const locked = isLocked(item.minTier);
              return (
                <Link
                  key={item.path}
                  to={locked ? '/vendor/subscription' : item.path}
                  title={locked ? `Requires ${item.minTier} plan` : undefined}
                  className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-sm whitespace-nowrap ${
                    location.pathname === item.path
                      ? 'bg-white/20 font-medium'
                      : locked
                      ? 'opacity-50 hover:bg-white/10'
                      : 'hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {item.label}
                  {locked && <span className="text-xs opacity-70">🔒</span>}
                </Link>
              );
            })}
          </nav>

          {/* Tier badge + user + logout */}
          <div className="flex items-center gap-3 shrink-0">
            <Badge className={`hidden md:flex ${tierBadge.class} text-xs`}>{tierBadge.label}</Badge>
            <div className="text-right hidden md:block">
              <div className="text-sm font-semibold leading-tight max-w-[140px] truncate">{user.name}</div>
              <div className="text-xs text-white/70 leading-tight">Vendor Account</div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="text-white hover:bg-white/10"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="grid grid-cols-6 h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path);
            const locked = isLocked(item.minTier);
            return (
              <Link
                key={item.path}
                to={locked ? '/vendor/subscription' : item.path}
                className={`flex flex-col items-center justify-center gap-0.5 ${
                  isActive ? 'text-orange-500' : locked ? 'text-gray-300' : 'text-gray-500'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px]">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
