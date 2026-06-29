import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema({
  shop: {
    type: String,
    required: true,
    index: true,
  },
  text: {
    type: String,
    required: true,
    trim: true,
  },
  // Timestamp of when this announcement was saved (audit history record).
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // Tracks whether the Shopify metafield sync succeeded for this record.
  syncedToShopify: {
    type: Boolean,
    default: false,
  },
});

const Announcement = mongoose.model("Announcement", announcementSchema);

export default Announcement;
