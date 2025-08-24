import axios from 'axios'

const API_URL = "https://asset-manager-new.onrender.com/api/auth";
// Base url for backend API

//Sign up function
const signup = async (username , email, password) => {
    console.log("Frontend sending data:", { email, username, password });
    const response = await axios.post(`${API_URL}/signup`,{  username , email , password });
    return response.data;
};

//Login function
const login = async (email , password) => {
    const response = await axios.post(`${API_URL}/login`, { email , password});
    return response.data;
}

export default { signup , login };
