import knex from 'knex';
// Import the production configuration
import { development as devConfig } from '../../knexfile'; // <--- CHANGE THIS LINE

/**
 * @typedef {import('knex').Knex} Knex
 */

/** @type {typeof globalThis & { knexInstance?: Knex }} */
const globalForKnex = globalThis;

let /** @type {Knex} */ db;

// In production, we don't want to store the Knex instance globally.
// This is especially important for serverless functions where each invocation
// should have its own connection.
if (process.env.NODE_ENV === 'production') {
  db = knex({
    client: 'cockroachdb',
    connection: process.env.DATABASE_CONNECTION_STRING,
  });
} else {
  // For development, keep the global instance for hot module reloading and efficiency
  if (!globalForKnex.knexInstance) {
    db = knex(devConfig);
    globalForKnex.knexInstance = db;
  } else {
    db = globalForKnex.knexInstance;
  }
}

export default db;
