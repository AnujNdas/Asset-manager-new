import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ThemeSwal from "../utils/SwalTheme";
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
