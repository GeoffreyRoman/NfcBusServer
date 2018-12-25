-- Connaitre tous les numeros de bus qui passe à l'arret numero 12

SELECT DISTINCT route_short_name
FROM allData
WHERE idStop LIKE "12"