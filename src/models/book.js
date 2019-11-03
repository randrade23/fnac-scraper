'use strict';
module.exports = (sequelize, DataTypes) => {
  const Book = sequelize.define('Book', {
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    thumbnail: DataTypes.STRING,
    provider: DataTypes.STRING,
    summary: DataTypes.UUID,
    price: DataTypes.INTEGER,
    isbn: DataTypes.STRING
  }, {});
  Book.associate = function(models) {
    
  };
  return Book;
};