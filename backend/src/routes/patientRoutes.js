const express = require('express');
const router = express.Router();
const {
  getPatients, getPatient, createPatient, updatePatient,
  deletePatient, restorePatient, getPatientHistory, getMySoc,
} = require('../controllers/patientController');
const { protect, authorize, isDoctor, isPatient } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Patients
 *   description: Patient management (doctor only for write operations)
 */

router.get('/', isDoctor, getPatients);
router.post('/', createPatient);
router.get('/my-soc', isPatient, getMySoc);

router.get('/:id', getPatient);
router.put('/:id', updatePatient);
router.delete('/:id', isDoctor, deletePatient);
router.patch('/:id/restore', isDoctor, restorePatient);
router.get('/:id/history', isDoctor, getPatientHistory);

module.exports = router;
