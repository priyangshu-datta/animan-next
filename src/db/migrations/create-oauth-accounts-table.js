import { onUpdateTrigger } from '../../../knexfile.js';

/**
 * Migrate forward fn
 * @param {import("knex").Knex} knex Knex Object
 * @returns {import("knex").Knex} Knex Object
 */
export function up(knex) {
  return knex.schema
    .createTable('oauth_accounts', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('user_id').references('id').inTable('users');
      table.enum('provider', ['anilist', 'mal', 'kitsu']).notNullable();
      table.text('provider_user_id').notNullable();
      table.text('access_token');
      table.timestamp('access_token_expiration');
      table.text('refresh_token');
      table.timestamp('refresh_token_expiration');
      
      table.unique(['user_id', 'provider', 'provider_user_id']);
      table.timestamps(true, true);
    })
    .then(() => knex.raw(onUpdateTrigger('oauth_accounts')));
}

/**
 * Rollback fn
 * @param {import("knex").Knex} knex Knex Object
 * @returns {import("knex").Knex} Knex Object
 */
export function down(knex) {
  return knex.schema.dropTable('oauth_accounts');
}
