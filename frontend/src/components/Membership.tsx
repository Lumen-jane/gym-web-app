import React, { useState, useEffect } from 'react';
import { Crown, Calendar, CreditCard, Gift, Star, CheckCircle, Clock, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Membership: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const membershipBenefits = {
    basic: [
      'Access to gym equipment',
      'Basic workout plans',
      'Mobile app access',
      'Progress tracking',
      'Community support'
    ],
    premium: [
      'Everything in Basic',
      'Unlimited group classes',
      'Personal trainer sessions (2/month)',
      'Nutrition planning',
      'Priority booking',
      'Guest passes (2/month)'
    ],
    vip: [
      'Everything in Premium',
      'Unlimited personal training',
      'Custom meal plans',
      '24/7 gym access',
      'Exclusive member events',
      'Spa services discount',
      'Unlimited guest passes'
    ]
  };

  const membershipStats = {
    basic: { members: 2847, satisfaction: 4.2 },
    premium: { members: 1523, satisfaction: 4.7 },
    vip: { members: 342, satisfaction: 4.9 }
  };

  const upcomingPerks = [
    {
      title: 'Free Personal Training Session',
      description: 'Complimentary 1-hour session with our expert trainers',
      date: '2025-02-15',
      type: 'training'
    },
    {
      title: 'Nutrition Workshop',
      description: 'Learn meal planning and healthy cooking techniques',
      date: '2025-02-20',
      type: 'workshop'
    },
    {
      title: 'Member Appreciation Event',
      description: 'Exclusive networking event with refreshments',
      date: '2025-03-01',
      type: 'event'
    }
  ];

  const membershipHistory = [
    {
      date: '2024-01-15',
      action: 'Membership Started',
      plan: 'Premium',
      amount: '$59.00'
    },
    {
      date: '2024-02-15',
      action: 'Monthly Payment',
      plan: 'Premium',
      amount: '$59.00'
    },
    {
      date: '2024-03-15',
      action: 'Monthly Payment',
      plan: 'Premium',
      amount: '$59.00'
    }
  ];

  const getMembershipColor = (type: string) => {
    switch (type) {
      case 'basic': return 'from-gray-400 to-gray-600';
      case 'premium': return 'from-blue-500 to-purple-500';
      case 'vip': return 'from-yellow-400 to-orange-500';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getMembershipIcon = (type: string) => {
    switch (type) {
      case 'vip': return Crown;
      case 'premium': return Star;
      default: return Users;
    }
  };

  const daysUntilRenewal = Math.ceil(
    (new Date(user?.membership_end_date || '').getTime() - new Date().getTime()) / (1000 * 3600 * 24)
  );

  return (
    <div className="p-6 ml-64 min-h-screen bg-gray-50">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Membership Dashboard</h1>
        <p className="text-gray-600">Manage your membership, track benefits, and explore upgrade options.</p>
      </div>

      {/* Current Membership Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`bg-gradient-to-r ${getMembershipColor(user?.membership_type || 'basic')} p-4 rounded-2xl`}>
              {(() => {
                const Icon = getMembershipIcon(user?.membership_type || 'basic');
                return <Icon className="h-8 w-8 text-white" />;
              })()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 capitalize">
                {user?.membership_type} Member
              </h2>
              <p className="text-gray-600">
                Active since {new Date(user?.created_at || '').toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600">
                Renews in {daysUntilRenewal} days
              </span>
            </div>
            <button className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-2 rounded-lg font-medium hover:from-green-600 hover:to-blue-600 transition-all">
              Upgrade Plan
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="border-b border-gray-100">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: Users },
              { id: 'benefits', label: 'Benefits', icon: Gift },
              { id: 'billing', label: 'Billing', icon: CreditCard },
              { id: 'perks', label: 'Upcoming Perks', icon: Star }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Membership Statistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(membershipStats).map(([plan, stats]) => (
                    <div key={plan} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-800 capitalize">{plan}</h4>
                        <div className={`bg-gradient-to-r ${getMembershipColor(plan)} p-2 rounded-lg`}>
                          {(() => {
                            const Icon = getMembershipIcon(plan);
                            return <Icon className="h-4 w-4 text-white" />;
                          })()}
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-gray-800">{stats.members.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Active members</p>
                      <div className="flex items-center mt-2">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">{stats.satisfaction}/5.0 satisfaction</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white p-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all">
                    Upgrade Membership
                  </button>
                  <button className="w-full bg-gray-100 text-gray-700 p-3 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                    Download Invoice
                  </button>
                  <button className="w-full bg-gray-100 text-gray-700 p-3 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                    Refer a Friend
                  </button>
                  <button className="w-full bg-gray-100 text-gray-700 p-3 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                    Contact Support
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'benefits' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Your Current Benefits</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.entries(membershipBenefits).map(([plan, benefits]) => (
                  <div key={plan} className={`rounded-xl p-6 ${plan === user?.membership_type ? 'ring-2 ring-blue-500 bg-blue-50' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xl font-bold text-gray-800 capitalize">{plan}</h4>
                      {plan === user?.membership_type && (
                        <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                          Current
                        </span>
                      )}
                    </div>
                    <ul className="space-y-3">
                      {benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <CheckCircle className={`h-5 w-5 mt-0.5 flex-shrink-0 ${plan === user?.membership_type ? 'text-blue-500' : 'text-gray-400'}`} />
                          <span className={`text-sm ${plan === user?.membership_type ? 'text-gray-800' : 'text-gray-600'}`}>
                            {benefit}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Billing History</h3>
              <div className="bg-gray-50 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Plan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {membershipHistory.map((transaction, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(transaction.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {transaction.action}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            {transaction.plan}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {transaction.amount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'perks' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Upcoming Member Perks</h3>
              <div className="space-y-4">
                {upcomingPerks.map((perk, index) => (
                  <div key={index} className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-100">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-800 mb-2">{perk.title}</h4>
                        <p className="text-gray-600 mb-3">{perk.description}</p>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Clock className="h-4 w-4" />
                          <span>{new Date(perk.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all">
                        Learn More
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};