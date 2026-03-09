import { Link, useLocation } from 'react-router';
import { Home, Calendar, Wallet, Gift, User, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { User as UserType } from '../App';

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
      <div className="hidden md:block bg-gradient-to-r from-orange-500 to-pink-500 text-white p-4 shadow-lg">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-bold">Pasar Malam</h1>
            <nav className="flex gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    location.pathname === item.path
                      ? 'bg-white/20 font-medium'
                      : 'hover:bg-white/10'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="font-medium">{user.name}</div>
              <div className="text-sm text-white/80">${user.walletBalance?.toFixed(2)}</div>
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
            className="flex flex-col items-center justify-center gap-1 text-gray-500"
          >
            <User className="w-5 h-5" />
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </div>

      {/* Mobile Top Bar */}
      <div className="md:hidden bg-gradient-to-r from-orange-500 to-pink-500 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Pasar Malam</h1>
          <div className="text-right">
            <div className="text-sm font-medium">{user.name}</div>
            <div className="text-xs text-white/80">${user.walletBalance?.toFixed(2)}</div>
          </div>
        </div>
      </div>
    </>
  );
}
