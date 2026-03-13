import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true,
    trim: true
  },
  path: {
    type: String,
    trim: true
  },
  icon: {
    type: String,
    default: null
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Menu',
    default: null
  },
  menuType: {
    type: String,
    enum: ['single', 'dropdown', 'mega'],
    default: 'single'
  },
  target: {
    type: String,
    enum: ['_self', '_blank'],
    default: '_self'
  },
  permissions: [{
    type: String
  }],
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  children: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Menu'
  }]
}, {
  timestamps: true
});

// Index for better query performance
menuItemSchema.index({ parentId: 1, order: 1 });
menuItemSchema.index({ path: 1 });

const Menu = mongoose.models.Menu || mongoose.model('Menu', menuItemSchema);

export default Menu;