const mongoose = require("mongoose");

const blockchainSchema = mongoose.Schema(
	{
		propertyId: {
			type: String,
		},
		contractName: {
			type: String,
		},
		symbol: {
			type: String,
		},
		decimals: {
			type: String,
		},
		totalTokenSupply: {
			type: String,
		},
		contractAddress: {
			type: String,
		},
		transactionHash: {
			type: String,
		},
		mock: {
			type: Boolean,
			default: false,
		},
	},

	{
		timestamps: true,
	},
);

module.exports = mongoose.model("blockchains", blockchainSchema);
