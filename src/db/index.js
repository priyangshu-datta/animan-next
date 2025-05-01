import knex from "knex";
import { development as config } from "../../knexfile";

/**
 * @typedef {import('knex').Knex} Knex
 */

/** @type {typeof globalThis & { knexInstance?: Knex }} */
const globalForKnex = globalThis;

let /** @type {Knex} */ db;

if (!globalForKnex.knexInstance) {
  db = knex(config);
  if (process.env.NODE_ENV !== "production") {
    globalForKnex.knexInstance = db;
  }
} else {
  db = globalForKnex.knexInstance;
}

export default db;
