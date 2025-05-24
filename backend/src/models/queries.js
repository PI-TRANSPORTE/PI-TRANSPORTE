import connection from "../config/db.js";

async function selectAllStudents() {
    const [ data ] = await connection.query('SELECT * FROM `student`');
    return data;
}

async function selectStudentsByShift(shift) {
    const [ data ] = await connection.query('SELECT * FROM `student` WHERE `shift`=' + `"${shift}"`);
    return data;
}

async function selectStudentGeolocation(id) {
    const [ raw_data ] = await connection.query('SELECT * FROM `student` WHERE `id`=' + `${id}`);
    const student_house_coordinates = {
        lat: raw_data[0].lat,
        lgt: raw_data[0].lgt
    }
    
    return student_house_coordinates;
}

async function insertIntoStudent(student) {
    const sql = 'INSERT INTO `student`(`shift`, `student_name`, `street`, `house_number`, `district`, `city`, `lat`, `lgt`) ' + 
        `VALUES ("${student.shift}", "${student.name}", "${student.street}", "${student.house_number}", "${student.district}", "${student.city}", "${student.lat}", "${student.lgt}")`;
        
    return await connection.execute(sql);
}

async function updateStudentData(id, newData) {
    const attributes = Object.keys(newData);
    const values = Object.values(newData);
    let queryResponse;
    
    for (let i = 0, sql; i < attributes.length; i++) {
        let query_values = [values[i], id];
        sql = 'UPDATE `student` SET' + `\`${attributes[i]}\`` + '= ? WHERE `id` = ? LIMIT 1';

        queryResponse = await connection.execute(sql, query_values);
    }

    return queryResponse;
}

async function deleteStudentData(id) {
    const sql = 'DELETE FROM `student` WHERE `id` = ? LIMIT 1';
    const [result] = await connection.execute(sql, [id]);
    
    return result;
}

export { selectAllStudents, selectStudentsByShift, selectStudentGeolocation, insertIntoStudent, updateStudentData, deleteStudentData };