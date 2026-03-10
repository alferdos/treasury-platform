const Web3 = require("web3");
const crypto = require('crypto');
const ethers = require('ethers');
const cloudinary = require('cloudinary').v2;
const Property = require("../Model/propertyModel");
const User = require("../Model/userModel");
const Balance = require("../Model/balanceModel");
const Transaction = require("../Model/transactionModel");

// Configure Cloudinary
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dfzwynbsl',
	api_key: process.env.CLOUDINARY_API_KEY || '392361113499844',
	api_secret: process.env.CLOUDINARY_API_SECRET || 'to_UWrKOwt73oXRlD8ZaQqRfW-g',
});

const uploadProfilePicToCloudinary = (file) => {
	return new Promise((resolve, reject) => {
		cloudinary.uploader.upload_stream(
			{ folder: 'treasury-profiles', resource_type: 'image' },
			(error, result) => {
				if (error) reject(error);
				else resolve(result.secure_url);
			}
		).end(file.data);
	});
};
const validateLogin = require("../validation/login");
const validateRegister = require("../validation/register");
const validateUpdatePassword = require("../validation/updatePassword");
const validateUpdateProfile = require("../validation/updateProfile");
const validateSendTokenByAdmin = require("../validation/sendTokenByAdmin");
const cronAbi = require("../config/cronAbi.json");
const abi = require("../config/abi.json");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt")
const privKey = process.env.PRIVATE_KEY;
const rpcUrl = process.env.BSC_NET;
// F-02 FIX: Use a persistent encryption key from environment variable.
// WALLET_ENCRYPTION_KEY must be a 64-character hex string (32 bytes).
// Generate once with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
// and set it as a Railway environment variable. NEVER regenerate — existing wallets will be unreadable.
if (!process.env.WALLET_ENCRYPTION_KEY || process.env.WALLET_ENCRYPTION_KEY.length !== 64) {
	console.error('[SECURITY] WALLET_ENCRYPTION_KEY env var is missing or invalid. Wallet operations will fail.');
}
const WALLET_ENC_KEY = Buffer.from(process.env.WALLET_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex'), 'hex');

//Encrypting text — generates a unique IV per encryption for forward secrecy
function encrypt(text) {
	const iv = crypto.randomBytes(16); // unique IV per call
	let cipher = crypto.createCipheriv('aes-256-cbc', WALLET_ENC_KEY, iv);
   	let encrypted = cipher.update(text);
   	encrypted = Buffer.concat([encrypted, cipher.final()]);
   	// NOTE: key is NOT stored in the return value — it lives only in the env var
   	return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
}

// Decrypting text
function decrypt(text) {
	// Support both old format (with key field) and new format (without key field)
	const decKey = text.key ? Buffer.from(text.key, 'hex') : WALLET_ENC_KEY;
	let iv = Buffer.from(text.iv, 'hex');
   	let encryptedText = Buffer.from(text.encryptedData, 'hex');
   	let decipher = crypto.createDecipheriv('aes-256-cbc', decKey, iv);
   	let decrypted = decipher.update(encryptedText);
   	decrypted = Buffer.concat([decrypted, decipher.final()]);
   	return decrypted.toString();
}

const userController = {
	register: async (req, res) => {
		try {
			const { errors, isValid } = validateRegister(req.body);
			if (!isValid) {
				return res.json({ status: 0, errors });
			}
			const { name, email, national_id, phone_no, password } = req.body;
			let phoneNo = "05"+phone_no;

			const user = await User.findOne({ email });
			if (user) {
				return res.json({ status: 0, errors: { email: "This email already exist!" }});
			}

			const nationalId = await User.findOne({ national_id });
			if (nationalId) {
				return res.json({ status: 0, errors: { national_id: "This National Id already exist!" }});
			}
			const web3 = new Web3(rpcUrl);
			let userWallet=await web3.eth.accounts.create(web3.utils.randomHex(32));
			const newUser = new User({
				name: name,
				email: email,
				phone_no: phoneNo,
				national_id: national_id,
				profile_image: "profile.png",
				walletAddress: encrypt(userWallet.address),
				privateKey: encrypt(userWallet.privateKey),
			});
            newUser.password = newUser.hash(password)
			//Saving user in database.
			await newUser.save();
			res.json({
				status: 1,
				action: 'register',
				user: {
					_id: newUser._id,
					name: newUser.name,
					email: newUser.email,
					phone_no: newUser.phone_no,
					national_id: newUser.national_id,
					profile_image: newUser.profile_image,
					role: newUser.role,
					createdAt: newUser.createdAt,
					// F-04: privateKey and walletAddress intentionally excluded
				},
			});
		} catch (err) {
			return res.status(500).json({ msg: err.message });
		}
	},

	//Function to login user.
	login: async (req, res) => {
		try {
			const { errors, isValid } = validateLogin(req.body);
			if (!isValid) {
				return res.json({ status: 0, errors });
			}
			const { email, password } = req.body;
			//Finding user's email.
			const user = await User.findOne({ email, role: 0 });
			if (!user) {
				return res.json({ status: 0, errors: { email: "User does not exist!" }});
			}
			if (!user.matchPassword(password, user.password)) {
				return res.json({ status: 0, errors: { password: "Incorrect password" }});
			}
			//Creating access unit.
			const accesstoken = createAccessToken({ id: user._id });
			//creating refresh unit.
			const refreshtoken = createRefreshToken({ id: user._id });

			res.cookie("refreshtoken", refreshtoken, {
				httpOnly: true,
				path: "/api/refresh_token",
				maxAge: 7 * 24 * 60 * 60 * 1000,
			});

			res.json({
				status: 1,
				action: 'login',
				accesstoken,
				role: user.role,
				user: {
					_id: user._id,
					name: user.name,
					email: user.email,
					phone_no: user.phone_no,
					national_id: user.national_id,
					profile_image: user.profile_image,
					sar_balance: user.sar_balance,
					role: user.role,
					createdAt: user.createdAt,
					// F-04: privateKey and walletAddress intentionally excluded
				},
			});
		} catch (err) {
			console.error('[login error]', err.stack);
			return res.status(500).json({ msg: 'An internal server error occurred.' });
		}
	},

	//Function to logout user.
	logout: async (req, res) => {
		try {
			res.clearCookie("refreshtoken", { path: "/api/refresh_token" });
			return res.json({ status: 1, action: "logout" });
		} catch (err) {
			return res.status(500).json({ msg: err.message });
		}
	},

	forgot_password: async (req, res) => {
		try {
		  let { email } = req.body;
		  if(!email){
			return res.json({ status: 0, errors: { email: "Email is required" }});
		  }
		  const user = await User.findOne({ email: req.body.email });
		  if(!user){
			return res.json({ status: 0, errors: { email: "User not exist" }});
		  }
		  // requesting email from body and expire otp in 5 minutes
		  var update = {
			activation_key: Math.floor(Math.random() * 10000 + 1),
		  };
		  let updateUser=await User.findOneAndUpdate({ _id: user._id }, update);
		  // sending otp to email using send grid
		  const msg = {
			from: process.env.EMAIL,
			to: email,
			subject: "Forgot Password Mail",
			templateId: '0c7df92d-8d97-4d4b-b4f4-137c6f1b7a21',
			substitutions: {
			  ForgotLink: 'http://localhost:3000/forgotKey/'+updateUser._id+'/'+update.activation_key,
			},
		  };
	
		  sgMail.send(msg).then((response) => {
			//console.log(response[0].statusCode);
			//console.log(response[0].headers);
		  })
		  .catch((error) => {
			console.error(error);
		  });
	
		  res.json({
			status: 1,
		  });
		} catch (err) {
		  return res.status(500).json({ msg: err.message });
		}
	},
	
	updatePassword: async (req, res) => {
		try {
		  // Check Validation
		  const { errors, isValid } = validateUpdatePassword(req.body);
		  // Check Validation
		  if (!isValid) {
			return res.json({ status: 0, errors });
		  }

          const user = await User.findById(req.body.user_id)
		  user.password = user.hash(req.body.new_password);
          user.save()

          return res.json({
			status: 1,
			msg: "password has been updated!"
		  });
		} catch (err) {
		  return res.json({ error: 0, errors: { oldPassword: err.message } });
		}
	},

	//Function to check the refresh unit.
	refreshToken: (req, res) => {
		try {
			const rf_token = req.cookies.refreshtoken;
			if (!rf_token) {
				return res.json({ status: 0, msg: "please login first" });
			}
			//Verifying jwt unit
			jwt.verify(
				rf_token,
				process.env.REFRESH_TOKEN_SECRET,

				async (err, result) => {
					if (err) {
						return res.json({ status: 0, msg: "Please login first" });
					}
					if (!result) {
						return res.json({ status: 0, msg: "user does not exist" });
					}
					const user = await User.findById(result.id);
					if(user!=null){
						const access_token = createAccessToken({ id: user.id });
							res.json({
								status: 1,
								access_token,
								user: {
									_id: user._id,
									name: user.name,
									email: user.email,
									phone_no: user.phone_no,
									national_id: user.national_id,
									profile_image: user.profile_image,
									sar_balance: user.sar_balance,
									role: user.role,
									createdAt: user.createdAt,
									// F-04: privateKey and walletAddress intentionally excluded
								},
							});
					}
					else{
						return res.json({ status: 0, msg: "user does not exist" });
					}
				},
			);
		} catch (err) {
			return res.status(500).json({ msg: err.message });
		}
	},

	//Function to get the user
	// getUser: async (req, res) => {
	// 	try {
	// 		const user = await User.findById(req.body._id);
	// 		if (!user) {
	// 			return res.status(400).json({ msg: "user does not exist" });
	// 		}
	// 		res.json(user);
	// 	} catch (err) {
	// 		return res.status(500).json({ msg: err.message });
	// 	}
	// },

	updateProfile: async (req, res) => {
		try {
			const { errors, isValid } = validateUpdateProfile(req.body);
			// Check Validation
			if (!isValid) {
				return res.json({ status: 0, errors });
			}
			const { name, email, national_id, phone_no, new_password } = req.body;
			let phoneNo = "05"+phone_no;
			let updateData={
				name,
				email,
				national_id,
				phone_no: phoneNo,
			}
			if(new_password!=""){
				let updatePassword={password: new User().hash(new_password)};
				await User.findOneAndUpdate(
					{
					_id: req.body.user_id
					},
					updatePassword
				)
			}
			await User.findOneAndUpdate(
				{
				_id: req.body.user_id
				},
				updateData
			)
			return res.json({
				status: 1,
			});
		} catch (err) {
			return res.status(500).json({ msg: err.message });
		}
	},

	updateProfilePic: async (req, res) => {
		try {
		var image = req.files.file;
		let imagename;
		// Always upload to Cloudinary for persistent storage
		imagename = await uploadProfilePicToCloudinary(image);
			const data = await User.findOneAndUpdate(
				{ _id: req.body.user_id },
				{ profile_image: imagename },
				{ new: true }
			);
			return res.json({
				status: 1,
				data: data
			});
		} catch (err) {
			return res.status(500).json({ msg: err.message });
		}
	},

		getUser: async (req, res) => {
		try {
			let role=req.query.role;
			if(role){
				var user = await User.find({role}).select('-password -privateKey -walletAddress');
			}
			else{
				var user = await User.find().select('-password -privateKey -walletAddress');
			}
			if (!user) {
				return res.status(400).json({ msg: "There is no user exist" });
			}
			res.json(user);
		} catch (err) {
			return res.status(500).json({ msg: err.message });
		}
	},

	getUserById: async (req, res) => {
		try {
			const User = await User.find({ _id: req.params.id });
			if (!User) {
				return res.status(400).json({ msg: "There is no user exist" });
			}
			res.json(User);
		} catch (err) {
			return res.status(500).json({ msg: err.message });
		}
	},

	deleteUser: async (req, res) => {
		try {
			await User.deleteOne({ _id: req.body.user_id });
			res.json({ status: 0 });
		} catch (err) {
			return res.status(500).json({ msg: err.message });
		}
	},

	sendTokenByAdmin: async (req, res) => {
		try {
			const { errors, isValid } = validateSendTokenByAdmin(req.body);
			// Check Validation
			if (!isValid) {
				return res.json({ status: 0, errors });
			}
			const { units, propertyId, userId } = req.body;
			let property= await Property.findById(propertyId);
			let user= await User.findById(userId);
			if (!property) return res.json({ status: 0, errors: { message: "Property not found." } });
			if (!property.contract_address) return res.json({ status: 0, errors: { message: "This property has no deployed token contract. Please deploy it first from the Properties page." } });
			if (!user) return res.json({ status: 0, errors: { message: "User not found." } });
			if (!user.walletAddress) return res.json({ status: 0, errors: { message: "This user has no wallet address. They must log in once to generate a wallet." } });
			const walletAddress = user.walletAddress;
			const contractAddress=property.contract_address;
			let wallet = new ethers.Wallet(privKey);

			const provider = await ethers.getDefaultProvider(rpcUrl);
			var walletSigner = await wallet.connect(provider);
			const contract = new ethers.Contract(contractAddress, abi, walletSigner);
			let numberOfTokens = ethers.utils.parseUnits(units, 18);
			var options = { gasLimit: 9000000 }; 
			contract.transfer(decrypt(walletAddress), numberOfTokens, options).then((tx) => {
				return res.json({ status: 1, tx });
			}).catch((txErr) => {
				console.log(txErr, "blockchain transfer error");
				return res.json({ status: 0, errors: { message: "Blockchain transfer failed: " + (txErr.reason || txErr.message || "Unknown error") } });
			});
		}
		catch(err) {
			console.log(err,"errr")
			return res.json({ status: 0, errors: { message: err.message || "Something is wrong!" } });
		}
	},

	sendTokenByUser: async (req, res) => {
		try {
			const { units, propertyId, fromUserId, toUserId } = req.body;
			let property= await Property.findById(propertyId);
			let fromUser= await User.findById(fromUserId);
			let toUser= await User.findById(toUserId);
			const walletAddress = toUser.walletAddress;
			const contractAddress=property.contract_address;
			//let wallet = new ethers.Wallet(privKey);
			let wallet = new ethers.Wallet(decrypt(fromUser.privateKey));
			const provider = await ethers.getDefaultProvider(rpcUrl);
			var walletSigner = await wallet.connect(provider);
			const contract = new ethers.Contract(contractAddress, abi, walletSigner);
			let numberOfTokens = ethers.utils.parseUnits(units, 18);
			var options = { gasLimit: 9000000 }; 
			contract.transfer(walletAddress, numberOfTokens, options).then((tx) => {
				return res.json({ status: 1, tx });
			});
		}
		catch(err) {
			return res.json({ status: 0, errors: { message: "Something is wrong!" } });
		}
	},

	cronJobUploadRecord: async (req, res) => {
		try {
			const contractAddress="0x5e77b99cdae0a32a0500548924838a3f4249d233";
			let wallet = new ethers.Wallet(privKey);
			const provider = await ethers.getDefaultProvider(rpcUrl);
			var walletSigner = await wallet.connect(provider);
			const contract = new ethers.Contract(contractAddress, cronAbi, walletSigner);
			let userAddress=[];
			let propertyId=[];
			let propertyName=[];
			let amount=[];
			let date=[];
			let ts = Date.now();
			let date_ob = new Date(ts);
			let d = date_ob.getDate();
			let m = date_ob.getMonth() + 1;
			let y = date_ob.getFullYear();
			let searchDate=d+""+m+""+y;
			var balanceData = await Balance.find({ 'date': searchDate }).populate('userId').populate('propertyId');
			balanceData.forEach(function(data){
				userAddress.push(decrypt(data.userId.walletAddress));
				propertyId.push(data.propertyId.id);
				propertyName.push(data.propertyId.title);
				amount.push(data.units);
				date.push(data.date);
			});
			//return res.json({ status: 1, userAddress, propertyId, amount, date });
			contract.addData(
				userAddress, 
				propertyId, 
				propertyName,
				amount,
				date
			).then((tx) => {
				return res.json({ status: 1, tx });
			}).catch((err) => {
				return res.json({ status: 0, errors: err });
			});
		}
		catch(err) {
			return res.json({ status: 0, errors: { message: "Something is wrong!" } });
		}
	},

	cronJobSearchRecord: async (req, res) => {
		try {
			const contractAddress="0x5e77b99cdae0a32a0500548924838a3f4249d233";
			let wallet = new ethers.Wallet(privKey);
			const provider = await ethers.getDefaultProvider(rpcUrl);
			var walletSigner = await wallet.connect(provider);
			const contract = new ethers.Contract(contractAddress, cronAbi, walletSigner);
			await contract.getData(req.body.date);
			return res.json({ status: 1 });
		}
		catch(err) {
			return res.json({ status: 0, errors: { message: err } });
		}
	},

	addFunds: async (req, res) => {
		try {
			const { userId, amount } = req.body;
			if (!userId || !amount || isNaN(amount) || Number(amount) <= 0) {
				return res.json({ status: 0, errors: { message: "Invalid userId or amount" } });
			}
			const user = await User.findById(userId);
			if (!user) {
				return res.json({ status: 0, errors: { message: "User not found" } });
			}
			await User.findByIdAndUpdate(userId, { $inc: { totalBalance: Number(amount) } });
			return res.json({ status: 1, message: `Added ${amount} SAR to ${user.name}'s balance` });
		} catch (err) {
			return res.json({ status: 0, errors: { message: err.message } });
		}
	},

	cronJobFetchRecord: async (req, res) => {
		try {
			const contractAddress="0x5e77b99cdae0a32a0500548924838a3f4249d233";
			let wallet = new ethers.Wallet(privKey);
			const provider = await ethers.getDefaultProvider(rpcUrl);
			var walletSigner = await wallet.connect(provider);
			const contract = new ethers.Contract(contractAddress, cronAbi, walletSigner);
			contract.viewTotalNumbers().then(async(tx) => {
				let totalNumber=Math.round(parseFloat(ethers.utils.formatUnits(tx._hex)) * (10 ** 18));
				let data=[];
				for(let i=0; i<totalNumber; i++){
					data.push(await contract.getDataByNumber(i));
				}
				return res.json({ status: 1, data });
			})
			.catch((err) => {
				return res.json({ status: 0, errors: { message: err } });
			})
		}
		catch(err) {
			return res.json({ status: 0, errors: { message: "Something is wrong!" } });
		}
	},

	// Admin: get full user detail (balance, property units, transactions)
	getUserDetail: async (req, res) => {
		try {
			const userId = req.params.userId;
			const user = await User.findById(userId).select('-password -privateKey');
			if (!user) return res.status(404).json({ msg: 'User not found' });
			const balances = await Balance.find({ userId }).populate('propertyId');
			const transactions = await Transaction.find({ userId }).populate('propertyId').sort({ createdAt: -1 }).limit(50);
			return res.json({ status: 1, user, balances, transactions });
		} catch (err) {
			return res.status(500).json({ msg: err.message });
		}
	},

	// Admin: blockchain overview - all deployed property token contracts
	getBlockchainOverview: async (req, res) => {
		try {
			const Property = require('../Model/propertyModel');
			const properties = await Property.find({ contract_address: { $exists: true, $ne: null, $ne: '' } });
			const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
			const abi = require('../config/abi.json');

			const results = await Promise.all(properties.map(async (prop) => {
				let onChain = null;
				try {
					const contract = new ethers.Contract(prop.contract_address, abi, provider);
					const [name, symbol, totalSupply, decimals] = await Promise.all([
						contract.name(),
						contract.symbol(),
						contract.totalSupply(),
						contract.decimals(),
					]);
					onChain = {
						name,
						symbol,
						totalSupply: ethers.utils.formatUnits(totalSupply, decimals),
						decimals: decimals,
					};
				} catch (e) {
					onChain = { error: e.message };
				}
				return {
					_id: prop._id,
					title: prop.title,
					address: prop.address,
					contract_address: prop.contract_address,
					tokenPrice: prop.tokenPrice,
					totalTokenSupply: prop.totalTokenSupply,
					percentageOfOwnership: prop.percentageOfOwnership,
					propertyEstimatedValue: prop.propertyEstimatedValue,
					status: prop.status,
					createdAt: prop.createdAt,
					onChain,
				};
			}));

			return res.json({ status: 1, data: results });
		} catch (err) {
			return res.status(500).json({ msg: err.message });
		}
	},

	// Admin: dashboard analytics
	getAdminAnalytics: async (req, res) => {
		try {
			const Property = require('../Model/propertyModel');
			// Total SAR in all user wallets
			const users = await User.find({ role: 0 });
			const totalFunds = users.reduce((sum, u) => sum + (u.totalBalance || 0), 0);
			const totalUsers = users.length;
			// All transactions
			const transactions = await Transaction.find().populate('propertyId').sort({ createdAt: -1 });
			// Total transaction value
			const totalTransactionValue = transactions.reduce((sum, t) => sum + (t.price || 0), 0);
			// Fee calculations
			// Listing fee: 2% of propertyEstimatedValue for each listed property
			const properties = await Property.find();
			const listingFees = properties.reduce((sum, p) => sum + ((p.propertyEstimatedValue || 0) * 0.02), 0);
			// Subscription fee: 1% of each buy transaction price
			const subscriptionFees = transactions
				.filter(t => t.action === 'buy' && t.isSubscription)
				.reduce((sum, t) => sum + ((t.price || 0) * 0.01), 0);
			// Exchange fee: 0.25% from each party (0.5% total) on non-subscription trades
			const exchangeFees = transactions
				.filter(t => !t.isSubscription)
				.reduce((sum, t) => sum + ((t.price || 0) * 0.005), 0);
			// Transactions by date (last 30 days)
			const thirtyDaysAgo = new Date();
			thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
			const recentTx = transactions.filter(t => new Date(t.createdAt) >= thirtyDaysAgo);
			const txByDate = {};
			recentTx.forEach(t => {
				const dateKey = new Date(t.createdAt).toISOString().split('T')[0];
				if (!txByDate[dateKey]) txByDate[dateKey] = { count: 0, value: 0 };
				txByDate[dateKey].count += 1;
				txByDate[dateKey].value += (t.price || 0);
			});
			const txByDateArray = Object.entries(txByDate).map(([date, data]) => ({ date, ...data })).sort((a,b) => a.date.localeCompare(b.date));
			return res.json({
				status: 1,
				totalFunds,
				totalUsers,
				totalTransactionValue,
				totalProperties: properties.length,
				listingFees,
				subscriptionFees,
				exchangeFees,
				txByDate: txByDateArray,
				recentTransactions: transactions.slice(0, 10),
			});
		} catch (err) {
			return res.status(500).json({ msg: err.message });
		}
	},
};

//Function to to create access unit.
const createAccessToken = (user) => {
	return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1d" });
};

//Function to to create refresh unit.
const createRefreshToken = (user) => {
	return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
};

module.exports = userController;
