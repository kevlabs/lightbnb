SELECT r.id, p.title, p.cost_per_night, r.start_date, avg(pr.rating)
FROM users u
JOIN reservations r ON r.guest_id = u.id
JOIN properties p ON r.property_id = p.id
JOIN property_reviews pr ON p.id = pr.property_id
WHERE u.id = 1 AND r.end_date < now()::date
GROUP BY r.id, p.title, p.cost_per_night, r.start_date
ORDER BY r.start_date DESC LIMIT 10;