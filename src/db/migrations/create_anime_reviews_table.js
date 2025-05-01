import { onUpdateTrigger } from '../../../knexfile.js';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema
    .createTable('anime_reviews', (table) => {
      table
        .uuid('id', { primaryKey: true })
        .defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('user_id').references('id').inTable('users');
      table.enum('subject_type', ['episode', 'anime', 'season']).notNullable();
      table.integer('episode_number');
      table.integer('anime_id');
      table.enum('season', ['winter', 'spring', 'summer', 'fall']);
      table.integer('year');
      table.float('rating', 2).checkBetween([0.0, 10.0]);
      table.text('review_text');
      table.boolean('favourite').defaultTo(false);
      table.text('emotions');
      table.timestamps(true, true);
    })
    .then(() => knex.raw(onUpdateTrigger('anime_reviews')));
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.dropTable('anime_reviews');
}
