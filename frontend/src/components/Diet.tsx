import React, { useState } from 'react';
import { Apple, Target, TrendingUp, Calendar, Plus, Clock, CheckCircle } from 'lucide-react';

export const Diet: React.FC = () => {
  const [activeTab, setActiveTab] = useState('plans');

  const dietPlans = [
    {
      id: 1,
      name: 'Muscle Building Plan',
      description: 'High protein diet designed to support muscle growth and recovery',
      duration: '4 weeks',
      calories: 2800,
      protein: 180,
      carbs: 280,
      fat: 93,
      difficulty: 'Intermediate',
      image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=300',
      active: true
    },
    {
      id: 2,
      name: 'Weight Loss Plan',
      description: 'Balanced calorie deficit plan for sustainable weight loss',
      duration: '6 weeks',
      calories: 1800,
      protein: 135,
      carbs: 180,
      fat: 60,
      difficulty: 'Beginner',
      image: 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=300',
      active: false
    },
    {
      id: 3,
      name: 'Athletic Performance',
      description: 'Optimized nutrition for peak athletic performance and endurance',
      duration: '8 weeks',
      calories: 3200,
      protein: 160,
      carbs: 400,
      fat: 107,
      difficulty: 'Advanced',
      image: 'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=300',
      active: false
    }
  ];

  const todaysMeals = [
    {
      id: 1,
      type: 'Breakfast',
      time: '7:00 AM',
      name: 'Protein Oatmeal Bowl',
      calories: 420,
      protein: 25,
      carbs: 45,
      fat: 12,
      completed: true,
      image: 'https://images.pexels.com/photos/704569/pexels-photo-704569.jpeg?auto=compress&cs=tinysrgb&w=150'
    },
    {
      id: 2,
      type: 'Lunch',
      time: '12:30 PM',
      name: 'Grilled Chicken Salad',
      calories: 380,
      protein: 35,
      carbs: 15,
      fat: 18,
      completed: true,
      image: 'https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg?auto=compress&cs=tinysrgb&w=150'
    },
    {
      id: 3,
      type: 'Snack',
      time: '3:30 PM',
      name: 'Greek Yogurt & Berries',
      calories: 180,
      protein: 15,
      carbs: 20,
      fat: 5,
      completed: false,
      image: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=150'
    },
    {
      id: 4,
      type: 'Dinner',
      time: '7:00 PM',
      name: 'Salmon with Sweet Potato',
      calories: 520,
      protein: 40,
      carbs: 35,
      fat: 22,
      completed: false,
      image: 'https://images.pexels.com/photos/725991/pexels-photo-725991.jpeg?auto=compress&cs=tinysrgb&w=150'
    }
  ];

  const nutritionProgress = {
    calories: { consumed: 1000, target: 2800 },
    protein: { consumed: 75, target: 180 },
    carbs: { consumed: 80, target: 280 },
    fat: { consumed: 35, target: 93 }
  };

  const weeklyProgress = [
    { day: 'Mon', weight: 175.2, calories: 2750 },
    { day: 'Tue', weight: 175.0, calories: 2820 },
    { day: 'Wed', weight: 174.8, calories: 2780 },
    { day: 'Thu', weight: 174.9, calories: 2850 },
    { day: 'Fri', weight: 174.6, calories: 2790 },
    { day: 'Sat', weight: 174.4, calories: 2900 },
    { day: 'Sun', weight: 174.2, calories: 2760 }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getProgressPercentage = (consumed: number, target: number) => {
    return Math.min((consumed / target) * 100, 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  return (
    <div className="p-6 ml-64 min-h-screen bg-gray-50">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Nutrition Center</h1>
        <p className="text-gray-600">Track your meals, monitor nutrition, and achieve your dietary goals</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="border-b border-gray-100">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'plans', label: 'Diet Plans' },
              { id: 'today', label: "Today's Meals" },
              { id: 'progress', label: 'Progress Tracking' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'plans' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dietPlans.map((plan) => (
                  <div key={plan.id} className={`bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-shadow ${plan.active ? 'ring-2 ring-blue-500' : ''}`}>
                    <div className="relative">
                      <img
                        src={plan.image}
                        alt={plan.name}
                        className="w-full h-48 object-cover"
                      />
                      {plan.active && (
                        <div className="absolute top-3 right-3 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                          Active
                        </div>
                      )}
                      <div className="absolute bottom-3 left-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(plan.difficulty)}`}>
                          {plan.difficulty}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">{plan.name}</h3>
                      <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div>
                          <p className="text-gray-600">Duration</p>
                          <p className="font-medium text-gray-800">{plan.duration}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Daily Calories</p>
                          <p className="font-medium text-gray-800">{plan.calories}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
                        <div className="text-center p-2 bg-blue-50 rounded">
                          <p className="text-blue-600 font-medium">{plan.protein}g</p>
                          <p className="text-gray-600">Protein</p>
                        </div>
                        <div className="text-center p-2 bg-green-50 rounded">
                          <p className="text-green-600 font-medium">{plan.carbs}g</p>
                          <p className="text-gray-600">Carbs</p>
                        </div>
                        <div className="text-center p-2 bg-yellow-50 rounded">
                          <p className="text-yellow-600 font-medium">{plan.fat}g</p>
                          <p className="text-gray-600">Fat</p>
                        </div>
                      </div>
                      
                      <button className={`w-full py-3 rounded-lg font-medium transition-all ${
                        plan.active 
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                          : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 transform hover:scale-105'
                      }`}>
                        {plan.active ? 'Currently Active' : 'Start Plan'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'today' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">Today's Meal Plan</h3>
                <div className="space-y-4">
                  {todaysMeals.map((meal) => (
                    <div key={meal.id} className={`bg-gray-50 rounded-lg p-6 flex items-center space-x-4 ${meal.completed ? 'opacity-75' : ''}`}>
                      <img
                        src={meal.image}
                        alt={meal.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-gray-800">{meal.name}</h4>
                            <p className="text-sm text-gray-600">{meal.type} • {meal.time}</p>
                          </div>
                          {meal.completed && (
                            <CheckCircle className="h-6 w-6 text-green-500" />
                          )}
                        </div>
                        
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Calories</p>
                            <p className="font-medium text-gray-800">{meal.calories}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Protein</p>
                            <p className="font-medium text-gray-800">{meal.protein}g</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Carbs</p>
                            <p className="font-medium text-gray-800">{meal.carbs}g</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Fat</p>
                            <p className="font-medium text-gray-800">{meal.fat}g</p>
                          </div>
                        </div>
                      </div>
                      
                      <button className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        meal.completed 
                          ? 'bg-gray-200 text-gray-600' 
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}>
                        {meal.completed ? 'Completed' : 'Mark Done'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-6">Daily Progress</h3>
                  <div className="space-y-4">
                    {Object.entries(nutritionProgress).map(([key, data]) => {
                      const percentage = getProgressPercentage(data.consumed, data.target);
                      return (
                        <div key={key}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700 capitalize">{key}</span>
                            <span className="text-sm text-gray-600">
                              {data.consumed}/{data.target}{key === 'calories' ? '' : 'g'}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${getProgressColor(percentage)}`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-lg font-medium hover:from-green-600 hover:to-blue-600 transition-all flex items-center justify-center space-x-2">
                      <Plus className="h-4 w-4" />
                      <span>Log Food</span>
                    </button>
                    <button className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                      View Recipes
                    </button>
                    <button className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                      Meal Planner
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'progress' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">Weekly Weight Progress</h3>
                <div className="space-y-3">
                  {weeklyProgress.map((day, index) => (
                    <div key={day.day} className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <span className="font-medium text-gray-800">{day.day}</span>
                      <div className="text-right">
                        <p className="font-medium text-gray-800">{day.weight} lbs</p>
                        <p className="text-sm text-gray-600">{day.calories} cal</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">Nutrition Summary</h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-4 bg-white rounded-lg">
                    <p className="text-2xl font-bold text-gray-800">-2.4</p>
                    <p className="text-sm text-gray-600">lbs this week</p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <p className="text-2xl font-bold text-gray-800">94%</p>
                    <p className="text-sm text-gray-600">goal adherence</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Average Daily Calories</span>
                    <span className="font-medium text-gray-800">2,807</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Protein Average</span>
                    <span className="font-medium text-gray-800">178g</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Hydration Goal</span>
                    <span className="font-medium text-green-600">✓ Met daily</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};