import { Link, useLocation } from 'react-router';
import { Home, Calendar, Wallet, Gift, LogOut } from 'lucide-react';
import { Button } from '../shared/button';
import { User as UserType } from '../../App';

interface CustomerNavProps {
  user: UserType;
  onLogout: () => void;
}

export default function CustomerNav({ user, onLogout }: CustomerNavProps) {
  const location = useLocation();

  const navItems = [
    { path: '/customer/home', icon: Home, label: 'Home' },
    { path: '/customer/events', icon: Calendar, label: 'Events' },
    { path: '/customer/wallet', icon: Wallet, label: 'Wallet' },
    { path: '/customer/loyalty', icon: Gift, label: 'Rewards' },
  ];

  return (
    <>
      {/* Top Bar - Desktop */}
      <div className="hidden md:block bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="shrink-0">
            <h1 className="text-xl font-bold leading-tight">Bazaario</h1>
          </div>
          <nav className="flex items-center gap-1 flex-1 min-w-0">
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
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <div className="text-sm font-semibold leading-tight max-w-[140px] truncate">{user.name}</div>
              <div className="text-xs text-white/70 leading-tight">${user.walletBalance?.toFixed(2)}</div>
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
        <div className="grid grid-cols-5 h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
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
          <button
            onClick={onLogout}
            className="flex flex-col items-center justify-center gap-1 text-gray-500 active:text-red-500"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-xs">Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Top Bar */}
      <div className="md:hidden bg-gradient-to-r from-orange-500 to-pink-500 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Bazaario</h1>
          <div className="text-right">
            <div className="text-sm font-medium">{user.name}</div>
            <div className="text-xs text-white/80">${user.walletBalance?.toFixed(2)}</div>
          </div>
        </div>
      </div>
    </>
  );
}
