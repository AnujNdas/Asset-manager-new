
import axios from 'axios';
import axiosInstance from './axiosInstance';
const API_URL = `${process.env.REACT_APP_API_URL}/api/auth`;

// ✅ Send OTP
const sendOtp = async (email) => {
    const response = await axios.post(`${API_URL}/send-otp`, { email });
    return response.data;
};

// ✅ Verify OTP and Signup in one step
const verifyOtpAndSignup = async (
  email,
  username,
  password,
  otp,
  inviteToken
) => {

  const response = await axios.post(
    `${API_URL}/verify-otp-signup`,
    {
      email,
      username,
      password,
      otp,
      inviteToken,
    },
    {
      withCredentials: true,
    }
  );

  return response.data;
};
 const applyAffiliate = async (data) => {
  const res = await axios.post(
    `${API_URL}/affiliate/apply`,
    data
  );

  return res.data;
};
// ✅ Login
const login = async (email, password) => {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    return response.data;
};
const getResetPreview = async () => {
  const response = await axiosInstance.get("/auth/reset-preview");
  return response.data; 
}
const ResetSystemData = async (password) => {
  const response = await axiosInstance.post("/auth/reset-system-data", { password });
  return response.data; 
} 
export default { sendOtp, verifyOtpAndSignup, login, getResetPreview , ResetSystemData , applyAffiliate};

