/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('product', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		name: {
			type: DataTypes.STRING(45),
			allowNull: true
		},
		price: {
			type: DataTypes.DECIMAL,
			allowNull: true
		},
		description: {
			type: DataTypes.STRING(45),
			allowNull: true
		},
		inventory: {
			type: DataTypes.INTEGER(11),
			allowNull: true
		}
	}, {
		tableName: 'product',
		timestamps: false
	});
};
