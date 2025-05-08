CREATE DATABASE pi_transporte;

USE pi_transporte;

CREATE TABLE student (
    id INT AUTO_INCREMENT NOT NULL,
    student_name VARCHAR(80) NOT NULL,
    shift VARCHAR(10) NOT NULL,
    street VARCHAR(100) NOT NULL,
    house_number VARCHAR(5) NOT NULL,
    district VARCHAR(100),
    city VARCHAR(70) NOT NULL,
    geolocation VARCHAR(120),
    PRIMARY KEY (id)
);