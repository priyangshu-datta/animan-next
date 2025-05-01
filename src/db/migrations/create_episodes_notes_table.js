import { onUpdateTrigger } from '../../../knexfile.js';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema
    .createTable('episodes_notes', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('user_id').references('id').inTable('users');
      table.integer('media_id').notNullable();
      table
        .enu('media_id_from', ['anilist', 'mal', 'kitsu'])
        .defaultTo('anilist');

      table.text('review').notNullable().checkLength('>', 10);
      table.integer('episode').notNullable();
      table.boolean('favourite').defaultTo(false);
      table.float('rating').checkBetween([0.0, 10.0]).notNullable();
      table.string('emotions');
      table.timestamps(true, true);
    })
    .then(() => knex.raw(onUpdateTrigger('episodes_notes')));
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.dropTable('episodes_notes');
}
