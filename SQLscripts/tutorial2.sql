-- conectarse a una DB
mysql -u root  -p -h localhost
-- el -h no hace falta, el sistema lo toma como localhost
-- para ejecutar un archivo con todos los scripts listos
-- puede agregar un > y la url del archivo




-- query anidado

INSERT INTO books(title, author_id, `year`)
    VALLUES(`El titulo`,
        (SELECT author_id FROM authors WHERE name = `Nombre Autor` LIMIT 1),
        1960
    )


