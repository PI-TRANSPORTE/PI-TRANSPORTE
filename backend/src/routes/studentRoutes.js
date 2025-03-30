import express from 'express';
import * as studentController from '../controllers/studentController.js';

const router = express.Router();

router.get('/students', studentController.getStudents);
router.get('/students/:shift', studentController.getStudentsByShift);

router.post('/students', studentController.addStudent);

export default router;