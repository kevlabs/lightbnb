SELECT p.id, p.title, p.cost_per_night, avg(pr.rating)
FROM properties p
JOIN property_reviews pr ON p.id = pr.property_id
WHERE city LIKE '%Vancouver%'
GROUP BY p.id
HAVING avg(pr.rating) >= 4
ORDER BY p.cost_per_night LIMIT 10;