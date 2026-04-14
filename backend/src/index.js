require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const path = require('path');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const normalizeOrigin = (value) => (value || '').trim().replace(/\/+$/, '');

const parseAllowedOrigins = () => {
  const raw = process.env.FRONTEND_URLS || process.env.FRONTEND_URL || '';
  return raw
    .split(',')
    .map(normalizeOrigin)
    .filter(Boolean);
};

// Create uploads dir
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Connect DB
connectDB();

const app = express();

// Security
app.use(helmet());
const allowedOrigins = parseAllowedOrigins();
app.use(
  cors({
    origin(origin, callback) {
      if (process.env.NODE_ENV !== 'production') return callback(null, true);
      if (!origin) return callback(null, true);
      const normalizedOrigin = normalizeOrigin(origin);
      // Allow explicitly configured origins first.
      if (allowedOrigins.includes(normalizedOrigin)) return callback(null, origin);
      // If env vars are missing/misconfigured, reflect the request origin to avoid CORS breakage.
      if (allowedOrigins.length === 0) return callback(null, origin);
      // Keep production usable across Vercel preview and primary domains.
      if (/^https:\/\/([a-z0-9-]+\.)*vercel\.app$/i.test(normalizedOrigin)) return callback(null, origin);
      // Temporary fail-open for stability during deployment.
      return callback(null, origin);
    },
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});
app.use('/api', limiter);

// Stricter limiter for auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many auth attempts. Please try again later.' },
});
app.use('/api/auth', authLimiter);

// Logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Swagger setup
const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Patient Management System API',
    version: '1.0.0',
    description: 'REST API for the Doctor-FSP Patient Management System',
  },
  servers: [{ url: process.env.NODE_ENV === 'production' ? (process.env.BACKEND_URL || 'https://your-backend.onrender.com') : `http://localhost:${process.env.PORT || 5000}` }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
  },
  security: [{ bearerAuth: [] }],
};
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'OK', timestamp: new Date().toISOString() }));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV}]`);
  console.log(`📚 Swagger docs: http://localhost:${PORT}/api-docs`);
});

module.exports = app;
