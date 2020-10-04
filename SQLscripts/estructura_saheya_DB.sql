DROP DATABASE IF EXISTS saheyadev_V01;
CREATE DATABASE saheyadev_V01;
USE saheyadev_v01;

CREATE TABLE `usuarios` (
    `usuario_id` int(5) unsigned NOT NULL AUTO_INCREMENT,
    `nombres` varchar(30) NOT NULL,
    `apellidos` varchar(30) NOT NULL,
    `fecha_nacimiento` date DEFAULT NULL,
    `num_identificacion` int(11) UNSIGNED UNIQUE NOT NULL,
    `fecha_ingreso` date DEFAULT NULL,
    `telefono_ppal` int(12) UNIQUE DEFAULT NULL,
    `email` varchar(100) DEFAULT NULL,
    `rol` tinyint(1) NOT NULL DEFAULT '1',
    `capital` int(10) NOT NULL DEFAULT '0',
    `en_deuda` int(10) NOT NULL DEFAULT '0',
    PRIMARY KEY (`usuario_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- TIPOS DE USUARIOS
-- 1 comun
-- 2 secretario
-- 3 presidente
-- 4 tesorero
-- 5 fiscal

CREATE TABLE `capital` (
`total_actual` int(11) UNSIGNED NOT NULL,
`total_anterior` int(11) UNSIGNED NOT NULL,
`motivo_movimiento` tinyint(1) NOT NULL,
`transaccion_id` int(10) unsigned NOT NULL,
`monto` int(10) NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `transacciones`(
`transaccion_id` int(5) unsigned NOT NULL AUTO_INCREMENT,
`usuario_id` int(10) unsigned NOT NULL,
`fecha_realizacion` date NOT NULL,
`fecha_registro` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
`monto` int(10) NOT NULL,
`motivo` tinyint(1) NOT NULL,
PRIMARY KEY (`transaccion_id`)) ENGINE=MyISAM DEFAULT CHARSET=utf8;

/* MOTIVO
1 aporte a capital
2 abono a deuda
3 intereses */

CREATE TABLE `prestamos`(
`prestamo_id` int(5) unsigned NOT NULL AUTO_INCREMENT,
`fecha_inicial` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
`num_cuotas` tinyint(3) NOT NULL,
`cuotas_pagadas` tinyint(3) NOT NULL DEFAULT '0',
`deudor_id` int(5) unsigned NOT NULL,
`relacion_coodeudor` int(5) unsigned NOT NULL,
`estado` tinyint(1) NOT NULL DEFAULT '1',
PRIMARY KEY (`prestamo_id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/* ESTADO
1 pagando
2 finalizado */

CREATE TABLE `relaciones_coodeudores`(
`id_relacion` int(5) unsigned NOT NULL AUTO_INCREMENT,
`id_prestamo` int(5) unsigned NOT NULL,
`id_codeudor` int(5) unsigned NOT NULL,
`monto_avalado` int(10) NOT NULL,
PRIMARY KEY (`id_relacion`)) ENGINE=InnoDB DEFAULT CHARSET=utf8;