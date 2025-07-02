import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, 'fitlife.db');

// Create database connection
export const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('📁 Connected to SQLite database');
  }
});

// Initialize database tables
export const initializeDatabase = async () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          uuid TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
          phone TEXT,
          membership_type TEXT DEFAULT 'basic',
          membership_start_date DATE,
          membership_end_date DATE,
          is_active BOOLEAN DEFAULT 1,
          is_admin BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Instructors table
      db.run(`
        CREATE TABLE IF NOT EXISTS instructors (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          uuid TEXT UNIQUE NOT NULL,
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          phone TEXT,
          specializations TEXT,
          bio TEXT,
          experience_years INTEGER DEFAULT 0,
          hourly_rate DECIMAL(10,2),
          is_active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Classes table
      db.run(`
        CREATE TABLE IF NOT EXISTS classes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          uuid TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          description TEXT,
          instructor_id INTEGER,
          duration_minutes INTEGER NOT NULL,
          max_capacity INTEGER NOT NULL,
          difficulty_level TEXT CHECK(difficulty_level IN ('Beginner', 'Intermediate', 'Advanced')),
          location TEXT NOT NULL,
          price DECIMAL(10,2) DEFAULT 0,
          image_url TEXT,
          is_active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (instructor_id) REFERENCES instructors (id)
        )
      `);

      // Class schedules table
      db.run(`
        CREATE TABLE IF NOT EXISTS class_schedules (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          uuid TEXT UNIQUE NOT NULL,
          class_id INTEGER NOT NULL,
          date DATE NOT NULL,
          start_time TIME NOT NULL,
          end_time TIME NOT NULL,
          current_bookings INTEGER DEFAULT 0,
          is_cancelled BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (class_id) REFERENCES classes (id),
          UNIQUE(class_id, date, start_time)
        )
      `);

      // Bookings table
      db.run(`
        CREATE TABLE IF NOT EXISTS bookings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          uuid TEXT UNIQUE NOT NULL,
          user_id INTEGER NOT NULL,
          schedule_id INTEGER NOT NULL,
          booking_date DATETIME DEFAULT CURRENT_TIMESTAMP,
          status TEXT DEFAULT 'confirmed' CHECK(status IN ('confirmed', 'cancelled', 'completed', 'no-show')),
          payment_status TEXT DEFAULT 'pending' CHECK(payment_status IN ('pending', 'paid', 'refunded')),
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id),
          FOREIGN KEY (schedule_id) REFERENCES class_schedules (id),
          UNIQUE(user_id, schedule_id)
        )
      `);

      // Workout plans table
      db.run(`
        CREATE TABLE IF NOT EXISTS workout_plans (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          uuid TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          category TEXT NOT NULL,
          description TEXT,
          duration_minutes INTEGER,
          difficulty_level TEXT CHECK(difficulty_level IN ('Beginner', 'Intermediate', 'Advanced')),
          calories_burned INTEGER,
          exercises_count INTEGER,
          image_url TEXT,
          instructions TEXT,
          equipment_needed TEXT,
          is_active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Diet plans table
      db.run(`
        CREATE TABLE IF NOT EXISTS diet_plans (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          uuid TEXT UNIQUE NOT NULL,
          title TEXT NOT NULL,
          goal TEXT NOT NULL,
          description TEXT,
          duration_weeks INTEGER,
          daily_calories INTEGER,
          meals_per_day INTEGER,
          carbs_percentage INTEGER,
          protein_percentage INTEGER,
          fat_percentage INTEGER,
          image_url TEXT,
          meal_plan TEXT,
          shopping_list TEXT,
          is_active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // User workout progress table
      db.run(`
        CREATE TABLE IF NOT EXISTS user_workout_progress (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          uuid TEXT UNIQUE NOT NULL,
          user_id INTEGER NOT NULL,
          workout_plan_id INTEGER NOT NULL,
          completed_date DATE NOT NULL,
          duration_minutes INTEGER,
          calories_burned INTEGER,
          notes TEXT,
          rating INTEGER CHECK(rating >= 1 AND rating <= 5),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id),
          FOREIGN KEY (workout_plan_id) REFERENCES workout_plans (id)
        )
      `);

      // User diet progress table
      db.run(`
        CREATE TABLE IF NOT EXISTS user_diet_progress (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          uuid TEXT UNIQUE NOT NULL,
          user_id INTEGER NOT NULL,
          diet_plan_id INTEGER NOT NULL,
          start_date DATE NOT NULL,
          current_week INTEGER DEFAULT 1,
          weight_start DECIMAL(5,2),
          weight_current DECIMAL(5,2),
          notes TEXT,
          is_active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id),
          FOREIGN KEY (diet_plan_id) REFERENCES diet_plans (id)
        )
      `);

      // Insert sample data
      insertSampleData();
    });

    resolve();
  });
};

const insertSampleData = () => {
  // Insert sample instructors
  const instructors = [
    ['sarah-chen-uuid', 'Sarah', 'Chen', 'sarah.chen@fitlife.com', '+1234567890', 'Yoga,Pilates', 'Certified yoga instructor with 8 years of experience', 8, 75.00],
    ['mike-johnson-uuid', 'Mike', 'Johnson', 'mike.johnson@fitlife.com', '+1234567891', 'HIIT,Strength Training', 'Former athlete specializing in high-intensity training', 6, 85.00],
    ['alex-rodriguez-uuid', 'Alex', 'Rodriguez', 'alex.rodriguez@fitlife.com', '+1234567892', 'Strength Training,Powerlifting', 'Certified strength and conditioning specialist', 10, 90.00],
    ['emma-wilson-uuid', 'Emma', 'Wilson', 'emma.wilson@fitlife.com', '+1234567893', 'Dance,Cardio', 'Professional dancer and fitness instructor', 5, 70.00],
    ['david-park-uuid', 'David', 'Park', 'david.park@fitlife.com', '+1234567894', 'CrossFit,Functional Training', 'CrossFit Level 2 trainer with competition experience', 7, 80.00],
    ['lisa-thompson-uuid', 'Lisa', 'Thompson', 'lisa.thompson@fitlife.com', '+1234567895', 'Yoga,Meditation', 'Mindfulness and yoga instructor', 12, 75.00]
  ];

  instructors.forEach(instructor => {
    db.run(`
      INSERT OR IGNORE INTO instructors 
      (uuid, first_name, last_name, email, phone, specializations, bio, experience_years, hourly_rate)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, instructor);
  });

  // Insert sample classes
  const classes = [
    ['morning-yoga-uuid', 'Morning Yoga Flow', 'yoga', 'Start your day with gentle stretches and mindfulness', 1, 60, 20, 'Beginner', 'Studio A', 25.00, 'https://images.pexels.com/photos/3822864/pexels-photo-3822864.jpeg?auto=compress&cs=tinysrgb&w=400'],
    ['hiit-power-uuid', 'HIIT Power Session', 'hiit', 'High-intensity interval training for maximum results', 2, 45, 15, 'Advanced', 'Main Gym', 30.00, 'https://images.pexels.com/photos/416809/pexels-photo-416809.jpeg?auto=compress&cs=tinysrgb&w=400'],
    ['strength-conditioning-uuid', 'Strength & Conditioning', 'strength', 'Build muscle and improve functional strength', 3, 50, 12, 'Intermediate', 'Weight Room', 35.00, 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=400'],
    ['cardio-dance-uuid', 'Cardio Dance Fusion', 'dance', 'Fun dance workout combining cardio and rhythm', 4, 55, 25, 'Intermediate', 'Studio B', 28.00, 'https://images.pexels.com/photos/3775593/pexels-photo-3775593.jpeg?auto=compress&cs=tinysrgb&w=400'],
    ['evening-strength-uuid', 'Evening Strength Training', 'strength', 'Advanced strength training for serious athletes', 5, 45, 18, 'Advanced', 'Main Gym', 35.00, 'https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg?auto=compress&cs=tinysrgb&w=400'],
    ['relaxation-yoga-uuid', 'Relaxation Yoga', 'yoga', 'Unwind with gentle yoga and meditation', 6, 60, 20, 'Beginner', 'Studio A', 25.00, 'https://images.pexels.com/photos/3984340/pexels-photo-3984340.jpeg?auto=compress&cs=tinysrgb&w=400']
  ];

  classes.forEach(classData => {
    db.run(`
      INSERT OR IGNORE INTO classes 
      (uuid, name, type, description, instructor_id, duration_minutes, max_capacity, difficulty_level, location, price, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, classData);
  });

  // Insert sample workout plans
  const workoutPlans = [
    ['full-body-strength-uuid', 'Full Body Strength', 'strength', 'Complete full-body workout targeting all major muscle groups', 45, 'Intermediate', 320, 12, 'https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg?auto=compress&cs=tinysrgb&w=400'],
    ['hiit-cardio-blast-uuid', 'HIIT Cardio Blast', 'hiit', 'High-intensity interval training for maximum calorie burn', 30, 'Advanced', 400, 8, 'https://images.pexels.com/photos/416809/pexels-photo-416809.jpeg?auto=compress&cs=tinysrgb&w=400'],
    ['morning-yoga-flow-uuid', 'Morning Yoga Flow', 'yoga', 'Gentle yoga flow to start your day with mindfulness', 35, 'Beginner', 150, 15, 'https://images.pexels.com/photos/3822864/pexels-photo-3822864.jpeg?auto=compress&cs=tinysrgb&w=400'],
    ['cardio-dance-party-uuid', 'Cardio Dance Party', 'cardio', 'Fun dance workout that gets your heart pumping', 40, 'Intermediate', 350, 10, 'https://images.pexels.com/photos/3775593/pexels-photo-3775593.jpeg?auto=compress&cs=tinysrgb&w=400'],
    ['core-flexibility-uuid', 'Core & Flexibility', 'flexibility', 'Strengthen your core and improve flexibility', 25, 'Beginner', 120, 8, 'https://images.pexels.com/photos/3984340/pexels-photo-3984340.jpeg?auto=compress&cs=tinysrgb&w=400'],
    ['upper-body-power-uuid', 'Upper Body Power', 'strength', 'Intense upper body strength training session', 35, 'Advanced', 280, 10, 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=400']
  ];

  workoutPlans.forEach(workout => {
    db.run(`
      INSERT OR IGNORE INTO workout_plans 
      (uuid, name, category, description, duration_minutes, difficulty_level, calories_burned, exercises_count, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, workout);
  });

  // Insert sample diet plans
  const dietPlans = [
    ['keto-fat-burner-uuid', 'Keto Fat Burner', 'weight-loss', 'Low-carb, high-fat diet plan designed for rapid fat loss', 4, 1800, 5, 5, 25, 70, 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400'],
    ['muscle-builder-pro-uuid', 'Muscle Builder Pro', 'muscle-gain', 'High-protein diet plan optimized for muscle growth', 8, 2500, 6, 40, 35, 25, 'https://images.pexels.com/photos/1059905/pexels-photo-1059905.jpeg?auto=compress&cs=tinysrgb&w=400'],
    ['mediterranean-balance-uuid', 'Mediterranean Balance', 'maintenance', 'Balanced Mediterranean-style eating for overall health', 12, 2000, 4, 45, 20, 35, 'https://images.pexels.com/photos/1640773/pexels-photo-1640773.jpeg?auto=compress&cs=tinysrgb&w=400'],
    ['energy-booster-uuid', 'Energy Booster', 'energy', 'Nutrient-dense meals to maximize energy levels', 6, 2200, 5, 50, 25, 25, 'https://images.pexels.com/photos/1543592/pexels-photo-1543592.jpeg?auto=compress&cs=tinysrgb&w=400'],
    ['plant-power-uuid', 'Plant Power', 'weight-loss', 'Plant-based nutrition for sustainable weight management', 6, 1600, 4, 55, 20, 25, 'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=400'],
    ['performance-fuel-uuid', 'Performance Fuel', 'muscle-gain', 'Athletic nutrition plan for peak performance', 10, 2800, 6, 45, 30, 25, 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=400']
  ];

  dietPlans.forEach(diet => {
    db.run(`
      INSERT OR IGNORE INTO diet_plans 
      (uuid, title, goal, description, duration_weeks, daily_calories, meals_per_day, carbs_percentage, protein_percentage, fat_percentage, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, diet);
  });

  console.log('✅ Sample data inserted successfully');
};

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🔄 Closing database connection...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('📁 Database connection closed');
    }
    process.exit(0);
  });
});