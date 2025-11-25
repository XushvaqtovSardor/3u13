import express from 'express';
import adminAuthRoutes from './admin.auth.routes.js';
import adminRoutes from './admin.routes.js';
import clientRoutes from './client.routes.js';
import productRoutes from './product.routes.js';
import orderRoutes from './order.routes.js';
import operationRoutes from './operation.routes.js';
import statusRoutes from './status.routes.js';

const MainRouter = express.Router();

MainRouter.use('/api/v1/admin/auth', adminAuthRoutes);
MainRouter.use('/api/v1/admin', adminRoutes);
MainRouter.use('/api/v1/client', clientRoutes);
MainRouter.use('/api/v1/products', productRoutes);
MainRouter.use('/api/v1/orders', orderRoutes);
MainRouter.use('/api/v1/operations', operationRoutes);
MainRouter.use('/api/v1/statuses', statusRoutes);

export default MainRouter;
