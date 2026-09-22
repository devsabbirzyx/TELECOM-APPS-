import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Import Routes
import authRoutes from './routes/auth.js';
import operatorRoutes from './routes/operators.js';
import offerRoutes from './routes/offers.js';
import paymentRoutes from './routes/payments.js';
import orderRoutes from './routes/orders.js';
import walletRoutes from './routes/wallet.js';
import referralRoutes from './routes/referrals.js';
import savedNumbersRoutes from './routes/savedNumbers.js';
import supportRoutes from './routes/support.js';
import notificationRoutes from './routes/notifications.js';
import profileRoutes from './routes/profile.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Mobixa API', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Mobixa REST API - Bangladesh Telecom SIM Offer Marketplace',
    version: '1.0.0',
    documentation: '/health'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/operators', operatorRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/saved-numbers', savedNumbersRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/admin', adminRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 OfferHut Backend Server running on port ${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/health`);
  console.log(`💳 bKash Payment Gateway: Official Hosted Mode Enabled\n`);
});

export default app;
