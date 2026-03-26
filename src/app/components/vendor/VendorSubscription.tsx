import { useState } from 'react';
import VendorNav from './VendorNav';
import { User } from '../../App';
import { Card, CardContent } from '../shared/card';
import { Badge } from '../shared/badge';
import { Button } from '../shared/button';
import { CheckCircle2, Lock, Zap, TrendingUp, Crown, Building2, Star } from 'lucide-react';
import { updateUser, VendorTier } from '../../services/authStore';

interface VendorSubscriptionProps {
  user: User;
  onLogout: () => void;
  onUserUpdate: (updatedUser: User) => void;
}

interface TierConfig {
  id: VendorTier;
  name: string;
  price: string;
  priceNote: string;
  icon: typeof Zap;
  color: string;
  gradient: string;
  badge: string;
  description: string;
  features: string[];
  lockedFeatures: string[];
}

const TIERS: TierConfig[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 'Free',
    priceNote: 'Forever',
    icon: Star,
    color: 'text-gray-600',
    gradient: 'from-gray-400 to-gray-500',
    badge: 'bg-gray-100 text-gray-700',
    description: 'Everything you need to get listed and start selling.',
    features: [
      'Digital storefront & menu listing',
      'Map pin & QR profile',
      'Up to 20 products',
      'Basic order management',
      'Event applications',
      'Customer reviews visible',
    ],
    lockedFeatures: [
      'Sales analytics & summaries',
      'Inventory management',
      'Promoted placement',
      'Pre-order management',
      'Staff sub-accounts',
      'Multi-outlet dashboard',
    ],
  },
  {
    id: 'growth',
    name: 'Growth',
    price: '$20',
    priceNote: '/ month',
    icon: TrendingUp,
    color: 'text-blue-600',
    gradient: 'from-blue-500 to-cyan-500',
    badge: 'bg-blue-100 text-blue-700',
    description: 'Grow faster with analytics, ads, and inventory tools.',
    features: [
      'Everything in Starter',
      'Sales performance summaries',
      'Inventory management & alerts',
      'Ads promotion placement',
      'Unlimited products',
      'Priority application review',
    ],
    lockedFeatures: [
      'Pre-order handling',
      'Staff sub-accounts',
      'Advanced prediction analytics',
      'Multi-outlet reporting',
      'Priority support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$99–$249',
    priceNote: '/ month',
    icon: Zap,
    color: 'text-orange-600',
    gradient: 'from-orange-500 to-pink-500',
    badge: 'bg-orange-100 text-orange-700',
    description: 'Full operational power for high-volume vendors.',
    features: [
      'Everything in Growth',
      'Pre-order & queue management',
      'Multiple staff sub-accounts',
      'Advanced prediction analytics',
      'Featured storefront placement',
      'Cross-vendor bundle campaigns',
    ],
    lockedFeatures: [
      'Multi-outlet reporting',
      'Dedicated account manager',
      'Custom SLA support',
    ],
  },
  {
    id: 'anchor',
    name: 'Anchor',
    price: '$300–$1,500+',
    priceNote: '/ month',
    icon: Crown,
    color: 'text-purple-600',
    gradient: 'from-purple-500 to-indigo-600',
    badge: 'bg-purple-100 text-purple-700',
    description: 'Enterprise-grade for multi-outlet anchor tenants.',
    features: [
      'Everything in Pro',
      'Multi-outlet reporting dashboard',
      'Dedicated account manager',
      'Custom SLA & priority support',
      'Payout reconciliation reports',
      'Compliance evidence packs',
    ],
    lockedFeatures: [],
  },
];

const TIER_ORDER: VendorTier[] = ['starter', 'growth', 'pro', 'anchor'];

