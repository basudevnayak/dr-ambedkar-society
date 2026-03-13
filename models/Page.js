import mongoose from 'mongoose';

const pageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  excerpt: {
    type: String,
    maxlength: 500
  },
  featuredImage: {
    type: String,
    default: null
  },
  metaTitle: {
    type: String,
    maxlength: 200
  },
  metaDescription: {
    type: String,
    maxlength: 500
  },
  metaKeywords: [String],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    enum: ['about', 'programs', 'events', 'news', 'general'],
    default: 'general'
  },
  tags: [String],
  template: {
    type: String,
    default: 'default'
  },
  publishedAt: {
    type: Date
  },
  viewCount: {
    type: Number,
    default: 0
  },
  isHomepage: {
    type: Boolean,
    default: false
  },
  parentPage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Page'
  },
  order: {
    type: Number,
    default: 0
  },
  customFields: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes for better performance
pageSchema.index({ slug: 1 });
pageSchema.index({ status: 1, publishedAt: -1 });
pageSchema.index({ category: 1, status: 1 });

const Page = mongoose.models.Page || mongoose.model('Page', pageSchema);

export default Page;