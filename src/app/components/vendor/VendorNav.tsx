import { Link, useLocation } from 'react-router';
import { LayoutDashboard, TrendingUp, ShoppingBag, Package, LogOut, Calendar, FileText } from 'lucide-react';
import { Button } from '../shared/button';
import { User } from '../../App';

interface VendorNavProps {
  user: User;
  onLogout: () => void;
  currentPage?: string; // Optional prop for compatibility
}

export default function VendorNav({ user, onLogout }: VendorNavProps) {
  const location = useLocation();

  const navItems = [
    { path: '/vendor/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/vendor/analytics', icon: TrendingUp, label: 'Analytics' },
    { path: '/vendor/orders', icon: ShoppingBag, label: 'Orders' },
    { path: '/vendor/products', icon: Package, label: 'Products' },
    { path: '/vendor/apply-events', icon: Calendar, label: 'Apply' },
    { path: '/vendor/my-applications', icon: FileText, label: 'Applications' },
  ];

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
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-sm whitespace-nowrap ${
                    location.pathname === item.path
                      ? 'bg-white/20 font-medium'
                      : 'hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User + logout */}
          <div className="flex items-center gap-3 shrink-0">
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
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center gap-1 ${
                  isActive ? 'text-orange-500' : 'text-gray-500'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
