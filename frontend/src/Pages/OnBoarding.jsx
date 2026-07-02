import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ThemeSwal from "../utils/swalTheme";
import axiosInstance from "../Services/axiosInstance";
import "../Page_styles/OnBoarding.css";
const Onboarding = () => {
  const navigate = useNavigate();

const [formData, setFormData] = useState({
  organizationName: "",
  organizationType: "",
  department: "",
  designation: "",
  country: "",
  city: "",
  officeLocation: "",
  currency: "USD", // default
});
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };
const handleSubmit = async () => {
  try {
    const res = await axiosInstance.put("/user/onboarding", formData);

    // ✅ Sync updated user into localStorage
    const auth = JSON.parse(localStorage.getItem("auth"));

    localStorage.setItem(
      "auth",
      JSON.stringify({
        ...auth,
        user: res.data.user,
      })
    );

    await ThemeSwal.fire(
      "Welcome!",
      "Your workspace has been set up successfully.",
      "success"
    );

    navigate("/classification", {
      state: {
        startGuide: true,
      },
    });

  } catch (err) {
    console.error(err);

    ThemeSwal.fire(
      "Error",
      "Onboarding failed. Please try again.",
      "error"
    );
  }
};


  return (
      <div className="onboarding-modal-overlay">
    <div className="onboarding-card">
      <h2>Set Up Your Workspace</h2>

      <input
        name="organizationName"
        placeholder="Organization Name"
        onChange={handleChange}
      />

      <select name="organizationType" onChange={handleChange}>
        <option value="">Organization Type</option>
        <option value="Startup">Startup</option>
        <option value="Enterprise">Enterprise</option>
        <option value="Agency">Agency</option>
        <option value="NGO">NGO</option>
        <option value="Other">Other</option>
      </select>

      <input
        name="department"
        placeholder="Department"
        onChange={handleChange}
      />

      <input
        name="designation"
        placeholder="Designation"
        onChange={handleChange}
      />

      <input
        name="country"
        placeholder="Country"
        onChange={handleChange}
      />
      <select
  name="currency"
  value={formData.currency}
  onChange={handleChange}
>
  <option value="USD">US Dollar (USD)</option>
  <option value="EUR">Euro (EUR)</option>
  <option value="GBP">British Pound (GBP)</option>
  <option value="INR">Indian Rupee (INR)</option>
  <option value="JPY">Japanese Yen (JPY)</option>
  <option value="AUD">Australian Dollar (AUD)</option>
  <option value="CAD">Canadian Dollar (CAD)</option>
  <option value="CHF">Swiss Franc (CHF)</option>
  <option value="CNY">Chinese Yuan (CNY)</option>
  <option value="SGD">Singapore Dollar (SGD)</option>
  <option value="AED">UAE Dirham (AED)</option>
</select>
      <input
        name="city"
        placeholder="City"
        onChange={handleChange}
      />

      <input
        name="officeLocation"
        placeholder="Office Location"
        onChange={handleChange}
      />

      <button onClick={handleSubmit}>Continue</button>
    </div>
    </div>
  );
};

export default Onboarding;
