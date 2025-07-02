import React, { useState } from 'react';
import { Play, Clock, Target, TrendingUp, Calendar, CheckCircle, Star } from 'lucide-react';

export const Workout: React.FC = () => {
  const [activeTab, setActiveTab] = useState('browse');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Workouts' },
    { id: 'strength', name: 'Strength Training' },
    { id: 'cardio', name: 'Cardio' },
    { id: 'flexibility', name: 'Flexibility' },
    { id: 'hiit', name: 'HIIT' },
    { id: 'beginner', name: 'Beginner Friendly' }
  ];

  const workouts = [
    {
      id: 1,
      title: 'Upper Body Strength Builder',
      description: 'Build muscle and strength in your chest, shoulders, and arms',
      duration: 45,
      difficulty: 'Intermediate',
      category: 'strength',
      calories: 320,
      exercises: 8,
      rating: 4.8,
      image: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=300',
      completed: false
    },
    {
      id: 2,
      title: 'HIIT Fat Burner',
      description: 'High-intensity intervals to torch calories and boost metabolism',
      duration: 30,
      difficulty: 'Advanced',
      category: 'hiit',
      calories: 400,
      exercises: 6,
      rating: 4.9,
      image: 'https://images.pexels.com/photos/416778/pexels-photo-416778.jpeg?auto=compress&cs=tinysrgb&w=300',
      completed: true
    },
    {
      id: 3,
      title: 'Morning Yoga Flow',
      description: 'Gentle stretches and poses to start your day with mindfulness',
      duration: 25,
      difficulty: 'Beginner',
      category: 'flexibility',
      calories: 150,
      exercises: 12,
      rating: 4.7,
      image: 'https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&w=300',
      completed: false
    },
    {
      id: 4,
      title: 'Cardio Dance Party',
      description: 'Fun dance moves that get your heart pumping and spirits high',
      duration: 40,
      difficulty: 'All Levels',
      category: 'cardio',
      calories: 350,
      exercises: 10,
      rating: 4.6,
      image: 'https://images.pexels.com/photos/3775593/pexels-photo-3775593.jpeg?auto=compress&cs=tinysrgb&w=300',
      completed: false
    },
    {
      id: 5,
      title: 'Core Crusher',
      description: 'Target your abs and core with these effective exercises',
      duration: 20,
      difficulty: 'Intermediate',
      category: 'strength',
      calories: 180,
      exercises: 6,
      rating: 4.8,
      image: 'https://images.pexels.com/photos/1431282/pexels-photo-1431282.jpeg?auto=compress&cs=tinysrgb&w=300',
      completed: true
    }
  ];

  const myProgress = {
    weeklyGoal: 5,
    completed: 3,
    totalWorkouts: 47,
    totalMinutes: 1240,
    streak: 7
  };

  const recentWorkouts = [
    {
      id: 1,
      title: 'HIIT Fat Burner',
      date: '2025-01-14',
      duration: 30,
      calories: 400
    },
    {
      id: 2,
      title: 'Core Crusher',
      date: '2025-01-13',
      duration: 20,
      calories: 180
    },
    {
      id: 3,
      title: 'Upper Body Strength',
      date: '2025-01-12',
      duration: 45,
      calories: 320
    }
  ];

  const filteredWorkouts = workouts.filter(workout => 
    selectedCategory === 'all' || workout.category === selectedCategory
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="p-6 ml-64 min-h-screen bg-gray-50">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Workout Center</h1>
        <p className="text-gray-600">Discover personalized workouts and track your fitness progress</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="border-b border-gray-100">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'browse', label: 'Browse Workouts' },
              { id: 'progress', label: 'My Progress' },
              { id: 'history', label: 'Workout History' }
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
          {activeTab === 'browse' && (
            <div>
              {/* Category Filter */}
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Workout Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredWorkouts.map((workout) => (
                  <div key={workout.id} className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <img
                        src={workout.image}
                        alt={workout.title}
                        className="w-full h-48 object-cover"
                      />
                      {workout.completed && (
                        <div className="absolute top-3 right-3 bg-green-500 text-white p-2 rounded-full">
                          <CheckCircle className="h-4 w-4" />
                        </div>
                      )}
                      <div className="absolute bottom-3 left-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(workout.difficulty)}`}>
                          {workout.difficulty}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">{workout.title}</h3>
                      <p className="text-gray-600 text-sm mb-4">{workout.description}</p>
                      
                      <div className="grid grid-cols-3 gap-4 mb-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{workout.duration}min</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Target className="h-4 w-4" />
                          <span>{workout.calories} cal</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span>{workout.rating}</span>
                        </div>
                      </div>
                      
                      <button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all transform hover:scale-105 flex items-center justify-center space-x-2">
                        <Play className="h-4 w-4" />
                        <span>{workout.completed ? 'Do Again' : 'Start Workout'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'progress' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-2">Weekly Goal</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-3xl font-bold">{myProgress.completed}/{myProgress.weeklyGoal}</p>
                        <p className="text-blue-100">Workouts completed</p>
                      </div>
                      <div className="w-16 h-16 rounded-full border-4 border-white/30 flex items-center justify-center">
                        <span className="text-xl font-bold">{Math.round((myProgress.completed / myProgress.weeklyGoal) * 100)}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-2">Current Streak</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-3xl font-bold">{myProgress.streak}</p>
                        <p className="text-green-100">Days in a row</p>
                      </div>
                      <div className="text-4xl">🔥</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Overall Statistics</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-gray-800">{myProgress.totalWorkouts}</p>
                      <p className="text-gray-600">Total Workouts</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-gray-800">{myProgress.totalMinutes.toLocaleString()}</p>
                      <p className="text-gray-600">Minutes Exercised</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all">
                      Start Quick Workout
                    </button>
                    <button className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                      Create Custom Plan
                    </button>
                    <button className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                      View Achievements
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Recent Workouts</h3>
              <div className="space-y-4">
                {recentWorkouts.map((workout) => (
                  <div key={workout.id} className="bg-gray-50 rounded-lg p-6 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-green-100 p-3 rounded-full">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800">{workout.title}</h4>
                        <p className="text-sm text-gray-600">{new Date(workout.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-800">{workout.duration} min</p>
                      <p className="text-sm text-gray-600">{workout.calories} calories</p>
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