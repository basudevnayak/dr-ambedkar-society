import mongoose from 'mongoose';

const SlideSchema = new mongoose.Schema({
  image: {
    type: String,
    required: [true, 'Image URL is required'],
  },
  imageInfo: {
    filename: String,
    size: Number,
    originalSize: Number,
    dimensions: {
      width: Number,
      height: Number,
    },
  },
  alt: {
    type: String,
    required: [true, 'Alt text is required'],
  },
  title: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  order: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

const Slide = mongoose.models.Slide || mongoose.model('Slide', SlideSchema);

export default Slide;