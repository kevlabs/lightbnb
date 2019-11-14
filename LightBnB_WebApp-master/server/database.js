const properties = require('./json/properties.json');
const users = require('./json/users.json');

const { Pool } = require('pg');

// instantiate pool
const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});

const db = {
  query: (...args) => pool.query(...args)
};


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

/**
 * Add a reservation to the database
 * @param {{}} reservation An object containing all of the reservation details.
 * @return {Promise<{}>} A promise to the reservation.
 */
const addReservation = function(reservation) {
  console.log(reservation);

  const keys = Object.keys(reservation);

  return db.query(`
    INSERT INTO reservations (${keys.join(', ')})
    VALUES (${keys.map((_, i) => '$' + (i + 1)).join(', ')})
    RETURNING *;
  `, keys.map(key => reservation[key]))
    .then(data => {
      console.log(data.rows);
      return data;
    })
    .then(data => data.rows[0]);
};
exports.addReservation = addReservation;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function(options, limit = 10) {
  let {
    city,
    owner_id,
    minimum_price_per_night,
    maximum_price_per_night,
    minimum_rating
  } = options;

  const allFilterParams = [];

  // WHERE FILTERS
  const whereFilter = [];

  if (city) {
    whereFilter.push(`p.city ILIKE $${allFilterParams.length + 1}`);
    allFilterParams.push(`%${city}%`);
  }
  if (owner_id = Number(owner_id)) {
    whereFilter.push(`p.owner_id = $${allFilterParams.length + 1}`);
    allFilterParams.push(owner_id);
  }
  if (minimum_price_per_night = Number(minimum_price_per_night)) {
    whereFilter.push(`p.cost_per_night >= $${allFilterParams.length + 1}`);
    allFilterParams.push(minimum_price_per_night * 100);
  }
  if (maximum_price_per_night = Number(maximum_price_per_night)) {
    whereFilter.push(`p.cost_per_night <= $${allFilterParams.length + 1}`);
    allFilterParams.push(maximum_price_per_night * 100);
  }

  const whereFilterString = whereFilter.length ? 'WHERE ' + whereFilter.join(' AND ') : '';
  
  // HAVING FILTERS
  const havingFilter = [];
  
  if (minimum_rating = Number(minimum_rating)) {
    havingFilter.push(`avg(pr.rating) >= $${allFilterParams.length + 1}`);
    allFilterParams.push(minimum_rating);
  }
  
  const havingFilterString = havingFilter.length ? 'HAVING ' + havingFilter.join(' AND ') : '';
  
  return db.query(`
    SELECT p.*, avg(pr.rating) as average_rating
    FROM properties p
    LEFT JOIN property_reviews pr ON p.id = pr.property_id
    ${whereFilterString}
    GROUP BY p.id
    ${havingFilterString}
    ORDER BY p.cost_per_night LIMIT $${allFilterParams.length + 1};
  `, [...allFilterParams, limit])
    .then(data => data.rows);
};
exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {

  const keys = Object.keys(property);

  return db.query(`
    INSERT INTO properties (${keys.join(', ')})
    VALUES (${keys.map((_, i) => '$' + (i + 1)).join(', ')})
    RETURNING *;
  `, keys.map(key => property[key]))
    .then(data => data.rows[0]);
};
exports.addProperty = addProperty;
