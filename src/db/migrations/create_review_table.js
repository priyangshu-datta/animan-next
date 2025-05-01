import { onUpdateTrigger } from '../../../knexfile.js';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema
    .createTable('reviews', (table) => {
      table
        .uuid('id', { primaryKey: true })
        .defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('user_id').references('id').inTable('users');
      table
        .enum('subject_type', [
          'episode',
          'show',
          'season',
          'year',
          'character',
        ])
        .notNullable();
      table.integer('show_id');
      table.integer('episode_number');
      table.enum('season', ['winter', 'spring', 'summer', 'fall']);
      table.integer('year');
      table.float('rating', 2).checkBetween([0.0, 10.0]);
      table.text('review_text');
      table.timestamps(true, true);
    })
    .then(() => knex.raw(onUpdateTrigger('reviews')));
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.dropTable("reviews")
}
