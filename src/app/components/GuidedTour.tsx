import { useState, useEffect } from 'react';
import { Button } from './shared/button';
import { X, ChevronRight, ShoppingBag, Store, Shield } from 'lucide-react';

interface TourStep {
  title: string;
  description: string;
  emoji: string;
}

const TOURS: Record<'customer' | 'vendor' | 'admin', TourStep[]> = {
  customer: [
    { emoji: '🏠', title: 'Welcome to Bazaario!',       description: 'Discover Singapore\'s best night markets all in one place. Browse upcoming and ongoing pasar malam events near you.' },
    { emoji: '🗺️', title: 'Interactive Event Maps',      description: 'Tap any event to see its stall layout on an interactive map. Find exactly where your favourite vendors are located.' },
    { emoji: '🛒', title: 'Browse Vendor Stores',        description: 'Visit each vendor\'s digital storefront, browse their full menu, and check live availability before you arrive.' },
    { emoji: '⚡', title: 'Pre-Order & Skip the Queue',  description: 'Add items to your cart, choose a pickup time, and pay digitally. No more waiting in long queues!' },
    { emoji: '⭐', title: 'Earn Loyalty Stamps',         description: 'Collect stamps with every purchase. Redeem them for discounts at your favourite stalls. Check your Wallet anytime.' },
  ],
  vendor: [
    { emoji: '📊', title: 'Welcome, Vendor!',            description: 'Your dashboard gives you a real-time overview of today\'s orders, revenue, and your best-selling products.' },
    { emoji: '📦', title: 'Manage Incoming Orders',      description: 'Track orders as they come in — from Pending to Preparing to Ready. Update status with a single tap.' },
    { emoji: '🍢', title: 'Manage Your Menu',            description: 'Add, edit, or remove products from your stall menu. Toggle items as sold out when stock runs low.' },
    { emoji: '📈', title: 'View Sales Analytics',        description: 'See your hourly sales trends, top products, and revenue forecasts powered by our ML models.' },
    { emoji: '📋', title: 'Apply for Events',            description: 'Browse upcoming pasar malam events and submit applications. Track your application status in My Applications.' },
  ],
  admin: [
    { emoji: '🏛️', title: 'Welcome, Administrator!',     description: 'Your dashboard gives you a platform-wide overview — active events, vendor performance, revenue analytics, and ML insights.' },
    { emoji: '📅', title: 'Manage Events',               description: 'Create and manage pasar malam events. Configure stall layouts and assign vendors to specific locations.' },
    { emoji: '🏪', title: 'Manage Vendors',              description: 'Review vendor profiles, approve or suspend accounts, and monitor their performance across all events.' },
    { emoji: '📝', title: 'Review Applications',         description: 'Approve or reject vendor applications for events. Manage waitlists and communicate decisions to vendors.' },
    { emoji: '🔐', title: 'Manage Admins',               description: 'Add new administrator accounts. Generated passwords are shown once — admins must change them on first login.' },
  ],
};

const ROLE_ICONS = { customer: ShoppingBag, vendor: Store, admin: Shield };
const ROLE_COLORS = {
  customer: 'from-orange-500 to-pink-500',
  vendor:   'from-pink-500 to-purple-500',
  admin:    'from-purple-500 to-indigo-500',
};

const TOUR_KEY = (role: string) => `bazaario_tour_seen_${role}`;

interface GuidedTourProps {
  role: 'customer' | 'vendor' | 'admin';
  onDismiss: () => void;
}

export default function GuidedTour({ role, onDismiss }: GuidedTourProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (localStorage.getItem(TOUR_KEY(role))) {
      onDismiss();
    }
  }, [role, onDismiss]);

  const steps = TOURS[role];
  const current = steps[step];
  const isLast = step === steps.length - 1;
  const Icon = ROLE_ICONS[role];

  const dismiss = () => {
    localStorage.setItem(TOUR_KEY(role), '1');
    onDismiss();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Gradient header */}
        <div className={`bg-gradient-to-r ${ROLE_COLORS[role]} p-6 text-white relative`}>
          <button
            onClick={dismiss}
            className="absolute top-4 right-4 w-7 h-7 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
              <Icon className="w-3.5 h-3.5" />
            </div>
            <span className="text-sm font-medium capitalize opacity-90">{role} Tour</span>
          </div>

          <div className="text-5xl mb-3">{current.emoji}</div>
          <h2 className="text-xl font-bold leading-tight">{current.title}</h2>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-600 text-sm leading-relaxed mb-6">{current.description}</p>

          {/* Step dots */}
          <div className="flex items-center justify-center gap-1.5 mb-6">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`rounded-full transition-all ${
                  i === step
                    ? `w-6 h-2 bg-gradient-to-r ${ROLE_COLORS[role]}`
                    : 'w-2 h-2 bg-gray-200 hover:bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={dismiss}
              className="flex-1 text-gray-500"
            >
              Skip Tour
            </Button>
            {isLast ? (
              <Button
                onClick={dismiss}
                className={`flex-1 bg-gradient-to-r ${ROLE_COLORS[role]} text-white border-0 hover:opacity-90`}
              >
                Get Started!
              </Button>
            ) : (
              <Button
                onClick={() => setStep(step + 1)}
                className={`flex-1 bg-gradient-to-r ${ROLE_COLORS[role]} text-white border-0 hover:opacity-90 gap-1`}
              >
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>

          <p className="text-center text-xs text-gray-400 mt-3">
            Step {step + 1} of {steps.length}
          </p>
        </div>
      </div>
    </div>
  );
}
