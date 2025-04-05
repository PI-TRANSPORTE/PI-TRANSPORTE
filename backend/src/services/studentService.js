import * as queries from "../models/queries.js";

const fetchStudents = async () => {
    return await queries.selectAllStudents();
}

const fetchStudentsByShift = async (shift) => {
    return await queries.selectStudentsByShift(shift);
}

const createStudent = async (studentData) => {
    return await queries.insertIntoStudent(studentData);
}

const updateStudentInfo = async (id, newData) => {
    return await queries.updateStudentData(id, newData);
}

const removeStudent = async (id) => {
    return await queries.deleteStudentData(id);
}

export { fetchStudents, fetchStudentsByShift, createStudent, updateStudentInfo, removeStudent };