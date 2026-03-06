import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getDataAPI, postDataAPI } from "../../utils/API";
import swal from "sweetalert";
import { blankProperty } from "../../redux/actions/propertyAction";
import { useHistory, Link } from "react-router-dom";
import Footer from "../Includes/Footer";
import GlobalTypes from "../../redux/actions/GlobalTypes";

const AdminProperties = () => {
	const dispatch = useDispatch();
	useEffect(() => {
		dispatch(blankProperty());
	}, [dispatch]);
	const { auth } = useSelector((state) => state);
	const [data, setData] = useState("");

	async function getProperty() {
		const res = await getDataAPI("/get_property");
		setData(res.data);
	}

	useEffect(() => {
		getProperty();
	}, []);

	const deleteProperty = async (property_id) => {
		swal({
			title: "Are you sure?",
			text: "You want to delete this record?",
			icon: "warning",
			buttons: [
			  'No',
			  'Yes'
			],
			dangerMode: true,
		}).then(async function(isConfirm) {
			if (isConfirm) {
				await postDataAPI("/delete_property", {property_id});
				getProperty();
			}
		});
	};
	return (
		<div>
			<div className="main_content">
				<section className="listing_banner">
					<div className="container">
					<div className="table_scroll">
						<table className="table propertyListTable">
							<thead>
								<tr>
									<th scope="col">#</th>
									<th scope="col">Image</th>
									<th scope="col">Title</th>
									<th scope="col">Address</th>
									<th scope="col">Property Estimated Value</th>
									<th scope="col">Status</th>
									<th scope="col">Action</th>
								</tr>
							</thead>
							<tbody>
							{
								(data.length==0)?(<tr><td colSpan='100%'><center>Record is empty!</center></td></tr>):""
							}
							{data ? data.map((property, index) => (
								<tr key={index}>
									<th scope="row">{index+1}</th>
                                    {/** Warning: validateDOMNesting(...): <img> cannot appear as a child of <tr>. */}
									<td><img src={`${(property.imageName && property.imageName.length > 0) ? property.imageName[0] : '/img/al_narjes.jpg'}`} alt={property.title} style={{width:'60px',height:'40px',objectFit:'cover'}} /></td>
									<td>{property.title}</td>
									<td>{property.address}</td>
									<td>{property.propertyEstimatedValue}</td>
									<td>{(property.status)?( <>Active</> ):( <>InActive</> )}</td>
									<td className="btn_div">
										<Link to={`/admin/property/${property._id}`} className="btn edit1 btn-default">Edit</Link>
										<button className="btn del1 btn-default" onClick={()=>deleteProperty(property._id)}>Delete</button>
									</td>
								</tr>
							)) : ""}
							</tbody>
						</table>
						</div>
					</div>
				</section>
			</div>
		</div>
	);
};

export default AdminProperties;
