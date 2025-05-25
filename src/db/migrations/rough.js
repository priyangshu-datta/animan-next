/**
 * Migrate forward fn
 * @param {import("knex").Knex} knex Knex Object
 * @returns {import("knex").Knex} Knex Object
 */
export function up(knex) {
  return knex.schema
    .alterTable('users', (table) => {
      table
        .enum('color_scheme', ['dark', 'light', 'system'])
        .defaultTo('system');
      table.text('locale').defaultTo('en');
      table.string('timezone');
    })
    .alterTable('oauth_accounts', (table) => {
      table.dropColumn('sync');
    });
}

/**
 * Migrate forward fn
 * @param {import("knex").Knex} knex Knex Object
 * @returns {import("knex").Knex} Knex Object
 */
export function down(knex) {
  return knex.schema
    .alterTable('users', (table) => {
      table.dropColumn('color_scheme');
      table.dropColumn('locale');
      table.dropColumn('timezone');
    })
    .alterTable('oauth_accounts', (table) => {
      table.boolean('sync');
    });
}
