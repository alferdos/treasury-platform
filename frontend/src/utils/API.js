import axios from "axios";

// Helper to build Authorization header with Bearer prefix
const authHeader = (token) => token ? { Authorization: `Bearer ${token}` } : {};

// GET without auth (public endpoints)
export const getDataAPI = async (url) => {
	const res = await axios.get(`/api/${url}`);
	return res;
};

// GET with auth token
export const getDataAPIAuth = async (url, token) => {
	const res = await axios.get(`/api/${url}`, {
		headers: authHeader(token),
	});
	return res;
};

// GET by ID without auth (public endpoints)
export const getDataAPIbyId = async (url, id) => {
	const res = await axios.get(`/api/${url}/${id}`);
	return res;
};

// GET by ID with auth token
export const getDataAPIbyIdAuth = async (url, id, token) => {
	const res = await axios.get(`/api/${url}/${id}`, {
		headers: authHeader(token),
	});
	return res;
};

// POST with auth token (main authenticated call)
export const postDataAPI = async (url, post, token) => {
	const res = await axios.post(`/api/${url}`, post, {
		headers: authHeader(token),
	});
	return res;
};

// POST without auth (public: login, register, forgot_password)
export const postDataAPIBare = async (url, post) => {
	const res = await axios.post(`/api/${url}`, post);
	return res;
};

// PUT with auth token
export const putDataAPI = async (url, post, token) => {
	const res = await axios.put(`/api/${url}`, post, {
		headers: authHeader(token),
	});
	return res;
};
