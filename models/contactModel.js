const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const Contact = sequelize.define('Contact', {
  phoneNumber: DataTypes.STRING,
  email: DataTypes.STRING,
  linkedId: DataTypes.INTEGER,
  linkPrecedence: {
    type: DataTypes.ENUM('primary', 'secondary'),
    defaultValue: 'primary'
  },
}, {
  timestamps: true,
  paranoid: true // for deletedAt
});

module.exports = Contact;
