import connection from "../config/db.js";

async function selectAllStudents() {
    const [ data ] = await connection.query('SELECT * FROM `student`');
    return data;
}

async function selectStudentsByShift(shift) {
    const [ data ] = await connection.query('SELECT * FROM `student` WHERE `shift`=' + `"${shift}"`);
    return data;
}

async function insertIntoStudent(student) {
    return await connection.query(
        'INSERT INTO `student`(`shift`, `student_name`, `street`, `strt_number`, `district`, `city`)' + 
        `VALUES ("${student.shift}", "${student.name}", "${student.street}", "${student.strt_number}", "${student.district}", "${student.city}")`
    );
}

export { selectAllStudents, selectStudentsByShift, insertIntoStudent };