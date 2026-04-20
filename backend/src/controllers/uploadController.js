const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');
const Patient = require('../models/Patient');
const AuditLog = require('../models/AuditLog');

const FIELD_MAP = {
  'name': 'name',
  'contact number': 'contactNumber',
  'contact': 'contactNumber',
  'phone': 'contactNumber',
  'mobile': 'contactNumber',
  'email': 'email',
  'age': 'age',
  'gender': 'gender',
  'blood group': 'bloodGroup',
  'address': 'address',
  'admit date': 'admitDate',
  'emergency contact': 'emergencyContact',
  'emergency contact name': 'emergencyContactName',
  'payor type': 'payorType',
  'social history': 'socialHistory',
  'medical history': 'medicalHistory',
  'allergies': 'allergies',
  'current medications': 'currentMedications',
  'medications': 'currentMedications',
  'reference': 'reference',
  'remarks': 'remarks',
  'review': 'review',
  "father's education proof": 'fathersEducationProof',
};

// @desc    Upload Excel/CSV and bulk insert patients
// @route   POST /api/upload/excel
exports.uploadExcel = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const filePath = req.file.path;
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: null });

    // Clean up temp file
    fs.unlink(filePath, () => {});

    const results = { success: 0, failed: 0, skipped: 0, errors: [] };
    const toInsert = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const mapped = {};

      for (const [col, val] of Object.entries(row)) {
        const key = FIELD_MAP[col.toLowerCase().trim()];
        if (key && val !== null && val !== '') {
          mapped[key] = val;
        }
      }

      if (!mapped.name || !mapped.contactNumber) {
        results.skipped++;
        results.errors.push({ row: i + 2, reason: 'Missing Name or Contact Number', data: row });
        continue;
      }

      // Parse age
      if (mapped.age) mapped.age = Number(mapped.age) || null;

      // Parse admit date
      if (mapped.admitDate) {
        const d = new Date(mapped.admitDate);
        mapped.admitDate = isNaN(d.getTime()) ? null : d;
      }

      mapped.createdBy = req.user._id;
      mapped.doctorAssigned = req.user._id;
      mapped.isSelfReported = false;
      toInsert.push(mapped);
    }

    if (toInsert.length > 0) {
      const inserted = await Patient.insertMany(toInsert, { ordered: false });
      results.success = inserted.length;

      // Bulk audit log
      const auditDocs = inserted.map((p) => ({
        patientId: p._id,
        changedBy: req.user._id,
        changeType: 'IMPORT',
        changes: {},
        snapshot: p.toObject(),
        ipAddress: req.ip,
      }));
      await AuditLog.insertMany(auditDocs, { ordered: false });
    }

    results.failed = rows.length - results.success - results.skipped;

    res.json({
      success: true,
      message: `Import complete: ${results.success} added, ${results.skipped} skipped.`,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export patients to Excel
// @route   GET /api/upload/export
exports.exportExcel = async (req, res, next) => {
  try {
    const { search, gender, ageMin, ageMax, admitFrom, admitTo } = req.query;

    const query = {
      isDeleted: false,
      $or: [{ createdBy: req.user._id }, { isSelfReported: true }],
    };

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

    const patients = await Patient.find(query)
      .populate('doctorAssigned', 'name')
      .lean();

    const rows = patients.map((p) => ({
      Name: p.name,
      'Contact Number': p.contactNumber,
      Email: p.email || '',
      Age: p.age || '',
      Gender: p.gender || '',
      'Blood Group': p.bloodGroup || '',
      Address: p.address || '',
      'Admit Date': p.admitDate ? new Date(p.admitDate).toLocaleDateString() : '',
      'Emergency Contact': p.emergencyContact || '',
      'Emergency Contact Name': p.emergencyContactName || '',
      'Payor Type': p.payorType || '',
      'Social History': p.socialHistory || '',
      'Medical History': p.medicalHistory || '',
      Allergies: p.allergies || '',
      'Current Medications': p.currentMedications || '',
      Reference: p.reference || '',
      Remarks: p.remarks || '',
      Review: p.review || '',
      "Father's Education Proof": p.fathersEducationProof || '',
      'Doctor Assigned': p.doctorAssigned?.name || '',
      'Created At': new Date(p.createdAt).toLocaleDateString(),
    }));

    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(rows);
    xlsx.utils.book_append_sheet(wb, ws, 'Patients');

    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=patients_${Date.now()}.xlsx`);
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};
