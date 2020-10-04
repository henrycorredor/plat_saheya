// borra si existe, la crea y la activa
DROP DATABASE IF EXISTS pruebaplatzi;

CREATE DATABASE pruebaplatzi;
USE pruebaplatzi;

// crear una tabla con todas los campos
// las tablas que crecen lento pueden hacerse en InnoDB, son robustas
// crecen rapido, acceden a disco mucho y se usan mucho pueden ser MyISAM
// buena practica: la tabla se llama como el plural de lo que contiene
// unsigned significa que no puede ser negativo, se ahorra el bit que lo marca como negativo
// varchar toca especificar el numero de letras
// double(6,2) quiere decir que es una cifra con un decimal, seis digitos a la izquierda y dos a la derecha

DESC tabla

// esto muestra una descripcion de la estructura de la tabla
// UNIQUE muestra que el valor de ese campo debe ser único 
// DATETIME una fecha normal
// TIMESTAMP numero de segundos desde 1 de enero de 1970
// CURRENT_TIMESTAMP devuelve el valor del momento actual


CREATE TABLE IF NOT EXISTS `authors` (
  `author_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `nationality` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`author_id`),
  UNIQUE KEY `uniq_author` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=193 DEFAULT CHARSET=utf8;


CREATE TABLE IF NOT EXISTS `books` (
  `book_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `author_id` int(10) unsigned DEFAULT NULL,
  `title` varchar(100) NOT NULL,
  `year` int(11) NOT NULL DEFAULT '1900',
  `language` varchar(2) NOT NULL COMMENT 'ISO 639-1 Language code (2 chars)',
  `cover_url` varchar(500) DEFAULT NULL,
  `price` double(6,2) DEFAULT NULL,
  `sellable` tinyint(1) NOT NULL DEFAULT '0',
  `copies` int(11) NOT NULL DEFAULT '1',
  `description` text,
  PRIMARY KEY (`book_id`),
  UNIQUE KEY `book_language` (`title`,`language`)
) ENGINE=InnoDB AUTO_INCREMENT=199 DEFAULT CHARSET=utf8;


CREATE TABLE `clients` (
  `client_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `birthdate` date DEFAULT NULL,
  `gender` enum('M','F') DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`client_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=101 DEFAULT CHARSET=utf8;


CREATE TABLE `transactions` (
  `transaction_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `book_id` int(10) unsigned NOT NULL,
  `client_id` int(10) unsigned NOT NULL,
  `type` enum('lend','sell') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modified_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `finished` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`transaction_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

// un buen editor seria este: https://mockaroo.com/


INSERT INTO tabla(columna1, columna2) VALUES (valor1, valor2);

// se pueden insertar muchos valores a la vez en una sola consulta, todas separadas por una coma.
// Se aconseja hacer vertidos de tuplas de 50 en 50

INSERT INTO `authors` VALUES (1,'Sam Altman','USA'),
(2,'Freddy Vega','COL'),
(27,'Andy Oram',NULL),
(28,'Terence Tao',"AUS"),
(29,'Drew Conway',"USA"),
(30,'Nate Silver',"USA"),
(192,'Charles Dickens',"ENG");

// cuando se presenta un valor UNIQUE repetido, se puede usar lo siguiente:
// ON DUPLICATE KEY UPDATE SET email = ''
// cuando termina con /G en vez de punto y coma, se muestra en columnas todas pispas

INSERT INTO `books` VALUES (1,1,'The Startup Playbook',2013,'en',NULL,10.00,1,5,'Advice from the experts'),
(2,1,'The Startup Playbook',2014,'es',NULL,10.00,1,5,'Consejo de los expertos, traducido por Platzi'),
(3,3,'Estudio en escarlata',1887,'es',NULL,5.00,1,10,'La primera novela de Sherlock Holmes'),
(4,6,'Wallander: Asesinos sin rostro',1991,'es',NULL,15.00,1,3,'');


INSERT INTO `clients` VALUES (1,'Maria Dolores Gomez','Maria Dolores.95983222J@random.names','1971-06-06','F',1,'2018-04-09 16:51:30'),
(2,'Adrian Fernandez','Adrian.55818851J@random.names','1970-04-09','M',1,'2018-04-09 16:51:30'),
(100,'Jose Hidalgo','Jose.05903641R@random.names','1973-08-13','M',1,'2018-04-09 16:51:31');

