import { onUpdateTrigger } from '../../../knexfile.js';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema
    .createTable('anime_reviews', (table) => {
      table
        .uuid('id').primary()
        .defaultTo(knex.raw('gen_random_uuid()'));
      table
        .uuid('user_id')
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .onUpdate('CASCADE')
        .index();
      table.enum('subject_type', ['episode', 'anime', 'season']).notNullable();
      table.integer('episode_number');
      table.integer('anime_id');
      table.enum('season', ['winter', 'spring', 'summer', 'fall']);
      table.integer('year');
      table.float('rating', 3, 1).checkBetween([0.0, 10.0]);
      table.text('review_text');
      table.boolean('favourite').defaultTo(false);
      table.text('emotions');
      table.timestamps(true, true);

      table.index('updated_at');
      table.index(['anime_id', 'subject_type']);
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
