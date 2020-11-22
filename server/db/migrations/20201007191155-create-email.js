// eslint-disable-next-line no-undef
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("emails", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      senderId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: "sender_id",
        references: {
          key: "id",
          model: "users"
        }
      },
      recipientId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: "recipient_id",
        references: {
          key: "id",
          model: "users"
        }
      },
      subject: {
        type: Sequelize.STRING,
        allowNull: false
      },
      content: {
        type: Sequelize.STRING,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        field: "created_at"
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("emails");
  }
};