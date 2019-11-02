'use strict';
module.exports = (sequelize, DataTypes) => {
  const Summary = sequelize.define('Summary', {
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    url: DataTypes.STRING,
    thumbnail: DataTypes.STRING,
    provider: DataTypes.STRING
  }, {});
  Summary.associate = function(models) {
    Summary.belongsTo(models.Book);
  };
  return Summary;
};