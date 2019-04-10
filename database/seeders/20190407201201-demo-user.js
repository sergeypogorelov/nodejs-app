'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Users', [{
      id: 1,
      name: 'John Smith',
      createdAt: new Date(1234567).toISOString(),
      updatedAt: new Date(1234567).toISOString(),
    }], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Users', null, {});
  }
};
