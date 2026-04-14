const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      index: true,
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    changeType: {
      type: String,
      enum: ['CREATE', 'UPDATE', 'DELETE', 'RESTORE', 'IMPORT'],
      required: true,
    },
    // Snapshot of changed fields: { fieldName: { before, after } }
    changes: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    // Full document snapshot after the change
    snapshot: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);
