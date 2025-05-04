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
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    address: {
      street: {
        type: String,
      },
      city: {
        type: String,
      },
      state: {
        type: String,
      },
      zipCode: {
        type: String,
      },
      country: {
        type: String,
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
    openingHours: {
      monday: {
        openTime: {
          type: String,
          default: "09:00",
        },
        closeTime: {
          type: String,
          default: "22:00",
        },
      },
      tuesday: {
        openTime: {
          type: String,
          default: "09:00",
        },
        closeTime: {
          type: String,
          default: "22:00",
        },
      },
      wednesday: {
        openTime: {
          type: String,
          default: "09:00",
        },
        closeTime: {
          type: String,
          default: "22:00",
        },
      },
      thursday: {
        openTime: {
          type: String,
          default: "09:00",
        },
        closeTime: {
          type: String,
          default: "22:00",
        },
      },
      friday: {
        openTime: {
          type: String,
          default: "09:00",
        },
        closeTime: {
          type: String,
          default: "22:00",
        },
      },
      saturday: {
        openTime: {
          type: String,
          default: "09:00",
        },
        closeTime: {
          type: String,
          default: "22:00",
        },
      },
      sunday: {
        openTime: {
          type: String,
          default: "09:00",
        },
        closeTime: {
          type: String,
          default: "22:00",
        },
      },
    },
    description: {
      type: String,
    },
    logo: {
      url: String,
      public_id: String,
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
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Member",
      },
    ],
    trainers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Trainer",
      },
    ],
    facilities: [
      {
        name: {
          type: String,
        },
        description: String,
        isAvailable: {
          type: Boolean,
          default: true,
        },
      },
    ],
    services: [
      {
        name: {
          type: String,
        },
        description: {
          type: String,
        },
        price: {
          type: Number,
        },
        duration: {
          type: Number,
        },
      },
    ],
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Add index for faster queries
branchSchema.index({ branchName: "text", "address.city": "text" });

// Middleware to delete media from Cloudinary when branch is deleted
branchSchema.pre("remove", async function (next) {
  try {
    const { deleteMedia } = await import("../utils/cloudinary.js");

    // Delete logo if it exists
    if (this.logo && this.logo.public_id) {
      await deleteMedia(this.logo.public_id);
    }

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
