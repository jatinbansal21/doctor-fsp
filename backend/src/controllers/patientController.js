const Patient = require('../models/Patient');
const AuditLog = require('../models/AuditLog');

const logAudit = async ({ patientId, changedBy, changeType, changes, snapshot, ipAddress }) => {
  try {
    await AuditLog.create({ patientId, changedBy, changeType, changes, snapshot, ipAddress });
  } catch (e) {
    console.error('Audit log error:', e.message);
  }
};

const getDiff = (before, after) => {
  const keys = new Set([...Object.keys(before || {}), ...Object.keys(after || {})]);
  const diff = {};
  for (const key of keys) {
    if (JSON.stringify(before?.[key]) !== JSON.stringify(after?.[key])) {
      diff[key] = { before: before?.[key], after: after?.[key] };
    }
  }
  return diff;
};

// DOCTOR-ONLY fields (patients cannot write these)
const DOCTOR_ONLY_FIELDS = ['payorType','socialHistory','medicalHistory','reference','remarks','review','fathersEducationProof','doctorAssigned','isDeleted'];

// @desc    Get all patients (paginated, filterable, searchable)
// @route   GET /api/patients
exports.getPatients = async (req, res, next) => {
  try {
    const {
      search, gender, ageMin, ageMax, admitFrom, admitTo,
      page = 1, limit = 10, sort = '-createdAt', showDeleted
    } = req.query;

    const query = {};

    // Only doctors can see deleted
    if (req.user.role === 'doctor' && showDeleted === 'true') {
      query.isDeleted = true;
    } else {
      query.isDeleted = false;
    }

    // Patient role can only see their own record
    if (req.user.role === 'patient') {
      query.patientUserId = req.user._id;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { contactNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (gender) query.gender = gender;
    if (ageMin || ageMax) {
      query.age = {};
      if (ageMin) query.age.$gte = Number(ageMin);
      if (ageMax) query.age.$lte = Number(ageMax);
    }
    if (admitFrom || admitTo) {
      query.admitDate = {};
      if (admitFrom) query.admitDate.$gte = new Date(admitFrom);
      if (admitTo) query.admitDate.$lte = new Date(admitTo);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Patient.countDocuments(query);
    const patients = await Patient.find(query)
      .populate('doctorAssigned', 'name email')
      .populate('createdBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      data: {
        patients,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single patient
// @route   GET /api/patients/:id
exports.getPatient = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .populate('doctorAssigned', 'name email')
      .populate('createdBy', 'name email');

    if (!patient || (patient.isDeleted && req.user.role !== 'doctor')) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }

    if (req.user.role === 'patient' && String(patient.patientUserId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.json({ success: true, data: patient });
  } catch (error) {
    next(error);
  }
};

// @desc    Create patient
// @route   POST /api/patients
exports.createPatient = async (req, res, next) => {
  try {
    const { name, contactNumber } = req.body;
    if (!name || !contactNumber) {
      return res.status(400).json({ success: false, message: 'Name and contact number are required.' });
    }

    const patientData = { ...req.body, createdBy: req.user._id };

    // Patients cannot set doctor-only fields
    if (req.user.role === 'patient') {
      DOCTOR_ONLY_FIELDS.forEach((f) => delete patientData[f]);
      patientData.patientUserId = req.user._id;
    }

    const patient = await Patient.create(patientData);

    await logAudit({
      patientId: patient._id,
      changedBy: req.user._id,
      changeType: 'CREATE',
      changes: {},
      snapshot: patient.toObject(),
      ipAddress: req.ip,
    });

    res.status(201).json({ success: true, message: 'Patient created successfully.', data: patient });
  } catch (error) {
    next(error);
  }
};

// @desc    Update patient
// @route   PUT /api/patients/:id
exports.updatePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient || patient.isDeleted) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }

    if (req.user.role === 'patient' && String(patient.patientUserId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const updateData = { ...req.body };

    // Patients cannot update doctor-only fields
    if (req.user.role === 'patient') {
      DOCTOR_ONLY_FIELDS.forEach((f) => delete updateData[f]);
    }

    const before = patient.toObject();
    const updated = await Patient.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate('doctorAssigned', 'name email');

    await logAudit({
      patientId: patient._id,
      changedBy: req.user._id,
      changeType: 'UPDATE',
      changes: getDiff(before, updated.toObject()),
      snapshot: updated.toObject(),
      ipAddress: req.ip,
    });

    res.json({ success: true, message: 'Patient updated successfully.', data: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Soft delete patient
// @route   DELETE /api/patients/:id
exports.deletePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient || patient.isDeleted) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }

    patient.isDeleted = true;
    patient.deletedAt = new Date();
    await patient.save();

    await logAudit({
      patientId: patient._id,
      changedBy: req.user._id,
      changeType: 'DELETE',
      changes: {},
      snapshot: patient.toObject(),
      ipAddress: req.ip,
    });

    res.json({ success: true, message: 'Patient archived successfully.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Restore soft-deleted patient
// @route   PATCH /api/patients/:id/restore
exports.restorePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient || !patient.isDeleted) {
      return res.status(404).json({ success: false, message: 'Archived patient not found.' });
    }

    patient.isDeleted = false;
    patient.deletedAt = null;
    await patient.save();

    await logAudit({
      patientId: patient._id,
      changedBy: req.user._id,
      changeType: 'RESTORE',
      changes: {},
      snapshot: patient.toObject(),
      ipAddress: req.ip,
    });

    res.json({ success: true, message: 'Patient restored successfully.', data: patient });
  } catch (error) {
    next(error);
  }
};

// @desc    Get patient audit history
// @route   GET /api/patients/:id/history
exports.getPatientHistory = async (req, res, next) => {
  try {
    const logs = await AuditLog.find({ patientId: req.params.id })
      .populate('changedBy', 'name email role')
      .sort('-createdAt')
      .limit(50);

    res.json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
};
