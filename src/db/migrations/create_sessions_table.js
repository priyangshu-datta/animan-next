import { onUpdateTrigger } from "../../../knexfile.js";

/**
 * Migrate forward fn
 * @param {import("knex").Knex} knex Knex Object
 * @returns {import("knex").Knex} Knex Object
 */
export function up(knex) {
  return knex.schema
    .createTable("sessions", (table) => {
      table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
      table.uuid("user_id").notNullable().references("id").inTable("users");
      table.text("refresh_token");
      table.text("fingerprint");
      table.timestamp("expires_at");
      // table.timestamp("rotated_at");
      table.integer("times_rotated").defaultTo(0);
      table.timestamps(true, true);
    })
    .then(() => knex.raw(onUpdateTrigger("sessions")));
}

/**
 * Rollback fn
 * @param {import("knex").Knex} knex Knex Object
 * @returns {import("knex").Knex} Knex Object
 */
export function down(knex) {
  return knex.schema.dropTable("sessions");
}
