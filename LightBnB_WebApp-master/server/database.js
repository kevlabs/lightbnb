const properties = require('./json/properties.json');
const users = require('./json/users.json');

const { Pool } = require('pg');

// instantiate pool connection
const db = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function(email) {
  return db.query(`
    SELECT *
    FROM users
    WHERE email = $1;
  `, [email])
    .then(data => data.rows[0] || null);
};
exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function(id) {
  return db.query(`
    SELECT *
    FROM users
    WHERE id = $1;
  `, [id])
    .then(data => data.rows[0] || null);
};
exports.getUserWithId = getUserWithId;


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser =  function({ name, email, password }) {
  return db.query(`
    INSERT INTO users
    (name, email, password)
    VALUES ($1, $2, $3)
    RETURNING *;
  `, [name, email, password])
    .then(data => data.rows[0]);
};
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guestId, limit = 10) {
  return db.query(`
    SELECT p.*, r.*, avg(pr.rating) as average_rating
    FROM users u
    JOIN reservations r ON r.guest_id = u.id
    JOIN properties p ON r.property_id = p.id
    JOIN property_reviews pr ON p.id = pr.property_id
    WHERE u.id = $1 AND r.end_date < now()::date
    GROUP BY p.id, r.id
    ORDER BY r.start_date DESC LIMIT $2;
  `, [guestId, limit])
    .then(data => data.rows);
};
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function(options, limit = 10) {
  return db.query(`
    SELECT *
    FROM properties
    LIMIT $1
  `, [limit])
    .then(data => data.rows);
};
exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
}
exports.addProperty = addProperty;
