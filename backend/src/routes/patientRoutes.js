const express = require('express');
const router = express.Router();
const {
  getPatients, getPatient, createPatient, updatePatient,
  deletePatient, restorePatient, getPatientHistory,
} = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Patients
 *   description: Patient management (doctor only for write operations)
 */

router.get('/', getPatients);
router.post('/', createPatient);

router.get('/:id', getPatient);
router.put('/:id', updatePatient);
router.delete('/:id', authorize('doctor'), deletePatient);
router.patch('/:id/restore', authorize('doctor'), restorePatient);
router.get('/:id/history', authorize('doctor'), getPatientHistory);

module.exports = router;
