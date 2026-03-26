import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Home, Calendar, Wallet, Gift, LogOut, User as UserIcon, ChevronDown } from 'lucide-react';
import { User as UserType } from '../../App';

interface CustomerNavProps {
  user: UserType;
  onLogout: () => void;
}

export default function CustomerNav({ user, onLogout }: CustomerNavProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

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
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(v => !v)}
                className="flex items-center gap-2 hover:bg-white/10 rounded-lg px-2 py-1 transition-colors"
              >
                <div className="w-8 h-8 rounded-full ring-2 ring-white/50 overflow-hidden shrink-0 bg-white flex items-center justify-center">
                  {user.profilePic
                    ? <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover" />
                    : <span className="text-xs font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">{initials}</span>
                  }
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold leading-tight max-w-[120px] truncate">{user.name}</div>
                  <div className="text-xs text-white/70 leading-tight">${user.walletBalance?.toFixed(2)}</div>
                </div>
                <ChevronDown className="w-4 h-4 text-white/80" />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                  <button
                    onClick={() => { setDropdownOpen(false); navigate('/customer/profile'); }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <UserIcon className="w-4 h-4 text-orange-500" />View Profile
                  </button>
                  <hr className="my-1 border-gray-100" />
                  <button
                    onClick={() => { setDropdownOpen(false); onLogout(); }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" />Logout
                  </button>
                </div>
              )}
            </div>
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
          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="text-sm font-medium">{user.name}</div>
              <div className="text-xs text-white/80">${user.walletBalance?.toFixed(2)}</div>
            </div>
            <div className="w-8 h-8 rounded-full ring-2 ring-white/50 overflow-hidden shrink-0 bg-white flex items-center justify-center">
              {user.profilePic
                ? <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover" />
                : <span className="text-xs font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">{initials}</span>
              }
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
