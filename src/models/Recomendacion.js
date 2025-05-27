const { DataTypes } = require('sequelize');
const sequelize = require('../../db');
const Categoria = require('./Categoria');

const Recomendacion = sequelize.define('Recomendacion', {
  texto: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  categoriaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Categoria,
      key: 'id'
    }
  }
}, {
  timestamps: true
});

Recomendacion.belongsTo(Categoria, { foreignKey: 'categoriaId' });
Categoria.hasMany(Recomendacion, { foreignKey: 'categoriaId' });

module.exports = Recomendacion;
