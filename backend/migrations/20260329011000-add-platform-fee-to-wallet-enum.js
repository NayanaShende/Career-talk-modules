'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add "platform_fee" to the enum_wallet_transactions_type
    // Note: ALTER TYPE ... ADD VALUE cannot be executed inside a transaction block in older Postgres.
    // It's safer to execute it without transactions or manually via query.
    try {
      await queryInterface.sequelize.query(
        "ALTER TYPE enum_wallet_transactions_type ADD VALUE 'platform_fee';"
      );
    } catch (error) {
      if (error.message.includes("already exists")) {
        console.log("Enum value 'platform_fee' already exists, skipping...");
      } else {
        throw error;
      }
    }
  },

  async down(queryInterface, Sequelize) {
    // Note: Postgres doesn't natively support removing a value from an ENUM type easily.
    // It usually requires creating a new type, updating columns, dropping the old type, and renaming.
    // We will leave down empty to prevent accidental data corruption.
    console.log("Warning: Cannot easily remove an enum value in PostgreSQL. Skipping down migration.");
  }
};
