import mongoose from 'mongoose';

const exerciseSchema = new mongoose.Schema({
  name: {
    type: String, 
    required: [true, 'Exercise name is required']
  },
  sets: {
    type: Number,
    default: 3
  },
  reps: {
    type: Number,
    default: 12
  },
  duration: {
    type: Number, // in minutes
    default: 0
  },
  restTime: {
    type: Number, // in seconds
    default: 60
  },
  instructions: {
    type: String,
    default: ''
  },
  targetMuscleGroup: {
    type: String,
    default: ''
  }
}, { _id: true });

const workoutPlanSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Workout plan title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  exercises: [exerciseSchema],
  duration: {
    type: Number, // in weeks
    required: [true, 'Duration is required']
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: [true, 'Fitness level is required']
  },
  goal: {
    type: String,
    enum: ['weight_loss', 'muscle_gain', 'strength', 'endurance', 'general_fitness'],
    default: 'general_fitness'
  },
  frequency: {
    type: Number, // days per week
    min: 1,
    max: 7,
    default: 3
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

// Add indexes for faster queries
workoutPlanSchema.index({ title: 'text' });
workoutPlanSchema.index({ gymId: 1 });
workoutPlanSchema.index({ createdBy: 1 });
workoutPlanSchema.index({ assignedTo: 1 });

const WorkoutPlan = mongoose.model('WorkoutPlan', workoutPlanSchema);

export default WorkoutPlan; 