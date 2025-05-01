import { onUpdateTrigger } from '../../../knexfile.js';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema
    .createTable('manga_reviews', (table) => {
      table
        .uuid('id', { primaryKey: true })
        .defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('user_id').references('id').inTable('users');
      table.enum('subject_type', ['chapter', 'manga', 'volume']).notNullable();
      table.integer('chapter_number');
      table.integer('manga_id');
      table.integer('volume');
      table.float('rating', 2).checkBetween([0.0, 10.0]);
      table.text('review_text');
      table.boolean('favourite').defaultTo(false);
      table.text('emotions');
      table.timestamps(true, true);
    })
    .then(() => knex.raw(onUpdateTrigger('manga_reviews')));
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.dropTable('manga_reviews');
}
