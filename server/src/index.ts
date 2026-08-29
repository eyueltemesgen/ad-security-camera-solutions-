import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { config } from './config';
import { HttpError } from './utils';
import { requireAuth, requireAdmin } from './auth';

import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import serviceRoutes from './routes/services';
import orderRoutes from './routes/orders';
import cartRoutes from './routes/cart';
import serviceRequestRoutes from './routes/serviceRequests';
import cmsRoutes from './routes/cms';
import adminRoutes from './routes/admin';
import uploadRoutes from './routes/uploads';

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

// Static uploads with safe HTML-escaped content types
app.use('/uploads', express.static(path.resolve(config.uploadDir), {
  fallthrough: true,
  setHeaders: (res, filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.svg') res.setHeader('Content-Type', 'image/svg+xml');
    if (ext === '.pdf') res.setHeader('Content-Type', 'application/pdf');
  },
}));

// Ensure upload directory exists
fs.mkdirSync(path.resolve(config.uploadDir), { recursive: true });

// Health check
app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'ad-security', time: new Date().toISOString() }));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/service-requests', serviceRequestRoutes);
app.use('/api/cms', cmsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/uploads', uploadRoutes);

// 404 for unknown API routes
app.use('/api', (_req, _res, next) => next(new HttpError(404, 'API endpoint not found')));

// Central error handler
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const e = err instanceof HttpError ? err : new HttpError(500, err instanceof Error ? err.message : 'Unexpected server error');
  if (e.status >= 500) console.error('[server error]', e.message);
  res.status(e.status).json({ error: e.message });
});

const server = app.listen(config.port, () => {
  console.log(`AD Security API listening on http://localhost:${config.port}`);
});

// Graceful shutdown
process.on('SIGTERM', () => server.close(() => process.exit(0)));
process.on('SIGINT', () => server.close(() => process.exit(0)));

export default app;