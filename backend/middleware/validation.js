import Joi from 'joi';

export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: error.details.map(detail => detail.message)
      });
    }
    next();
  };
};

// Validation schemas
export const schemas = {
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    first_name: Joi.string().min(2).max(50).required(),
    last_name: Joi.string().min(2).max(50).required(),
    phone: Joi.string().optional(),
    membership_type: Joi.string().valid('basic', 'premium', 'vip').default('basic')
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  booking: Joi.object({
    schedule_id: Joi.number().integer().positive().required(),
    notes: Joi.string().max(500).optional()
  }),

  class: Joi.object({
    name: Joi.string().min(3).max(100).required(),
    type: Joi.string().required(),
    description: Joi.string().max(500).optional(),
    instructor_id: Joi.number().integer().positive().required(),
    duration_minutes: Joi.number().integer().min(15).max(180).required(),
    max_capacity: Joi.number().integer().min(1).max(100).required(),
    difficulty_level: Joi.string().valid('Beginner', 'Intermediate', 'Advanced').required(),
    location: Joi.string().required(),
    price: Joi.number().min(0).default(0),
    image_url: Joi.string().uri().optional()
  }),

  schedule: Joi.object({
    class_id: Joi.number().integer().positive().required(),
    date: Joi.date().min('now').required(),
    start_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    end_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required()
  })
};