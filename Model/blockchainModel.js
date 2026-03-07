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
		blockNumber: {
			type: Number,
		},
		gasUsed: {
			type: Number,
		},
		chainId: {
			type: Number,
			default: 97,
		},
		network: {
			type: String,
			default: 'BSC Testnet',
		},
		tokenStandard: {
			type: String,
			default: 'BEP-20',
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
