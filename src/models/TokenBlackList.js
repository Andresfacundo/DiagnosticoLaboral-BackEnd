const { DataTypes } = require('sequelize');
const sequelize = require('../../db');

const tokenBlackList = sequelize.define('TokenBlackList', {
    token: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    tableName: 'token_blacklist',
    timestamps: true
});

tokenBlackList.cleanExpired = async () =>{
    try {
        await tokenBlackList.destroy({
            where: {
                expiresAt:{
                    [sequelize.Sequelize.prototype.lt]: new Date()
                }
            }
        });
        console.log('Expired tokens removed successfully');
    }catch (error) {
        console.error('Error removing expired tokens:', error);
    }
}
module.exports = tokenBlackList;