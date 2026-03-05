const property = require("../Model/propertyModel");
const validateProperty = require("../validation/Property");

const prepareFileName = file => {
    let name = file.name.split(/[ \.]/g)
    let extension = name.pop()
    name = name.join("-")
    return Date.now() + "." + name.substring(0, 10) + "." + extension
}

const propertyCtrl = {
	//Function to create ico property.
	createProperty: async (req, res) => {
		try {
			const { errors, isValid } = validateProperty(req.body);
			if (!isValid) {
				return res.json({ status: 0, errors });
			}
			const {
				userId,
				title,
				propertyDeed,
				propertyEstimatedValue,
				generatic_income,
				description,
                imageName,
				address,
				percentageOfOwnership,
				toggle,
			} = req.body;

			const Property = new property({
				userId,
				title,
				propertyDeed,
				propertyEstimatedValue,
				generatic_income,
				description,
				address,
				percentageOfOwnership,
				toggle,
				status: 0,
			});
			const checkProperty = await property.findOne({ title });
			if (checkProperty) {
				return res.json({ status: 0, errors:{ title: "This property already exist!" }});
			}
			//Saving ico property in database.
			await Property.save();
			res.json({
				status: 1,
				Property,
			});
		} catch (err) {
			return res.status(500).json({ msg: err.message });
		}
	},

    upload:  async (req, res) => {
        try {
            const images = req.files["images"];
            let imagename = [];

            // currently, files are stored in frontend/public. Don't forget to change it to frontend/build
            if (Array.isArray(images)) {
                imagename = images.map(saveImage)
            } else {
                imagename = saveImage(images)
            }
            const deed = req.files.deed;
            const deedname = prepareFileName(deed);
            deed.mv("./frontend/public/deed/" + deedname);
            res.json({ 
                image_url: imagename,
                deed_url: `/deed/${deedname}`,
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

	updateProperty: async (req, res) => {
		try {
			const { errors, isValid } = validateProperty(req.body);
			if (!isValid) {
				return res.json({ status: 0, errors });
			}
			const {
				title,
				contract_address,
				tokenPrice,
				propertyEstimatedValue,
				generatic_income,
				description,
				address,
				percentageOfOwnership,
				status,
			} = req.body;

			const updateData = {
				title,
				contract_address,
				tokenPrice,
				propertyEstimatedValue,
				generatic_income,
				description,
				address,
				percentageOfOwnership,
				status,
			};
			await property.updateOne({ _id: req.body._id }, updateData);
			res.json({
				status: 1,
				property,
			});
		} catch (err) {
			return res.status(500).json({ msg: err.message });
		}
	},

	//Function to read specific ico by its id.
	getProperty: async (req, res) => {
		try {
			let status = req.query.status;
			let query = {};
			if(status){
				// Convert status to number if it's a string
				query.status = parseInt(status) || status;
			}
			const Property = await property.find(query).lean();
			res.json(Property);
		} catch (err) {
			return res.status(500).json({ msg: err.message });
		}
	},

	getPropertyById: async (req, res) => {
		try {
			const Property = await property.find({ _id: req.params.id });
			res.json(Property);
		} catch (err) {
			return res.status(500).json({ msg: err.message });
		}
	},

	deleteProperty: async (req, res) => {
		try {
			await property.deleteOne({ _id: req.body.property_id });
			res.json({ status: 0 });
		} catch (err) {
			return res.status(500).json({ msg: err.message });
		}
	},

	updatePropertyFile: async (req, res) => {
		try {
			const updateData=req.body.data;
			await property.updateOne({ _id: req.body._id }, updateData);
			res.json({ status: 1});
		} catch (err) {
			
			return res.status(500).json({ msg: err.message ,updateData:updateData , err:err});
		}
	},

	changeData: async (req, res) => {
		try {
			let { units, amount, propertyId } = req.body;
			if(units){
				units=units.replace(/[^0-9\.]+/g, "");
				var Property = await property.findOne({_id: propertyId});
				var data={
					units,
					amount: (units*Property.tokenPrice)
				}
			}
			else{
				amount=amount.replace(/[^0-9\.]+/g, "");
				var Property = await property.findOne({_id: propertyId});
				var data={
					units: (amount/Property.tokenPrice),
					amount
				}
			}
			res.json({ status: 1, data });
		} catch (err) {
			return res.status(500).json({ msg: err.message });
		}
	},
};
const saveImage = image => {
    const name = prepareFileName(image)
    image.mv("./frontend/public/img/" + name);
    return "/img/" + name ;
}

module.exports = propertyCtrl;
