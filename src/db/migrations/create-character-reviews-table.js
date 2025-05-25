import { onUpdateTrigger } from '../../../knexfile.js';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema
    .createTable('character_reviews', (table) => {
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
      table.integer('character_id').notNullable();
      table.integer('associated_media_id');
      table.enum('associated_media_type', ['ANIME', 'MANGA']);
      table.enum('role', ['MAIN', 'SUPPORTING', 'BACKGROUND']);
      table.float('rating', 3, 1).checkBetween([0.0, 10.0]);
      table.text('review_text').checkLength('>', 10);
      table.text('emotions');
      table.boolean('favourite').defaultTo(false);
      table.timestamps(true, true);

      table.index('updated_at');
    })
    .then(() => knex.raw(onUpdateTrigger('character_reviews')));
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.dropTable('character_reviews');
}
