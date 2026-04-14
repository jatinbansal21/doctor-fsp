const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    // ---- MANDATORY ----
    name: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
      index: true,
    },
    contactNumber: {
      type: String,
      required: [true, 'Contact number is required'],
      trim: true,
      index: true,
    },

    // ---- CORE FIELDS ----
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: null,
    },
    age: { type: Number, default: null },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', null],
      default: null,
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', null],
      default: null,
    },
    address: { type: String, trim: true, default: null },
    admitDate: { type: Date, default: null },

    // ---- CONTACT & EMERGENCY ----
    emergencyContact: { type: String, trim: true, default: null },
    emergencyContactName: { type: String, trim: true, default: null },

    // ---- MEDICAL INFO ----
    payorType: { type: String, trim: true, default: null },
    socialHistory: { type: String, trim: true, default: null },
    medicalHistory: { type: String, trim: true, default: null },
    allergies: { type: String, trim: true, default: null },
    currentMedications: { type: String, trim: true, default: null },

    // ---- ADMINISTRATIVE ----
    reference: { type: String, trim: true, default: null },
    remarks: { type: String, trim: true, default: null },
    review: { type: String, trim: true, default: null },
    fathersEducationProof: { type: String, trim: true, default: null },

    // ---- ASSIGNMENT ----
    doctorAssigned: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // ---- LINKED PATIENT USER ----
    patientUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // ---- SOFT DELETE ----
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },

    // ---- CREATED BY ----
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

// Text index for search
patientSchema.index({ name: 'text', contactNumber: 'text', email: 'text' });

// Compound index for common queries
patientSchema.index({ isDeleted: 1, createdAt: -1 });

module.exports = mongoose.model('Patient', patientSchema);
