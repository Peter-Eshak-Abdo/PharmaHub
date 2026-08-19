const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    specialization: {
      type: String,
      required: true,
      trim: true,
      enum: {
        values: [
          "باطنة",
          "أطفال",
          "قلب",
          "جراحة",
          "عيون",
          "نساء وتوليد",
          "عظام",
        ],
        message: "التخصص الطبي يجب أن يكون من التخصصات المعتمدة",
      },
    },

    education: {
      type: String,
      trim: true,
    },

    qualifications: {
      type: String,
      trim: true,
    },

    yearsOfExperience: {
      type: Number,
      min: 0,
    },

    bio: {
      type: String,
      trim: true,
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    consultationFeeSnapshot: {
      type: Number,
      default: 0,
      min: 0,
    },
    consultationFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    paymentMethods: {
      instapay: { type: String, default: '' },
      vodafoneCash: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Doctor", doctorSchema);
