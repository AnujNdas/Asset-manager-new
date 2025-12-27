import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_URL}/api/auth`;

// ✅ Send OTP
const sendOtp = async (email) => {
    const response = await axios.post(`${API_URL}/send-otp`, { email });
    return response.data;
};

// ✅ Verify OTP and Signup in one step
const verifyOtpAndSignup = async (email, username, password, otp) => {
    const response = await axios.post(`${API_URL}/verify-otp-signup`, {
        email,
        username,
        password,
        otp
    });
    return response.data;
};

// ✅ Login
const login = async (email, password) => {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    return response.data;
};

export default { sendOtp, verifyOtpAndSignup, login };

