import * as studentService from "../services/studentService.js";

const getStudents = async (req, res) => {
    try {
        const students = await studentService.fetchStudents();
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar alunos'});
    };
}

const getStudentsByShift = async (req, res) => {
    try {
        const students = await studentService.fetchStudentsByShift(req.params.shift);
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar alunos'});
    };
}

const addStudent = async (req, res) => {
    try {
        const students = await studentService.createStudent(req.body);
        res.status(201).json(students);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao adicionar aluno'});
    };
}

export { getStudents, getStudentsByShift, addStudent }