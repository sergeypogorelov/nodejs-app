'use strict';

const fs = require('fs');
const path = require('path');
const csvParse = require('csv-parse/lib/sync');

module.exports = {
  up: (queryInterface, Sequelize) => {
    const content = fs.readFileSync(path.resolve(__dirname, '../../data/products.csv'), 'utf8');
    const data = csvParse(content, { columns: true, skip_empty_lines: true });
    return queryInterface.bulkInsert('Products', data, {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Products', null, {});
  }
};
