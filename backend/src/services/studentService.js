import * as queries from "../models/queries.js";

async function getStudentCoordinates(address) {
    const replaceWhiteSpaces = (string) => {
        return string.replace(/\s/gi, "+");
    }

    const base_url = "https://nominatim.openstreetmap.org"
    
    const treated_address = {
        street: replaceWhiteSpaces(`${address.house_number}+${address.street}`),
        city: replaceWhiteSpaces(address.city),
        district: replaceWhiteSpaces(address.district)
    }

    // observação: no nome da rua, colocar somente o nome, isto é sem "Rua"
    //             evitar sinais e pontuações também parece ter um efeito positivo
    const params = `street=${treated_address.street}&
                    city=${treated_address.city}&
                    county=${treated_address.district}&
                    country=Brasil&
                    format=geojson&
                    limit=1`;

    try {
        const api_response = await fetch(`${base_url}/search?${params}`, {
            headers: {"Content-type": "application/json; charset=utf-8"}
        });
        
        const data = await api_response.json();

        return { 
            lat: data.features[0].geometry.coordinates[1], 
            lgt: data.features[0].geometry.coordinates[0] 
        };
    } catch (error) {
        console.error("Houve um erro:", error);
        return null;
    }

}

const fetchStudents = async () => {
    return await queries.selectAllStudents();
}

const fetchStudentsByShift = async (shift) => {
    return await queries.selectStudentsByShift(shift);
}

const createStudent = async (studentData) => {
    const coordinates = await getStudentCoordinates(studentData);

    const completed_stdn_data = {
        ...studentData,
        geolocation: !coordinates ? null : `${coordinates.lat},${coordinates.lgt}`
    }

    return await queries.insertIntoStudent(completed_stdn_data);
}

const updateStudentInfo = async (id, newData) => {
    return await queries.updateStudentData(id, newData);
}

const removeStudent = async (id) => {
    return await queries.deleteStudentData(id);
}

export { fetchStudents, fetchStudentsByShift, createStudent, updateStudentInfo, removeStudent };