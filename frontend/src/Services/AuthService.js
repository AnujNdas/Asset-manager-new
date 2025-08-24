import axios from 'axios'

const API_URL = "https://asset-manager-new.onrender.com/api/auth";
// Base url for backend API

//Sign up function
    //Sign up function
    const signup = async (email ,username , password) => {
        const response = await axios.post(`${API_URL}/signup`,{  email ,username , password });
        return response.data;
    };

//Login function
const login = async (email , password) => {
    const response = await axios.post(`${API_URL}/login`, { email , password});
    return response.data;
}

export default { signup , login };
