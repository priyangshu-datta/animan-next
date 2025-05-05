import { onUpdateTrigger } from '../../../knexfile.js';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema
    .createTable('year_reviews', (table) => {
      table
        .uuid('id', { primaryKey: true })
        .defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('user_id').references('id').inTable('users');
      table.integer('year');
      table.float('rating', 2).checkBetween([0.0, 10.0]);
      table.text('review_text');
      table.timestamps(true, true);
    })
    .then(() => knex.raw(onUpdateTrigger('year_reviews')));
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.dropTable('year_reviews');
}
