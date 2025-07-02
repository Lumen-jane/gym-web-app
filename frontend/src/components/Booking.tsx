import React, { useState } from 'react';
import { Calendar, Clock, Users, MapPin, Star, Filter, Search } from 'lucide-react';

export const Booking: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { id: 'all', name: 'All Classes' },
    { id: 'strength', name: 'Strength Training' },
    { id: 'cardio', name: 'Cardio' },
    { id: 'yoga', name: 'Yoga & Flexibility' },
    { id: 'hiit', name: 'HIIT' },
    { id: 'dance', name: 'Dance Fitness' }
  ];

  const classes = [
    {
      id: 1,
      name: 'Morning HIIT Blast',
      instructor: 'Sarah Johnson',
      time: '7:00 AM - 8:00 AM',
      duration: 60,
      category: 'hiit',
      level: 'Intermediate',
      spots: 12,
      maxSpots: 15,
      rating: 4.8,
      price: 'Included',
      description: 'High-intensity interval training to kickstart your day',
      image: 'https://images.pexels.com/photos/416778/pexels-photo-416778.jpeg?auto=compress&cs=tinysrgb&w=300'
    },
    {
      id: 2,
      name: 'Strength & Power',
      instructor: 'Mike Chen',
      time: '6:00 PM - 7:30 PM',
      duration: 90,
      category: 'strength',
      level: 'Advanced',
      spots: 8,
      maxSpots: 10,
      rating: 4.9,
      price: 'Included',
      description: 'Build muscle and increase strength with compound movements',
      image: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=300'
    },
    {
      id: 3,
      name: 'Yoga Flow',
      instructor: 'Emma Davis',
      time: '8:00 AM - 9:00 AM',
      duration: 60,
      category: 'yoga',
      level: 'Beginner',
      spots: 15,
      maxSpots: 20,
      rating: 4.7,
      price: 'Included',
      description: 'Gentle flow to improve flexibility and mindfulness',
      image: 'https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&w=300'
    },
    {
      id: 4,
      name: 'Cardio Dance Party',
      instructor: 'Lisa Rodriguez',
      time: '7:00 PM - 8:00 PM',
      duration: 60,
      category: 'dance',
      level: 'All Levels',
      spots: 18,
      maxSpots: 25,
      rating: 4.6,
      price: 'Included',
      description: 'Fun dance workout with upbeat music and great vibes',
      image: 'https://images.pexels.com/photos/3775593/pexels-photo-3775593.jpeg?auto=compress&cs=tinysrgb&w=300'
    },
    {
      id: 5,
      name: 'Functional Fitness',
      instructor: 'David Kim',
      time: '12:00 PM - 1:00 PM',
      duration: 60,
      category: 'strength',
      level: 'Intermediate',
      spots: 10,
      maxSpots: 12,
      rating: 4.8,
      price: 'Included',
      description: 'Real-world movements for everyday strength and mobility',
      image: 'https://images.pexels.com/photos/1431282/pexels-photo-1431282.jpeg?auto=compress&cs=tinysrgb&w=300'
    }
  ];

  const myBookings = [
    {
      id: 1,
      className: 'Morning HIIT Blast',
      instructor: 'Sarah Johnson',
      date: '2025-01-15',
      time: '7:00 AM',
      status: 'confirmed'
    },
    {
      id: 2,
      className: 'Yoga Flow',
      instructor: 'Emma Davis',
      date: '2025-01-16',
      time: '8:00 AM',
      status: 'confirmed'
    }
  ];

  const filteredClasses = classes.filter(classItem => {
    const matchesCategory = selectedCategory === 'all' || classItem.category === selectedCategory;
    const matchesSearch = classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         classItem.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getAvailabilityColor = (spots: number, maxSpots: number) => {
    const percentage = (spots / maxSpots) * 100;
    if (percentage <= 20) return 'text-red-600';
    if (percentage <= 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="p-6 ml-64 min-h-screen bg-gray-50">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Class Bookings</h1>
        <p className="text-gray-600">Book your favorite fitness classes and manage your schedule</p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search classes or instructors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Available Classes */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Available Classes</h2>
            <div className="space-y-6">
              {filteredClasses.map((classItem) => (
                <div key={classItem.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-4">
                    <img
                      src={classItem.image}
                      alt={classItem.name}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">{classItem.name}</h3>
                          <p className="text-gray-600">with {classItem.instructor}</p>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600">{classItem.rating}</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-3">{classItem.description}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{classItem.time}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span className={getAvailabilityColor(classItem.spots, classItem.maxSpots)}>
                            {classItem.spots}/{classItem.maxSpots} spots
                          </span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(classItem.level)}`}>
                          {classItem.level}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-gray-800">{classItem.price}</span>
                        <button 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all transform hover:scale-105"
                          disabled={classItem.spots === 0}
                        >
                          {classItem.spots === 0 ? 'Full' : 'Book Now'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* My Bookings */}
        <div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">My Bookings</h2>
            <div className="space-y-4">
              {myBookings.map((booking) => (
                <div key={booking.id} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-800 mb-1">{booking.className}</h3>
                  <p className="text-sm text-gray-600 mb-2">with {booking.instructor}</p>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(booking.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{booking.time}</span>
                    </div>
                  </div>
                  <div className="mt-3 flex space-x-2">
                    <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded text-sm font-medium hover:bg-gray-200 transition-colors">
                      Reschedule
                    </button>
                    <button className="flex-1 bg-red-100 text-red-700 py-2 px-3 rounded text-sm font-medium hover:bg-red-200 transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="font-medium text-gray-800 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-2 px-4 rounded-lg font-medium hover:from-green-600 hover:to-blue-600 transition-all">
                  View Calendar
                </button>
                <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                  Booking History
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};