export default function VendorSubscription({ user, onLogout, onUserUpdate }: VendorSubscriptionProps) {
  const currentTier = user.vendorTier ?? 'starter';
  const [upgrading, setUpgrading] = useState<VendorTier | null>(null);
  const [successTier, setSuccessTier] = useState<VendorTier | null>(null);

  const currentTierIndex = TIER_ORDER.indexOf(currentTier);

  const handleUpgrade = (tier: VendorTier) => {
    setUpgrading(tier);
    // Simulate payment processing delay
    setTimeout(() => {
      const stored = updateUser(user.id, { vendorTier: tier });
      if (stored) onUserUpdate({ ...user, vendorTier: stored.vendorTier });
      setSuccessTier(tier);
      setUpgrading(null);
      setTimeout(() => setSuccessTier(null), 4000);
    }, 1200);
  };

  const activeTier = user.vendorTier ?? 'starter';

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <VendorNav user={user} onLogout={onLogout} />

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscription Plans</h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            Choose the plan that fits your business. Upgrade or downgrade anytime.
          </p>

          {/* Current plan banner */}
          {successTier ? (
            <div className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-green-50 border border-green-200 rounded-full text-green-700 font-medium">
              <CheckCircle2 className="w-5 h-5" />
              Upgraded to {TIERS.find(t => t.id === successTier)?.name}! Changes are live.
            </div>
          ) : (
            <div className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-full text-gray-700 shadow-sm">
              <span className="text-sm text-gray-500">Current plan:</span>
              <Badge className={TIERS.find(t => t.id === currentTier)?.badge ?? ''}>
                {TIERS.find(t => t.id === currentTier)?.name}
              </Badge>
            </div>
          )}
        </div>

        {/* Tier cards */}
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
          {TIERS.map((tier) => {
            const Icon = tier.icon;
            const isCurrent = activeTier === tier.id;
            const tierIndex = TIER_ORDER.indexOf(tier.id);
            const isDowngrade = tierIndex < currentTierIndex;
            const isUpgrade = tierIndex > currentTierIndex;

            return (
              <Card
                key={tier.id}
                className={`relative overflow-hidden flex flex-col transition-shadow hover:shadow-lg ${
                  isCurrent ? 'ring-2 ring-orange-500 shadow-md' : ''
                }`}
              >
                {isCurrent && (
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-orange-500 text-white text-xs">Current</Badge>
                  </div>
                )}
                {tier.id === 'pro' && !isCurrent && (
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-pink-500 text-white text-xs">Popular</Badge>
                  </div>
                )}

                {/* Header */}
                <div className={`bg-gradient-to-br ${tier.gradient} p-5 text-white`}>
                  <Icon className="w-8 h-8 mb-3" />
                  <h3 className="text-xl font-bold">{tier.name}</h3>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">{tier.price}</span>
                    <span className="text-white/80 text-sm ml-1">{tier.priceNote}</span>
                  </div>
                </div>

                <CardContent className="p-5 flex flex-col flex-1">
                  <p className="text-sm text-gray-600 mb-4">{tier.description}</p>

                  {/* Included features */}
                  <ul className="space-y-2 mb-4 flex-1">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-gray-700">{f}</span>
                      </li>
                    ))}
                    {tier.lockedFeatures.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm opacity-40">
                        <Lock className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                        <span className="text-gray-500">{f}</span>
                      </li>
                    ))}
                  </ul>

                  {isCurrent ? (
                    <Button variant="outline" disabled className="w-full">
                      <CheckCircle2 className="w-4 h-4 mr-2 text-orange-500" />
                      Active Plan
                    </Button>
                  ) : isUpgrade ? (
                    <Button
                      className={`w-full bg-gradient-to-r ${tier.gradient} text-white hover:opacity-90`}
                      onClick={() => handleUpgrade(tier.id)}
                      disabled={upgrading !== null}
                    >
                      {upgrading === tier.id ? 'Processing…' : `Upgrade to ${tier.name}`}
                    </Button>
                  ) : isDowngrade ? (
                    <Button
                      variant="outline"
                      className="w-full text-gray-500"
                      onClick={() => handleUpgrade(tier.id)}
                      disabled={upgrading !== null}
                    >
                      {upgrading === tier.id ? 'Processing…' : `Downgrade to ${tier.name}`}
                    </Button>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Feature comparison table */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-6">Full Feature Comparison</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 pr-4 font-semibold text-gray-700 w-1/3">Feature</th>
                    {TIERS.map(t => (
                      <th key={t.id} className={`text-center py-3 px-2 font-semibold ${activeTier === t.id ? 'text-orange-600' : 'text-gray-600'}`}>
                        {t.name}
                        {activeTier === t.id && <span className="block text-xs text-orange-400 font-normal">current</span>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    { label: 'Storefront & Menu',          tiers: ['starter','growth','pro','anchor'] },
                    { label: 'Map pin & QR profile',       tiers: ['starter','growth','pro','anchor'] },
                    { label: 'Event applications',         tiers: ['starter','growth','pro','anchor'] },
                    { label: 'Order management',           tiers: ['starter','growth','pro','anchor'] },
                    { label: 'Inventory management',       tiers: ['growth','pro','anchor'] },
                    { label: 'Sales summaries',            tiers: ['growth','pro','anchor'] },
                    { label: 'Ads & promotions',           tiers: ['growth','pro','anchor'] },
                    { label: 'Pre-order handling',         tiers: ['pro','anchor'] },
                    { label: 'Staff sub-accounts',         tiers: ['pro','anchor'] },
                    { label: 'Advanced analytics',         tiers: ['pro','anchor'] },
                    { label: 'Featured placement',         tiers: ['pro','anchor'] },
                    { label: 'Multi-outlet reporting',     tiers: ['anchor'] },
                    { label: 'Dedicated account manager',  tiers: ['anchor'] },
                    { label: 'Priority support SLA',       tiers: ['anchor'] },
                  ].map(({ label, tiers: includedTiers }) => (
                    <tr key={label} className="hover:bg-gray-50">
                      <td className="py-3 pr-4 text-gray-700">{label}</td>
                      {TIERS.map(t => (
                        <td key={t.id} className="text-center py-3 px-2">
                          {includedTiers.includes(t.id)
                            ? <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
                            : <span className="text-gray-200 text-xl leading-none">—</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Org revenue note */}
        <div className="mt-6 p-5 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-xl">
          <div className="flex items-start gap-3">
            <Building2 className="w-6 h-6 text-purple-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-purple-900 mb-1">Platform Transaction Fee</p>
              <p className="text-sm text-purple-700">
                A platform fee of <strong>0.5–3% GMV</strong> applies to all orders processed through Bazaario,
                in addition to your subscription. Anchor tenants receive volume-based rate negotiations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
