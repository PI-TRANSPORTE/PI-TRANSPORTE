// import dotenv from "dotenv";

// dotenv.config();

const api_key = 'ADD_HERE_YOUR_API_KEY_TO_OPENROUTESERVICE';

//////////////////////////////////////////////////////////////////////////////////
function invertCoordinates(coords) {
    return [coords[1], coords[0]];
}

//////////////////////////////////////////////////////////////////////////////////
async function watchDriversPosition() {
    if ("geolocation" in navigator) {
        const coords = new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition((position, error) => {
                if (position) {
                    resolve([position.coords.latitude, position.coords.longitude]);  
                } else if (error) {
                    reject("Não foi possível obter as coordenadas do motorista");
                }
            });
        });

        return coords ;
    }

    return "Seu navegador não oferece suporte à geolocalização";
}

//////////////////////////////////////////////////////////////////////////////////
async function getStudentCoordinatesAndName(id) {
    const base_url = "http://localhost:3000";
    
    const name_and_coords = fetch(`${base_url}/api/students`)
        .then((response) => response.json())
        .then((students_list) => students_list.filter((student) => student.id === id))
        .then(function(student) { 
            return {
                name: student[0].student_name,
                coords: student[0].geolocation.split(",").map((axis) => parseFloat(axis))
            }
        });
    
    return name_and_coords;
}

//////////////////////////////////////////////////////////////////////////////////
async function myMap(driver_position, student_house, student_name) {
    const size = L.point(25, 25),
          driver_icon = L.divIcon({className: "driver-icon", iconSize: size}),
          student_house_icon = L.divIcon({className: "student-house-icon", iconSize: size});

    const begin = invertCoordinates(driver_position).toString(),
          end = invertCoordinates(student_house).toString();
    
    var map = L.map('map').setView(driver_position, 17);
    L.marker(driver_position, {icon: driver_icon}).addTo(map);
    L.marker(student_house, {icon: student_house_icon})
        .addTo(map)
        .bindPopup(`Casa de ${student_name}`)
        .openPopup();

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    const base_url = "https://api.openrouteservice.org/v2/directions/driving-car?";
    fetch(`${base_url}api_key=${api_key}&start=${begin}&end=${end}`)
        .then((response) => response.json())
        .then((data) => data.features[0].geometry.coordinates)
        .then((coords) => coords.map((coord) => invertCoordinates(coord)))
        .then((route) => L.polyline(route, {color: 'purple'}).addTo(map));
}

//////////////////////////////////////////////////////////////////////////////////////////////

async function main(id) {
    const driver_coords = await watchDriversPosition();
    const student = await getStudentCoordinatesAndName(id);

    if (typeof student === 'object') {
        myMap(driver_coords, student.coords, student.name);
    } else {
        document.getElementById("map").innerHTML = `Não foi possível encontrar um aluno com o id ${id}`;
    }
}

main(35);