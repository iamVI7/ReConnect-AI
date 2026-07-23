import mongoose from 'mongoose';

const sightingSchema = new mongoose.Schema(
  {
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    isAnonymous: { type: Boolean, default: false },
    relatedMissingPersonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MissingPerson',
      default: null,
    },
    description: { type: String, required: true, trim: true },
    photos: [{ type: String, trim: true }], // image URLs; Cloudinary upload wiring lands with the media module
    location: {
      address: { type: String, trim: true },
    },
    sightedAt: { type: Date, default: Date.now },
    verificationStatus: {
      type: String,
      enum: ['unverified', 'verified', 'false_report'],
      default: 'unverified',
    },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

sightingSchema.index({ relatedMissingPersonId: 1 });
sightingSchema.index({ createdAt: -1 });

export default mongoose.model('Sighting', sightingSchema);