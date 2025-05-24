import * as queries from "../models/queries.js";

async function getStudentCoordinates(address) {
    const replaceWhiteSpaces = (string) => {
        return string.replace(/\s/gi, "+");
    }

    // nominatim.openstreetmap.org/search?street=1130+rua+ana+profetisma+da+silva&city=hortolandia&state=sao+paulo&country=brasil&format=geojson&limit=1
    const base_url = "https://nominatim.openstreetmap.org/"
    
    const treated_address = {
        street: replaceWhiteSpaces(`${address.house_number}+${address.street}`),
        city: replaceWhiteSpaces(address.city),
        district: replaceWhiteSpaces(address.district)
    }

    // observação: no nome da rua, colocar somente o nome, isto é sem "Rua"
    //             evitar sinais e pontuações também parece ter um efeito positivo
    const params = `street=${treated_address.street}&` + 
                    `county=${treated_address.district}&` +
                    `city=${treated_address.city}&` +
                    `country=brasil&` + 
                    `format=geojson&` +
                    `limit=1`;

    try {
        const api_response = await fetch(`${base_url}search?${params}`);

        const data = await api_response.json();

        return {
            lat: data.features[0].geometry.coordinates[1],
            lgt: data.features[0].geometry.coordinates[0]
        }
    } catch (error) {
        return {
            lat: null,
            lgt: null
        };
    }

}

const fetchStudents = async () => {
    return await queries.selectAllStudents();
}

const fetchStudentsByShift = async (shift) => {
    return await queries.selectStudentsByShift(shift);
}

const fetchStudentGeolocation = async (id) => {
    return await queries.selectStudentGeolocation(id);
}

const createStudent = async (studentData) => {
    var coordinates = await getStudentCoordinates(studentData);

    const completed_stdn_data = {
        ...studentData,
        lat: coordinates.lat.toString(),
        lgt: coordinates.lgt.toString()
    }

    return await queries.insertIntoStudent(completed_stdn_data);
}

const updateStudentInfo = async (id, newData) => {
    return await queries.updateStudentData(id, newData);
}

const removeStudent = async (id) => {
    return await queries.deleteStudentData(id);
}

export { fetchStudents, fetchStudentsByShift, fetchStudentGeolocation, createStudent, updateStudentInfo, removeStudent };