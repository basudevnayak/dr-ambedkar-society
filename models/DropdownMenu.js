// models/DropdownMenu.js
import mongoose from 'mongoose';

const PageContentSchema = new mongoose.Schema({
  content: {
    type: String,
    default: '',
  },
  html: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const DropdownItemSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  order: {
    type: Number,
    default: 0,
  },
  url: {
    type: String,
    default: '#',
  },
  pageContent: PageContentSchema,
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const DropdownMenuSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  label: {
    type: String,
    required: true,
  },
  items: [DropdownItemSchema],
  order: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

DropdownMenuSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.DropdownMenu || mongoose.model('DropdownMenu', DropdownMenuSchema);