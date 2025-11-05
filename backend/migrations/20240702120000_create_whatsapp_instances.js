export async function up(knex) {
  return knex.schema.createTable('whatsapp_instances', (table) => {
    table.string('instance_name').primary();
    table.string('session_id').notNullable().unique();
    table.jsonb('capabilities').notNullable();
    table.string('status').notNullable().defaultTo('connected');
    table.timestamp('last_active').notNullable().defaultTo(knex.fn.now());
    table.integer('concurrent_tasks').defaultTo(0);
    table.jsonb('metadata');
    table.timestamps(true, true);
  });
}

export async function down(knex) {
  return knex.schema.dropTable('whatsapp_instances');
}
