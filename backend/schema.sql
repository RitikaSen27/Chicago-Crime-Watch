-- Chicago Crime Hotspot Dashboard — database schema
-- Run this whole file in MySQL Workbench (or `mysql -u root -p < schema.sql`)
-- to recreate the database structure from scratch.

CREATE DATABASE IF NOT EXISTS chicago_crime;
USE chicago_crime;

CREATE TABLE IF NOT EXISTS community_areas (
    area_number INT PRIMARY KEY,
    area_name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS crimes (
    id VARCHAR(20) PRIMARY KEY,
    case_number VARCHAR(20),
    crime_date DATETIME NOT NULL,
    primary_type VARCHAR(100),
    description VARCHAR(255),
    location_description VARCHAR(255),
    arrest BOOLEAN,
    domestic BOOLEAN,
    community_area INT,
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    FOREIGN KEY (community_area) REFERENCES community_areas(area_number)
);

CREATE TABLE IF NOT EXISTS news_cache (
    id INT AUTO_INCREMENT PRIMARY KEY,
    area_name VARCHAR(100) NOT NULL,
    title VARCHAR(500),
    description TEXT,
    url VARCHAR(500),
    source_name VARCHAR(200),
    published_at DATETIME,
    fetched_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seed: the 77 official Chicago community areas
INSERT IGNORE INTO community_areas (area_number, area_name) VALUES
(1,'Rogers Park'),(2,'West Ridge'),(3,'Uptown'),(4,'Lincoln Square'),
(5,'North Center'),(6,'Lake View'),(7,'Lincoln Park'),(8,'Near North Side'),
(9,'Edison Park'),(10,'Norwood Park'),(11,'Jefferson Park'),(12,'Forest Glen'),
(13,'North Park'),(14,'Albany Park'),(15,'Portage Park'),(16,'Irving Park'),
(17,'Dunning'),(18,'Montclare'),(19,'Belmont Cragin'),(20,'Hermosa'),
(21,'Avondale'),(22,'Logan Square'),(23,'Humboldt Park'),(24,'West Town'),
(25,'Austin'),(26,'West Garfield Park'),(27,'East Garfield Park'),(28,'Near West Side'),
(29,'North Lawndale'),(30,'South Lawndale'),(31,'Lower West Side'),(32,'Loop'),
(33,'Near South Side'),(34,'Armour Square'),(35,'Douglas'),(36,'Oakland'),
(37,'Fuller Park'),(38,'Grand Boulevard'),(39,'Kenwood'),(40,'Washington Park'),
(41,'Hyde Park'),(42,'Woodlawn'),(43,'South Shore'),(44,'Chatham'),
(45,'Avalon Park'),(46,'South Chicago'),(47,'Burnside'),(48,'Calumet Heights'),
(49,'Roseland'),(50,'Pullman'),(51,'South Deering'),(52,'East Side'),
(53,'West Pullman'),(54,'Riverdale'),(55,'Hegewisch'),(56,'Garfield Ridge'),
(57,'Archer Heights'),(58,'Brighton Park'),(59,'McKinley Park'),(60,'Bridgeport'),
(61,'New City'),(62,'West Elsdon'),(63,'Gage Park'),(64,'Clearing'),
(65,'West Lawn'),(66,'Chicago Lawn'),(67,'West Englewood'),(68,'Englewood'),
(69,'Greater Grand Crossing'),(70,'Ashburn'),(71,'Auburn Gresham'),(72,'Beverly'),
(73,'Washington Heights'),(74,'Mount Greenwood'),(75,'Morgan Park'),(76,'OHare'),
(77,'Edgewater');
