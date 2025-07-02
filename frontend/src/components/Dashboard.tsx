import React, { useState, useEffect } from 'react';
import { Activity, Calendar, Target, TrendingUp, Users, Clock, Award, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    workoutsThisWeek: 4,
    caloriesBurned: 1250,
    currentStreak: 7,
    nextClass: 'HIIT Training'
  });

  const recentActivities = [
    {
      id: 1,
      type: 'workout',
      title: 'Completed Upper Body Strength',
      time: '2 hours ago',
      calories: 320,
      duration: 45
    },
    {
      id: 2,
      type: 'class',
      title: 'Attended Yoga Flow',
      time: '1 day ago',
      calories: 180,
      duration: 60
    },
    {
      id: 3,
      type: 'diet',
      title: 'Logged daily nutrition',
      time: '2 days ago',
      calories: 0,
      duration: 0
    }
  ];

  const achievements = [
    {
      id: 1,
      title: 'Week Warrior',
      description: '7 day workout streak',
      icon: '🔥',
      completed: true
    },
    {
      id: 2,
      title: 'Calorie Crusher',
      description: 'Burn 1000+ calories',
      icon: '⚡',
      completed: true
    },
    {
      id: 3,
      title: 'Class Champion',
      description: 'Attend 10 classes',
      icon: '🏆',
      completed: false,
      progress: 7
    }
  ];

  const upcomingClasses = [
    {
      id: 1,
      name: 'HIIT Training',
      instructor: 'Sarah Johnson',
      time: '6:00 PM',
      date: 'Today',
      spots: 3
    },
    {
      id: 2,
      name: 'Yoga Flow',
      instructor: 'Mike Chen',
      time: '7:30 AM',
      date: 'Tomorrow',
      spots: 8
    },
    {
      id: 3,
      name: 'Strength Training',
      instructor: 'Emma Davis',
      time: '5:00 PM',
      date: 'Tomorrow',
      spots: 2
    }
  ];

  return (
    <div className="p-6 ml-64 min-h-screen bg-gray-50">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Welcome back, {user?.first_name}! 👋
        </h1>
        <p className="text-gray-600">Here's your fitness journey overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Workouts This Week</p>
              <p className="text-3xl font-bold text-gray-800">{stats.workoutsThisWeek}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-green-600 text-sm font-medium">+2 from last week</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Calories Burned</p>
              <p className="text-3xl font-bold text-gray-800">{stats.caloriesBurned.toLocaleString()}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <Zap className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-green-600 text-sm font-medium">+15% from last week</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Current Streak</p>
              <p className="text-3xl font-bold text-gray-800">{stats.currentStreak} days</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Target className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-green-600 text-sm font-medium">Personal best!</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Next Class</p>
              <p className="text-lg font-bold text-gray-800">{stats.nextClass}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-blue-600 text-sm font-medium">In 2 hours</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className={`p-3 rounded-full ${
                    activity.type === 'workout' ? 'bg-blue-100' :
                    activity.type === 'class' ? 'bg-green-100' : 'bg-orange-100'
                  }`}>
                    {activity.type === 'workout' && <Activity className="h-5 w-5 text-blue-600" />}
                    {activity.type === 'class' && <Users className="h-5 w-5 text-green-600" />}
                    {activity.type === 'diet' && <Target className="h-5 w-5 text-orange-600" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800">{activity.title}</h3>
                    <p className="text-sm text-gray-600">{activity.time}</p>
                  </div>
                  <div className="text-right">
                    {activity.calories > 0 && (
                      <p className="text-sm font-medium text-gray-800">{activity.calories} cal</p>
                    )}
                    {activity.duration > 0 && (
                      <p className="text-xs text-gray-600">{activity.duration} min</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Content */}
        <div className="space-y-6">
          {/* Achievements */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Achievements</h2>
            <div className="space-y-4">
              {achievements.map((achievement) => (
                <div key={achievement.id} className="flex items-center space-x-3">
                  <div className={`text-2xl ${achievement.completed ? '' : 'grayscale opacity-50'}`}>
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-medium ${achievement.completed ? 'text-gray-800' : 'text-gray-500'}`}>
                      {achievement.title}
                    </h3>
                    <p className="text-sm text-gray-600">{achievement.description}</p>
                    {!achievement.completed && achievement.progress && (
                      <div className="mt-2">
                        <div className="bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${(achievement.progress / 10) * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{achievement.progress}/10</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Classes */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Upcoming Classes</h2>
            <div className="space-y-4">
              {upcomingClasses.map((classItem) => (
                <div key={classItem.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-800">{classItem.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      classItem.spots <= 3 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                    }`}>
                      {classItem.spots} spots left
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">with {classItem.instructor}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{classItem.date} at {classItem.time}</span>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Book Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};