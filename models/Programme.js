
// models/Programme.js
import mongoose from 'mongoose';

const ProgrammeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  startDate: Date,
  endDate: Date,
  location: String,
  image: String,
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed'],
    default: 'upcoming',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Programme || mongoose.model('Programme', ProgrammeSchema);