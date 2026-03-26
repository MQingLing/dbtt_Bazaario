import { useState } from 'react';
import CustomerNav from './CustomerNav';
import { User } from '../../App';
import { Card, CardContent } from '../shared/card';
import { Badge } from '../shared/badge';
import { Button } from '../shared/button';
import { Gift, Star, Trophy, Sparkles, CheckCircle2, Lock } from 'lucide-react';
import { updateUser } from '../../services/authStore';
import { getRedeemedRewards, addRedeemedReward, RedeemedReward } from '../../services/dataStore';

interface LoyaltyRewardsProps {
  user: User;
  onLogout: () => void;
  onUserUpdate: (updatedUser: User) => void;
}

interface Reward {
  id: string;
  name: string;
  description: string;
  stampsRequired: number;
  icon: typeof Gift;
  color: 'orange' | 'pink' | 'purple' | 'yellow';
}

const REWARDS: Reward[] = [
  { id: '1', name: '$5 Voucher',    description: 'Redeem for any purchase',  stampsRequired: 10, icon: Gift,   color: 'orange' },
  { id: '2', name: '$10 Voucher',   description: 'Use at any vendor',        stampsRequired: 20, icon: Star,   color: 'pink'   },
  { id: '3', name: 'Free Drink',    description: 'Any drink up to $5',       stampsRequired: 15, icon: Gift,   color: 'purple' },
  { id: '4', name: 'Premium Badge', description: 'Exclusive member status',  stampsRequired: 50, icon: Trophy, color: 'yellow' },
];

const COLOR_CLASSES: Record<string, string> = {
  orange: 'from-orange-500 to-orange-600',
  pink:   'from-pink-500 to-pink-600',
  purple: 'from-purple-500 to-purple-600',
  yellow: 'from-yellow-500 to-yellow-600',
};

