import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerStatusCounts,
} from '../controllers/customerController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Customer status counts route
router.route('/status-counts').get(authorize('admin', 'manager'), getCustomerStatusCounts);

// Customer management routes
router
  .route('/')
  .get(authorize('admin', 'manager', 'agent'), getCustomers)
  .post(authorize('admin', 'manager', 'agent'), createCustomer);

router
  .route('/:id')
  .put(authorize('admin', 'manager'), updateCustomer)
  .delete(authorize('admin', 'manager'), deleteCustomer);

export default router;
