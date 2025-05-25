/**
 * Development Config Object for Knex
 * @type { import("knex").Knex.Config }
 */
export const development = {
  client: 'cockroachdb',
  connection: 'postgresql://root@localhost:26257/animan?sslmode=disable',
  // connection: {
  //   host: '127.0.0.1',
  //   port: '5432',
  //   user: 'postgres',
  //   database: 'animan',
  //   password: '2007',
  // },
  migrations: {
    directory: './src/db/migrations',
  },
  pool: {
    max: 5,
    min: 2,
    log: console.log,
  },
};

/**
 * Fix: auto update updatedAt
 * @param {import("knex").Knex.CreateTableBuilder} table Knex Table Object
 * @returns {string} SQL string
 */
export const onUpdateTrigger = (table) => `
    CREATE TRIGGER ${table}_updated_at
    BEFORE UPDATE ON ${table}
    FOR EACH ROW
    EXECUTE PROCEDURE on_update_timestamp();
  `;
