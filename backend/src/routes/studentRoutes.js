import express from 'express';
import * as studentController from '../controllers/studentController.js';

const router = express.Router();

router.get('/students', studentController.getStudents);
router.get('/students/:shift', studentController.getStudentsByShift);
router.get('/students/coordinates/:id', studentController.getStudentHouseCoordinates);

router.post('/students', studentController.postStudent);

router.patch('/students/:id', studentController.putStudent);

router.delete('/students/:id', studentController.deleteStudent);

export default router;