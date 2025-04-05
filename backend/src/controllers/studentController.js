import * as studentService from "../services/studentService.js";

const getStudents = async (req, res) => {
    try {
        const students = await studentService.fetchStudents();
        res.status(200).json(students);
    } catch {
        res.status(500).json({ message: 'Erro ao buscar alunos'});
    };
}

const getStudentsByShift = async (req, res) => {
    try {
        const students = await studentService.fetchStudentsByShift(req.params.shift);
        res.status(200).json(students);
    } catch {
        res.status(500).json({ message: 'Erro ao buscar alunos'});
    };
}

const postStudent = async (req, res) => {
    try {
        await studentService.createStudent(req.body);
        res.status(201).json({ message: 'Aluno adicionado com sucesso'});
    } catch {
        res.status(500).json({ message: 'Erro ao adicionar aluno'});
    };
}

const putStudent = async (req, res) => {
    try {
        await studentService.updateStudentInfo(req.params.id, req.body);
        res.status(200).json({ message: 'Dados do aluno atualizados com sucesso!' });
    } catch {
        res.status(500).json({ message: 'Erro ao atualizar dados do aluno'});
    }
}

const deleteStudent = async (req, res) => {
    try {
        await studentService.removeStudent(req.params.id);
        res.status(200).json({ message: 'Aluno excluído com sucesso!', id: req.params.id });
    } catch {
        res.status(500).json({ message: 'Erro ao excluir aluno' });
    }
}

export { getStudents, getStudentsByShift, postStudent, putStudent, deleteStudent }