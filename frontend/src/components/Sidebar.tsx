import React from 'react';
import { Home, Dumbbell, Apple, Calendar, Crown, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange }) => {
  const { user, logout } = useAuth();

  const menuItems = [
    { id: 'home', label: 'Dashboard', icon: Home },
    { id: 'workout', label: 'Workouts', icon: Dumbbell },
    { id: 'diet', label: 'Diet Plans', icon: Apple },
    { id: 'booking', label: 'Bookings', icon: Calendar },
    { id: 'membership', label: 'Membership', icon: Crown },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  if (user?.is_admin) {
    menuItems.push({ id: 'admin', label: 'Admin', icon: Settings });
  }

  return (
    <div className="bg-white shadow-lg h-screen w-64 fixed left-0 top-0 z-10 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
            <Dumbbell className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">FitLife Gym</h1>
            <p className="text-sm text-gray-500">Management System</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onSectionChange(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
          <div className="bg-gradient-to-r from-green-400 to-blue-500 p-2 rounded-full">
            <User className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-800">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {user?.membership_type} Member
            </p>
          </div>
          <button 
            onClick={logout}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 text-center">
        <p className="text-xs text-gray-400">© 2025 FitLife Gym</p>
      </div>
    </div>
  );
};