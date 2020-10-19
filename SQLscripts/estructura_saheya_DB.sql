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
`comentario` varchar(150) DEFAULT NULL,
PRIMARY KEY (`transaccion_id`)) ENGINE=MyISAM DEFAULT CHARSET=utf8;

/* MOTIVO
1 aporte a capital
2 abono a deuda
3 intereses
4 desembolso prestamo */

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

/*
cuota_num = 0 es el desembolso
*/
CREATE TABLE `transacciones_prestamos`(
`id_transaccion` int unsigned NOT NULL AUTO_INCREMENT,
`monto_total` int unsigned NOT NULL,
`prestamo_id` int unsigned NOT NULL,
`cuota_numero` tinyint(3) NOT NULL DEFAULT '0',
`cuotas_restantes`  tinyint(3) NOT NULL,
`interes` int unsigned NOT NULL,
`abono` int unsigned NOT NULL,
`por_pagar` int unsigned NOT NULL,
PRIMARY KEY (`id_transaccion`)) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4;

/* MOTIVO
1 aporte a capital
2 abono a deuda
3 intereses
*/

INSERT INTO transacciones(usuario_id,fecha_realizacion,monto,motivo,comentario)
VALUES 
(35,'2018-08-15', 35000,1,null),
(35,'2018-08-20', 200000, 2, null),
(35, '2018-08-20', 35000, 1, null),
(35, '2018-09-07', 200000, 2, null),
(35, '2018-09-07', 35000, 1, null),
(35,'2018-10-13', 200000,2, null),
(35, '2018-10-13',35000,1,'Entregado en efectivo a la monita'),
(35, '2018-11-25', 35000, 1, 'el patroncito estaba chinchoso lol');

/* ESTADO
1 pagando
2 finalizado */

INSERT INTO relaciones_coodeudores(id_prestamo,id_codeudor,monto_avalado)
VALUES (1,34,800000);

INSERT INTO prestamos(num_cuotas, cuotas_pagadas, deudor_id, relacion_coodeudor, estado)
VALUES
(12,6,35,1,1);

INSERT INTO transacciones_prestamos(monto_total,prestamo_id,cuota_numero,cuotas_restantes,interes,abono,por_pagar)
VALUES
(0,1,0,12,0,0,2800000),
(207000,1,1,11,7000,200000,2600000),
(206500,1,2,10,6500,200000,2800000),
(204800,1,3,9,4800,200000,2800000),
(204000,1,4,8,4000,200000,2800000),
(203800,1,5,7,3800,200000,2800000),
(203600,1,6,6,3600,200000,2800000);