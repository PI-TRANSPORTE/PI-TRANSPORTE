import * as queries from "../models/queries.js";

const fetchStudents = async (shift = null) => {
    return await queries.selectAllStudents();
}

const fetchStudentsByShift = async (shift) => {
    return await queries.selectStudentsByShift(shift);
}

const createStudent = async (studentData) => {
    return await queries.insertIntoStudent(studentData);
}

export { fetchStudents, fetchStudentsByShift, createStudent };