import axios from 'axios'

const API_URL = "https://asset-manager-backend-v2no.onrender.com/api/auth";
// Base url for backend API

//Sign up function
const signup = async (name , username,password) => {
    const response = await axios.post(`${API_URL}/signup`,{ name , username , password });
    return response.data;
};

//Login function
const login = async (username , password) => {
    const response = await axios.post(`${API_URL}/login`, { username , password});
    return response.data;
}

export default { signup , login };