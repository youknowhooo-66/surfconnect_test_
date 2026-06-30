import express from 'express';
import {
  createClass,
  listAllClasses,
  listAllBookings,
  listInstructors,
  getAdminMetrics,
  listInstructorClasses,
  markAttendance,
  listAvailableClasses,
  createBooking,
  getWeather,
  listStudentBookings
} from '../controllers/classController.js';
import { authenticateToken, checkRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Weather - Public/Authenticated but general
router.get('/weather', authenticateToken, getWeather);

// STUDENT routes
router.get('/student/classes', authenticateToken, checkRole(['STUDENT']), listAvailableClasses);
router.get('/student/bookings', authenticateToken, checkRole(['STUDENT']), listStudentBookings);
router.post('/student/bookings', authenticateToken, checkRole(['STUDENT']), createBooking);

// INSTRUCTOR routes
router.get('/instructor/classes', authenticateToken, checkRole(['INSTRUCTOR']), listInstructorClasses);
router.post('/instructor/attendance', authenticateToken, checkRole(['INSTRUCTOR']), markAttendance);

// ADMIN routes
router.post('/admin/classes', authenticateToken, checkRole(['ADMIN']), createClass);
router.get('/admin/classes', authenticateToken, checkRole(['ADMIN']), listAllClasses);
router.get('/admin/bookings', authenticateToken, checkRole(['ADMIN']), listAllBookings);
router.get('/admin/instructors', authenticateToken, checkRole(['ADMIN']), listInstructors);
router.get('/admin/metrics', authenticateToken, checkRole(['ADMIN']), getAdminMetrics);

export default router;
