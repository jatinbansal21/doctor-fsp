const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { uploadExcel, exportExcel } = require('../controllers/uploadController');
const { protect, authorize } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv',
  ];
  if (allowed.includes(file.mimetype) || file.originalname.match(/\.(xlsx|xls|csv)$/i)) {
    cb(null, true);
  } else {
    cb(new Error('Only .xlsx, .xls, and .csv files are allowed.'), false);
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/excel', protect, authorize('doctor'), upload.single('file'), uploadExcel);
router.get('/export', protect, authorize('doctor'), exportExcel);

module.exports = router;
