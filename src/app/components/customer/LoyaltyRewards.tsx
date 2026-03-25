import { useState } from 'react';
import CustomerNav from './CustomerNav';
import { User } from '../../App';
import { Card, CardContent } from '../shared/card';
import { Badge } from '../shared/badge';
import { Button } from '../shared/button';
import { Progress } from '../shared/progress';
import { Gift, Star, Trophy, Sparkles, CheckCircle2, Lock } from 'lucide-react';

interface LoyaltyRewardsProps {
  user: User;
  onLogout: () => void;
}

export default function LoyaltyRewards({ user, onLogout }: LoyaltyRewardsProps) {
  const currentStamps = user.loyaltyStamps || 0;
  const requiredStamps = 10;
  const progress = (currentStamps / requiredStamps) * 100;

  const rewards = [
    {
      id: '1',
      name: '$5 Voucher',
      description: 'Redeem for any purchase',
      stampsRequired: 10,
      icon: Gift,
      color: 'orange',
      available: currentStamps >= 10
    },
    {
      id: '2',
      name: '$10 Voucher',
      description: 'Use at any vendor',
      stampsRequired: 20,
      icon: Star,
      color: 'pink',
      available: false
    },
    {
      id: '3',
      name: 'Free Drink',
      description: 'Any drink up to $5',
      stampsRequired: 15,
      icon: Gift,
      color: 'purple',
      available: false
    },
    {
      id: '4',
      name: 'Premium Badge',
      description: 'Exclusive member status',
      stampsRequired: 50,
      icon: Trophy,
      color: 'yellow',
      available: false
    }
  ];

  const recentActivity = [
    { vendor: "Wong's Satay", stamps: 1, date: 'Mar 5, 2026' },
    { vendor: 'Bubble Tea Paradise', stamps: 1, date: 'Mar 4, 2026' },
    { vendor: 'Golden Snacks', stamps: 1, date: 'Mar 4, 2026' },
    { vendor: 'Artisan Crafts', stamps: 2, date: 'Mar 3, 2026' },
    { vendor: 'Spice Junction', stamps: 1, date: 'Mar 2, 2026' },
  ];

  const [redeemedId, setRedeemedId] = useState<string | null>(null);

  const handleRedeem = (rewardId: string) => {
    setRedeemedId(rewardId);
    setTimeout(() => setRedeemedId(null), 2500);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <CustomerNav user={user} onLogout={onLogout} />

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Loyalty Rewards</h1>
          <p className="text-gray-600">Earn stamps with every purchase and unlock amazing rewards</p>
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
                  {currentStamps} / {requiredStamps} Stamps
                </h2>
                <p className="text-white/90">{requiredStamps - currentStamps} more stamps to your next reward!</p>
              </div>
              <Gift className="w-16 h-16 text-white/20" />
            </div>

            <div className="space-y-2">
              <Progress value={progress} className="h-4 bg-white/20" />
              <div className="flex justify-between text-sm text-white/90">
                <span>Started: 0</span>
                <span>Next Reward: 10</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/20">
              <div>
                <p className="text-white/80 text-sm mb-1">Total Earned</p>
                <p className="text-2xl font-bold">{currentStamps}</p>
              </div>
              <div>
                <p className="text-white/80 text-sm mb-1">Redeemed</p>
                <p className="text-2xl font-bold">2</p>
              </div>
              <div>
                <p className="text-white/80 text-sm mb-1">This Month</p>
                <p className="text-2xl font-bold">{currentStamps}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Available Rewards */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h3 className="text-xl font-bold mb-4">Available Rewards</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {rewards.map((reward) => {
                  const IconComponent = reward.icon;
                  const colorClasses = {
                    orange: 'from-orange-500 to-orange-600',
                    pink: 'from-pink-500 to-pink-600',
                    purple: 'from-purple-500 to-purple-600',
                    yellow: 'from-yellow-500 to-yellow-600'
                  };

                  return (
                    <Card key={reward.id} className={`overflow-hidden ${!reward.available && 'opacity-60'}`}>
                      <div className={`bg-gradient-to-r ${colorClasses[reward.color as keyof typeof colorClasses]} p-4 text-white`}>
                        <div className="flex items-start justify-between">
                          <IconComponent className="w-8 h-8" />
                          {reward.available ? (
                            <Badge variant="secondary" className="bg-white text-gray-900">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Available
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-white/20 text-white">
                              <Lock className="w-3 h-3 mr-1" />
                              Locked
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
                          {reward.available ? (
                            redeemedId === reward.id ? (
                              <span className="text-sm font-medium text-green-600">✓ Redeemed!</span>
                            ) : (
                            <Button
                              size="sm"
                              onClick={() => handleRedeem(reward.id)}
                              className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
                            >
                              Redeem
                            </Button>
                            )
                          ) : (
                            <Button size="sm" variant="outline" disabled>
                              {currentStamps}/{reward.stampsRequired}
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Stamp Collection Visual */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold mb-4">Your Stamp Collection</h3>
                <div className="grid grid-cols-5 gap-3 mb-4">
                  {[...Array(10)].map((_, index) => (
                    <div
                      key={index}
                      className={`aspect-square rounded-lg flex items-center justify-center border-2 ${
                        index < currentStamps
                          ? 'border-orange-500 bg-gradient-to-br from-orange-500 to-pink-500'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      {index < currentStamps ? (
                        <Star className="w-6 h-6 text-white fill-white" />
                      ) : (
                        <Star className="w-6 h-6 text-gray-300" />
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-600 text-center">
                  Collect {requiredStamps - currentStamps} more stamps for your next reward!
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* How It Works */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold mb-4">How It Works</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center flex-shrink-0 font-bold">
                      1
                    </div>
                    <p className="text-gray-700">Make a purchase using your wallet QR code</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-pink-500 text-white flex items-center justify-center flex-shrink-0 font-bold">
                      2
                    </div>
                    <p className="text-gray-700">Earn stamps automatically with each transaction</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center flex-shrink-0 font-bold">
                      3
                    </div>
                    <p className="text-gray-700">Collect stamps and redeem amazing rewards</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold mb-4">Recent Stamps</h3>
                <div className="space-y-3">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium text-gray-900">{activity.vendor}</p>
                        <p className="text-gray-500 text-xs">{activity.date}</p>
                      </div>
                      <div className="flex items-center gap-1 text-orange-600 font-bold">
                        <Star className="w-4 h-4 fill-orange-500" />
                        <span>+{activity.stamps}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="bg-gradient-to-br from-orange-50 to-pink-50 border-orange-200">
              <CardContent className="p-6">
                <h4 className="font-bold mb-2">💡 Pro Tips</h4>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• Stamps never expire!</li>
                  <li>• Earn double stamps during special events</li>
                  <li>• Some vendors offer bonus stamps</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
