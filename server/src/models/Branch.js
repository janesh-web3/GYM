import mongoose from "mongoose";

const branchSchema = new mongoose.Schema(
  {
    branchName: {
      type: String,
      required: [true, "Branch name is required"],
      trim: true,
    },
    gymId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gym",
      required: true,
    },
    address: {
      street: {
        type: String,
        required: [true, "Street address is required"],
      },
      city: {
        type: String,
        required: [true, "City is required"],
      },
      state: {
        type: String,
        required: [true, "State is required"],
      },
      zipCode: {
        type: String,
        required: [true, "ZIP code is required"],
      },
      country: {
        type: String,
        required: [true, "Country is required"],
      },
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    workingHours: {
      openTime: {
        type: String,
        default: "09:00",
      },
      closeTime: {
        type: String,
        default: "22:00",
      },
    },
    facilities: [
      {
        type: String,
        trim: true,
      },
    ],
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    photos: [
      {
        url: String,
        public_id: String,
        caption: String,
      },
    ],
    videos: [
      {
        url: String,
        public_id: String,
        caption: String,
      },
    ],
    trainers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["active", "inactive", "maintenance"],
      default: "active",
    },
    memberCount: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for getting all members
branchSchema.virtual("members", {
  ref: "BranchMembership",
  localField: "_id",
  foreignField: "branchId",
  options: { match: { status: "active" } },
});

// Add index for faster queries
branchSchema.index({ branchName: "text", "address.city": "text" });
branchSchema.index({ gymId: 1 });

// Middleware to delete media from Cloudinary when branch is deleted
branchSchema.pre("remove", async function (next) {
  try {
    const { deleteMedia } = await import("../utils/cloudinary.js");

    // Delete all photos
    for (const photo of this.photos) {
      if (photo.public_id) {
        await deleteMedia(photo.public_id);
      }
    }

    // Delete all videos
    for (const video of this.videos) {
      if (video.public_id) {
        await deleteMedia(video.public_id, true);
      }
    }

    next();
  } catch (error) {
    next(error);
  }
});

const Branch = mongoose.model("Branch", branchSchema);

export default Branch;