export default function LoyaltyRewards({ user, onLogout, onUserUpdate }: LoyaltyRewardsProps) {
  const currentStamps  = user.loyaltyStamps ?? 0;
  const nextMilestone  = 10; // stamps per card
  const progress       = Math.min((currentStamps % nextMilestone) / nextMilestone * 100, 100);
  const redeemableNow  = REWARDS.filter(r => currentStamps >= r.stampsRequired).length;

  const [redeemedId,  setRedeemedId]  = useState<string | null>(null);
  const [redeemError, setRedeemError] = useState<string | null>(null);
  const [history,     setHistory]     = useState<RedeemedReward[]>(() => getRedeemedRewards(user.id));

  const handleRedeem = (reward: Reward) => {
    if (currentStamps < reward.stampsRequired) {
      setRedeemError(`You need ${reward.stampsRequired - currentStamps} more stamp${reward.stampsRequired - currentStamps !== 1 ? 's' : ''}`);
      setTimeout(() => setRedeemError(null), 2500);
      return;
    }

    const newStamps = currentStamps - reward.stampsRequired;
    const stored = updateUser(user.id, { loyaltyStamps: newStamps });
    if (stored) onUserUpdate({ ...user, loyaltyStamps: stored.loyaltyStamps });

    addRedeemedReward(user.id, { rewardId: reward.id, rewardName: reward.name, stampsSpent: reward.stampsRequired });
    setHistory(getRedeemedRewards(user.id));
    setRedeemedId(reward.id);
    setTimeout(() => setRedeemedId(null), 2500);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <CustomerNav user={user} onLogout={onLogout} />

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Loyalty Rewards</h1>
          <p className="text-gray-600">Earn 1 stamp for every $5 spent and unlock rewards</p>
        </div>

        {/* Progress Card */}
        <Card className="mb-6 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white border-0 overflow-hidden">
          <CardContent className="p-6 md:p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-6 h-6" />
                  <p className="text-white/90">Your Progress</p>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-2">
                  {currentStamps} {currentStamps === 1 ? 'Stamp' : 'Stamps'}
                </h2>
                <p className="text-white/90">
                  {currentStamps === 0
                    ? 'Make a purchase to earn your first stamp!'
                    : redeemableNow > 0
                    ? `You can redeem ${redeemableNow} reward${redeemableNow !== 1 ? 's' : ''} now!`
                    : `${nextMilestone - (currentStamps % nextMilestone)} more stamps to your next reward`}
                </p>
              </div>
              <Gift className="w-16 h-16 text-white/20" />
            </div>

            {/* Custom progress bar — avoids bg-primary rendering issue */}
            <div className="space-y-2">
              <div className="h-4 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-sm text-white/90">
                <span>0</span>
                <span>Next reward at {nextMilestone * (Math.floor(currentStamps / nextMilestone) + 1)}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/20">
              <div>
                <p className="text-white/80 text-sm mb-1">Total Stamps</p>
                <p className="text-2xl font-bold">{currentStamps}</p>
              </div>
              <div>
                <p className="text-white/80 text-sm mb-1">Redeemable Now</p>
                <p className="text-2xl font-bold">{redeemableNow}</p>
              </div>
              <div>
                <p className="text-white/80 text-sm mb-1">Times Redeemed</p>
                <p className="text-2xl font-bold">{history.length}</p>
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
          {/* Rewards + History */}
          <div className="lg:col-span-2 space-y-6">
            {/* Rewards Catalogue */}
            <div>
              <h3 className="text-xl font-bold mb-4">Rewards Catalogue</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {REWARDS.map((reward) => {
                  const IconComponent = reward.icon;
                  const unlocked = currentStamps >= reward.stampsRequired;

                  return (
                    <Card key={reward.id} className={`overflow-hidden transition-opacity ${!unlocked ? 'opacity-60' : ''}`}>
                      <div className={`bg-gradient-to-r ${COLOR_CLASSES[reward.color]} p-4 text-white`}>
                        <div className="flex items-start justify-between">
                          <IconComponent className="w-8 h-8" />
                          {unlocked ? (
                            <Badge variant="secondary" className="bg-white text-gray-900">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Unlocked
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-white/20 text-white">
                              <Lock className="w-3 h-3 mr-1" />
                              {currentStamps}/{reward.stampsRequired}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h4 className="font-bold text-lg mb-1">{reward.name}</h4>
                        <p className="text-sm text-gray-600 mb-4">{reward.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                            <span>{reward.stampsRequired} stamps</span>
                          </div>
                          {redeemedId === reward.id ? (
                            <span className="text-sm font-medium text-green-600">✓ Redeemed!</span>
                          ) : (
                            <Button
                              size="sm"
                              disabled={!unlocked}
                              onClick={() => handleRedeem(reward)}
                              className={unlocked
                                ? 'bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600'
                                : ''}
                            >
                              {unlocked ? 'Redeem' : `Need ${reward.stampsRequired - currentStamps} more`}
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Stamp Card */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold mb-4">Stamp Card (current set of {nextMilestone})</h3>
                <div className="grid grid-cols-5 gap-3 mb-4">
                  {[...Array(nextMilestone)].map((_, i) => {
                    const filled = i < (currentStamps % nextMilestone);
                    return (
                      <div
                        key={i}
                        className={`aspect-square rounded-lg flex items-center justify-center border-2 ${
                          filled
                            ? 'border-orange-500 bg-gradient-to-br from-orange-500 to-pink-500'
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <Star className={`w-6 h-6 ${filled ? 'text-white fill-white' : 'text-gray-300'}`} />
                      </div>
                    );
                  })}
                </div>
                <p className="text-sm text-gray-600 text-center">
                  {currentStamps === 0
                    ? 'No stamps yet — shop at a pasar malam stall to earn your first!'
                    : currentStamps % nextMilestone === 0
                    ? 'Card complete — redeem a reward!'
                    : `${nextMilestone - (currentStamps % nextMilestone)} more to complete this card`}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Redemption History */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">Redemption History</h3>
                {history.length === 0 ? (
                  <div className="text-center py-6 text-gray-400">
                    <Gift className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No rewards redeemed yet</p>
                    <p className="text-xs mt-1">Collect stamps to unlock rewards!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {history.map((entry, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
                            <Gift className="w-4 h-4 text-orange-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{entry.rewardName}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(entry.redeemedAt).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-orange-600 text-sm font-medium shrink-0">
                          <Star className="w-3.5 h-3.5 fill-orange-400 text-orange-400" />
                          -{entry.stampsSpent}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold mb-4">How It Works</h3>
                <div className="space-y-3 text-sm">
                  {[
                    { num: 1, color: 'bg-orange-500', text: 'Make a purchase using your wallet QR code' },
                    { num: 2, color: 'bg-pink-500',   text: 'Earn 1 stamp for every $5 spent automatically' },
                    { num: 3, color: 'bg-purple-500', text: 'Collect stamps and redeem amazing rewards' },
                  ].map(({ num, color, text }) => (
                    <div key={num} className="flex items-start gap-3">
                      <div className={`w-6 h-6 rounded-full ${color} text-white flex items-center justify-center flex-shrink-0 font-bold text-xs`}>{num}</div>
                      <p className="text-gray-700">{text}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold mb-4">Upcoming Rewards</h3>
                <div className="space-y-3">
                  {REWARDS.sort((a, b) => a.stampsRequired - b.stampsRequired).map((r) => (
                    <div key={r.id} className="flex items-center justify-between text-sm">
                      <span className={currentStamps >= r.stampsRequired ? 'text-green-600 font-medium' : 'text-gray-600'}>{r.name}</span>
                      <span className="text-gray-500">{r.stampsRequired} stamps</span>
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
                  <li>• 1 stamp per $5 spent at checkout</li>
                  <li>• Earn double stamps during special events</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
