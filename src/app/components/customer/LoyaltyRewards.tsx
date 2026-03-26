import { useState } from 'react';
import CustomerNav from './CustomerNav';
import { User } from '../../App';
import { Card, CardContent } from '../shared/card';
import { Badge } from '../shared/badge';
import { Button } from '../shared/button';
import { Gift, Star, Sparkles, CheckCircle2, Ticket, Copy, CalendarCheck, Flame } from 'lucide-react';
import { updateUser } from '../../services/authStore';
import { VOUCHER_TIERS, addVoucher, getActiveVouchers, getVouchers, Voucher, canCheckInToday, doCheckIn, getCheckInRecord } from '../../services/dataStore';

interface LoyaltyRewardsProps {
  user: User;
  onLogout: () => void;
  onUserUpdate: (updatedUser: User) => void;
}

const TIER_COLORS = ['from-orange-500 to-orange-600', 'from-pink-500 to-pink-600', 'from-purple-500 to-purple-600', 'from-yellow-500 to-yellow-600'];

export default function LoyaltyRewards({ user, onLogout, onUserUpdate }: LoyaltyRewardsProps) {
  const currentStamps = user.loyaltyStamps ?? 0;

  const redeemableTiers = VOUCHER_TIERS.filter(t => currentStamps >= t.stampsRequired);
  const nextTier        = VOUCHER_TIERS.find(t => currentStamps < t.stampsRequired);
  const progressTarget  = nextTier?.stampsRequired ?? VOUCHER_TIERS[VOUCHER_TIERS.length - 1].stampsRequired;
  const progressPct     = Math.min((currentStamps / progressTarget) * 100, 100);

  const [activeVouchers,  setActiveVouchers]  = useState<Voucher[]>(() => getActiveVouchers(user.id));
  const [allVouchers,     setAllVouchers]     = useState<Voucher[]>(() => getVouchers(user.id));
  const [justEarned,      setJustEarned]      = useState<string | null>(null);
  const [redeemError,     setRedeemError]     = useState<string | null>(null);
  const [copiedId,        setCopiedId]        = useState<string | null>(null);
  const [checkInRecord,   setCheckInRecord]   = useState(() => getCheckInRecord(user.id));
  const [checkInDone,     setCheckInDone]     = useState(false);

  const eligible = canCheckInToday(user.id) && !checkInDone;

  const handleCheckIn = () => {
    if (!eligible) return;
    const record    = doCheckIn(user.id);
    const newStamps = (user.loyaltyStamps ?? 0) + 1;
    const stored    = updateUser(user.id, { loyaltyStamps: newStamps });
    if (stored) onUserUpdate({ ...user, loyaltyStamps: stored.loyaltyStamps });
    setCheckInRecord(record);
    setCheckInDone(true);
  };

  const refresh = () => {
    setActiveVouchers(getActiveVouchers(user.id));
    setAllVouchers(getVouchers(user.id));
  };

  const handleEarn = (tier: typeof VOUCHER_TIERS[number]) => {
    if (currentStamps < tier.stampsRequired) {
      setRedeemError(`You need ${tier.stampsRequired - currentStamps} more stamp${tier.stampsRequired - currentStamps !== 1 ? 's' : ''}`);
      setTimeout(() => setRedeemError(null), 2500);
      return;
    }
    const newStamps = currentStamps - tier.stampsRequired;
    const stored = updateUser(user.id, { loyaltyStamps: newStamps });
    if (stored) onUserUpdate({ ...user, loyaltyStamps: stored.loyaltyStamps });

    const v = addVoucher(user.id, tier);
    refresh();
    setJustEarned(v.id);
    setTimeout(() => setJustEarned(null), 3000);
  };

  const copyCode = (id: string) => {
    navigator.clipboard.writeText(id).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const usedVouchers = allVouchers.filter(v => v.usedAt);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <CustomerNav user={user} onLogout={onLogout} />

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Vouchers</h1>
          <p className="text-gray-600">Earn 1 stamp for every $5 spent and convert stamps into vouchers</p>
        </div>

        {/* Progress Card */}
        <Card className="mb-6 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white border-0 overflow-hidden">
          <CardContent className="p-6 md:p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-6 h-6" />
                  <p className="text-white/90">Your Stamps</p>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-2">
                  {currentStamps} {currentStamps === 1 ? 'Stamp' : 'Stamps'}
                </h2>
                <p className="text-white/90">
                  {redeemableTiers.length > 0
                    ? `${redeemableTiers.length} voucher${redeemableTiers.length !== 1 ? 's' : ''} available to earn!`
                    : nextTier
                    ? `${nextTier.stampsRequired - currentStamps} more stamps to unlock ${nextTier.name}`
                    : 'All voucher tiers unlocked!'}
                </p>
              </div>
              <Gift className="w-16 h-16 text-white/20" />
            </div>

            <div className="space-y-2">
              <div className="h-4 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
              </div>
              <div className="flex justify-between text-sm text-white/80">
                <span>{currentStamps} stamps</span>
                {nextTier && <span>Next: {nextTier.name} at {nextTier.stampsRequired} stamps</span>}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/20">
              <div>
                <p className="text-white/80 text-sm mb-1">Current Stamps</p>
                <p className="text-2xl font-bold">{currentStamps}</p>
              </div>
              <div>
                <p className="text-white/80 text-sm mb-1">Active Vouchers</p>
                <p className="text-2xl font-bold">{activeVouchers.length}</p>
              </div>
              <div>
                <p className="text-white/80 text-sm mb-1">Vouchers Used</p>
                <p className="text-2xl font-bold">{usedVouchers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Daily Check-in */}
        <Card className={`mb-6 overflow-hidden border-2 ${eligible ? 'border-orange-300' : 'border-gray-200'}`}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${eligible ? 'bg-gradient-to-br from-orange-400 to-pink-500' : 'bg-gray-100'}`}>
                  {eligible
                    ? <CalendarCheck className="w-5 h-5 text-white" />
                    : <CheckCircle2 className="w-5 h-5 text-green-500" />}
                </div>
                <div>
                  <p className="font-bold text-gray-900">
                    {eligible ? 'Daily Check-in' : 'Checked in today!'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {eligible
                      ? 'Tap to earn 1 stamp — come back every day!'
                      : `${checkInRecord.streak} day streak — come back tomorrow for another stamp`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {checkInRecord.streak > 1 && (
                  <div className="flex items-center gap-1 text-orange-500 font-bold text-sm">
                    <Flame className="w-4 h-4" />
                    {checkInRecord.streak}
                  </div>
                )}
                <Button
                  onClick={handleCheckIn}
                  disabled={!eligible}
                  size="sm"
                  className={eligible
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600'
                    : 'opacity-50 cursor-not-allowed'}
                >
                  {eligible ? '+1 Stamp' : 'Done'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {redeemError && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 font-medium">
            {redeemError}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">

            {/* Voucher Catalogue — only redeemable tiers */}
            <div>
              <h3 className="text-xl font-bold mb-1">Voucher Catalogue</h3>
              <p className="text-sm text-gray-500 mb-4">Only showing tiers you can redeem now</p>

              {redeemableTiers.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-gray-400">
                    <Ticket className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium text-gray-600">No vouchers available yet</p>
                    <p className="text-sm mt-1">
                      {nextTier
                        ? `Earn ${nextTier.stampsRequired - currentStamps} more stamp${nextTier.stampsRequired - currentStamps !== 1 ? 's' : ''} to unlock your first voucher`
                        : 'Make purchases with your Bazaario Wallet to earn stamps'}
                    </p>
                    <div className="mt-4 space-y-1 text-xs text-gray-400">
                      {VOUCHER_TIERS.map(t => (
                        <p key={t.stampsRequired}>{t.stampsRequired} stamps → {t.name}</p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {redeemableTiers.map((tier, idx) => (
                    <Card key={tier.stampsRequired} className="overflow-hidden">
                      <div className={`bg-gradient-to-r ${TIER_COLORS[idx % TIER_COLORS.length]} p-4 text-white`}>
                        <div className="flex items-start justify-between">
                          <Gift className="w-8 h-8" />
                          <Badge variant="secondary" className="bg-white text-gray-900">
                            <CheckCircle2 className="w-3 h-3 mr-1" />Unlocked
                          </Badge>
                        </div>
                        <p className="text-3xl font-bold mt-3">{tier.name}</p>
                      </div>
                      <CardContent className="p-4">
                        <p className="text-sm text-gray-600 mb-4">
                          Use at checkout or show your QR code at any stall
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                            <span>{tier.stampsRequired} stamps</span>
                          </div>
                          {justEarned && activeVouchers.find(v => v.id === justEarned && v.discount === tier.discount) ? (
                            <span className="text-sm font-medium text-green-600 flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4" />Voucher added!
                            </span>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleEarn(tier)}
                              className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
                            >
                              Get Voucher
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Active Vouchers */}
            {activeVouchers.length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-4">Active Vouchers</h3>
                <div className="space-y-3">
                  {activeVouchers.map(v => (
                    <Card key={v.id} className="border-orange-200 bg-orange-50">
                      <CardContent className="p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center shrink-0">
                            <Ticket className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{v.name}</p>
                            <p className="text-xs text-gray-500 font-mono">{v.id}</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              Earned {new Date(v.earnedAt).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge className="bg-orange-500 text-white text-sm px-3 py-1">${v.discount} off</Badge>
                          <button
                            onClick={() => copyCode(v.id)}
                            className="text-gray-400 hover:text-orange-600 transition-colors"
                            title="Copy voucher code"
                          >
                            {copiedId === v.id ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">Apply vouchers at checkout or show your QR code at a stall.</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Used vouchers history */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">Used Vouchers</h3>
                {usedVouchers.length === 0 ? (
                  <div className="text-center py-6 text-gray-400">
                    <Ticket className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No vouchers used yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {usedVouchers.map(v => (
                      <div key={v.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{v.name}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(v.usedAt!).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs text-gray-400">Used</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* How it works */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold mb-4">How It Works</h3>
                <div className="space-y-3 text-sm">
                  {[
                    { num: 1, color: 'bg-orange-500', text: 'Pay with Bazaario Wallet at checkout' },
                    { num: 2, color: 'bg-pink-500',   text: 'Earn 1 stamp for every $5 spent' },
                    { num: 3, color: 'bg-purple-500', text: 'Convert stamps into cash vouchers' },
                    { num: 4, color: 'bg-yellow-500', text: 'Apply vouchers at checkout or via QR code' },
                  ].map(({ num, color, text }) => (
                    <div key={num} className="flex items-start gap-3">
                      <div className={`w-6 h-6 rounded-full ${color} text-white flex items-center justify-center flex-shrink-0 font-bold text-xs`}>{num}</div>
                      <p className="text-gray-700">{text}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tier list */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold mb-4">Voucher Tiers</h3>
                <div className="space-y-2">
                  {VOUCHER_TIERS.map(t => (
                    <div key={t.stampsRequired} className="flex items-center justify-between text-sm">
                      <span className={currentStamps >= t.stampsRequired ? 'text-green-600 font-medium' : 'text-gray-500'}>
                        {t.name}
                      </span>
                      <div className="flex items-center gap-1 text-gray-400">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span>{t.stampsRequired} stamps</span>
                        {currentStamps >= t.stampsRequired && <CheckCircle2 className="w-3.5 h-3.5 text-green-500 ml-1" />}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-pink-50 border-orange-200">
              <CardContent className="p-6">
                <h4 className="font-bold mb-2">Tips</h4>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• Stamps never expire</li>
                  <li>• 1 stamp per $5 spent (wallet only)</li>
                  <li>• Vouchers can be stacked across orders</li>
                  <li>• Show your QR code to use a voucher at a stall</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
