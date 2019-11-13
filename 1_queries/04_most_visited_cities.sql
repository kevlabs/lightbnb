SELECT p.city, count(*)
FROM properties p
JOIN reservations r ON p.id = r.property_id
GROUP BY p.city
ORDER BY count(*) DESC;