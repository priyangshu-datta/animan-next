import { onUpdateTrigger } from '../../../knexfile.js';

/**
 * Migrate forward fn
 * @param {import("knex").Knex} knex Knex Object
 * @returns {import("knex").Knex} Knex Object
 */
export function up(knex) {
  return knex.schema
    .createTable('users', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('username').unique().notNullable();

      table
        .enum('color_scheme', ['dark', 'light', 'system'])
        .defaultTo('system');
      table.string('locale');
      table.string('timezone');
      table.timestamps(true, true);
    })
    .then(() => knex.raw(onUpdateTrigger('users')));
}

/**
 * Rollback fn
 * @param {import("knex").Knex} knex Knex Object
 * @returns {import("knex").Knex} Knex Object
 */
export function down(knex) {
  return knex.schema.dropTable('users');
}
