const axios = require('axios');
const bcrypt = require('bcryptjs');

const API_URL = 'http://localhost:8080';

async function createAccounts() {
  try {
    // Create regular user
    const userRes = await axios.post(`${API_URL}/api/user/register`, {
      fullName: 'Faisal Alferdos',
      email: 'faisal@treasury.sa',
      nationalId: '1234567890',
      phoneNumber: '50123456',
      password: 'Dos985726'
    });
    console.log('User created:', userRes.data);

    // Create admin user
    const adminRes = await axios.post(`${API_URL}/api/user/register`, {
      fullName: 'Admin Treasury',
      email: 'admin@treasury.sa',
      nationalId: '9876543210',
      phoneNumber: '50987654',
      password: 'Dos985726'
    });
    console.log('Admin created:', adminRes.data);

    // Update admin to have admin role
    if (adminRes.data && adminRes.data._id) {
      const updateRes = await axios.put(`${API_URL}/api/user/${adminRes.data._id}`, {
        role: 'admin'
      });
      console.log('Admin role updated:', updateRes.data);
    }
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

createAccounts();
