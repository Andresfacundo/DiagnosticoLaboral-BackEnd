const {DataTypes} = require('sequelize');
const bcrypt = require('bcrypt');
const sequelize = require('../../db');

const Usuario = sequelize.define('Usuario',{
    email:{
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate:{
            isEmail:true
        }
    },
    password:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    nombre:{
        type: DataTypes.STRING,
        allowNull: false
    },
    rol:{  
        type: DataTypes.ENUM('admin', 'socio', 'asociado','invitado'),
        defaultValue: 'asociado'
    },
    activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
},{
    hooks: {
        beforeCreate: async (usuario) => {
            const salt = await bcrypt.genSalt(10);
            usuario.password = await bcrypt.hash(usuario.password, salt);
        }
    }
});

Usuario.prototype.compararPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
}

module.exports = Usuario;
