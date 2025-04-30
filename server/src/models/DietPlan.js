import mongoose from 'mongoose';

const mealSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Meal name is required']
  },
  time: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  foods: [{
    name: {
      type: String,
      required: true
    },
    quantity: {
      type: String,
      default: ''
    },
    calories: {
      type: Number,
      default: 0
    },
    protein: {
      type: Number, // in grams
      default: 0
    },
    carbs: {
      type: Number, // in grams
      default: 0
    },
    fats: {
      type: Number, // in grams
      default: 0
    }
  }],
  totalCalories: {
    type: Number,
    default: 0
  }
}, { _id: true });

const dietPlanSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Diet plan title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  meals: [mealSchema],
  calories: {
    type: Number,
    required: [true, 'Total calories are required']
  },
  goal: {
    type: String,
    enum: ['weight_loss', 'muscle_gain', 'maintenance', 'performance', 'health'],
    required: [true, 'Diet goal is required']
  },
  duration: {
    type: Number, // in weeks
    default: 4
  },
  restrictions: [{
    type: String,
    enum: ['none', 'vegetarian', 'vegan', 'gluten_free', 'dairy_free', 'nut_free', 'keto', 'paleo']
  }],
  macros: {
    protein: {
      type: Number, // percentage
      min: 0,
      max: 100,
      default: 30
    },
    carbs: {
      type: Number, // percentage
      min: 0,
      max: 100,
      default: 40
    },
    fats: {
      type: Number, // percentage
      min: 0,
      max: 100,
      default: 30
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  gymId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gym',
    required: true
  },
  isTemplate: {
    type: Boolean,
    default: false
  },
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member'
  }]
}, {
  timestamps: true
});

// Validate macros add up to 100%
dietPlanSchema.pre('validate', function(next) {
  const { protein, carbs, fats } = this.macros;
  if (protein + carbs + fats !== 100) {
    this.invalidate('macros', 'Macros (protein, carbs, fats) must add up to 100%');
  }
  next();
});

// Add indexes for faster queries
dietPlanSchema.index({ title: 'text' });
dietPlanSchema.index({ gymId: 1 });
dietPlanSchema.index({ createdBy: 1 });
dietPlanSchema.index({ assignedTo: 1 });

const DietPlan = mongoose.model('DietPlan', dietPlanSchema);

export default DietPlan; 