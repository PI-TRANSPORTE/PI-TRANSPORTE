// import dotenv from "dotenv";

// dotenv.config();

const api_key = 'ADD_HERE_YOUR_API_KEY_TO_OPENROUTESERVICE';

//////////////////////////////////////////////////////////////////////////////////
/* 
    As coordenadas geográficas geralmente tem o formato "latitude, longitude", 
    mas a api do openrouteservice precisa do inverso; por isso a função abaixo existe;
*/
function invertCoordinates(coords) {
    return [coords[1], coords[0]];
}

//////////////////////////////////////////////////////////////////////////////////
/*
    A função abaixo verifica a posição do motorista a cada 1,5 segundos;
*/
async function watchDriversPosition(updateMapRoute) {
    if ("geolocation" in navigator) {
        function success(position) {
            const driver_coords = [position.coords.latitude, position.coords.longitude];
            updateMapRoute(driver_coords);
        }

        function error() {
            return "Não foi possível obter as coordenadas do motorista";
        }

        const options = {
            maximumAge: 1500
        }

        navigator.geolocation.watchPosition(success, error, options);
    }

    return "Seu navegador não oferece suporte à geolocalização";
}

//////////////////////////////////////////////////////////////////////////////////
/*
    A função abaixo faz uma chamada a nossa api, ao endpoint de listagem de todos os usuários, 
    depois procura por um id específico, e então retorna o nome deste aluno e as coordenadas da casa dele.
*/
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
/*
    Esta função cria o mapa usando a biblioteca leaflet.js,e adiciona marcadores e
    linhas nesse mapa para ilustrar as posições e as rotas.
*/
async function myMap(student_house, student_name) {
    const size = L.point(25, 25),
          driver_icon = L.divIcon({className: "driver-icon", iconSize: size}),
          student_house_icon = L.divIcon({className: "student-house-icon", iconSize: size});
    
    const base_url = "https://api.openrouteservice.org/v2/directions/driving-car?";

    var begin = null,
        end = invertCoordinates(student_house).toString();
    
    var map = L.map('map');

    var driver_marker = null,
        route_vector = null;

    // WHATCH DRIVERS POSITION
    watchDriversPosition((driver_position) => {
        if (driver_marker && route_vector) {
            map.removeLayer(driver_marker);
            route_vector.remove();
        }
        begin = invertCoordinates(driver_position).toString();

        map.setView(driver_position, 17);
        driver_marker = L.marker(driver_position, {icon: driver_icon}).addTo(map);

        // CHAMADA A API DO OPENROUTESERVICE
        fetch(`${base_url}api_key=${api_key}&start=${begin}&end=${end}`)
        .then((response) => response.json())
        .then((data) => data.features[0].geometry.coordinates)
        .then((coords) => coords.map((coord) => invertCoordinates(coord)))
        .then((route) => route_vector = L.polyline(route, {color: 'purple'}).addTo(map));
    });

    L.marker(student_house, {icon: student_house_icon})
        .addTo(map)
        .bindPopup(`Casa de ${student_name}`)
        .openPopup();

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
}

//////////////////////////////////////////////////////////////////////////////////////////////
async function main(student_id) {
    const student = await getStudentCoordinatesAndName(student_id);

    if (typeof student === 'object') {
        myMap(student.coords, student.name);
    } else {
        document.getElementById("map").innerHTML = `Não foi possível encontrar um aluno com o id ${id}`;
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////
main(35);