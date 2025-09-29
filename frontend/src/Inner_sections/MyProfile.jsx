import React, { useState, useEffect } from 'react';
import EditButton from '../Components/EditButton';
import '../Page_styles/MyProfile.css';
import { useNavigate } from 'react-router-dom';
const MyProfile = () => {
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    email: "",
    phone: "",
    country: "",
    city: "",
    postalCode: "",
    taxId: ""
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // separate edit toggles for each section
  const [infoEdit, setInfoEdit] = useState(false);
  const [addrEdit, setAddrEdit] = useState(false);

  const navigate = useNavigate();

  // ---- Helpers ----
  const token = sessionStorage.getItem("token");
  const authHeaders = token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };

  const applyUserToForm = (u) => {
    setFormData({
      name: u?.name || "",
      bio: u?.bio || "",
      email: u?.email || "",
      phone: u?.phone || "",
      country: u?.country || "",
      city: u?.city || "",
      postalCode: u?.postalCode || "",
      taxId: u?.taxId || "",
    });
  };


useEffect(() => {
  const fetchUserData = async () => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      alert("Please log in.");
      navigate("/user/login");
      return;
    }

    try {
      const response = await fetch("https://asset-manager-new.onrender.com/api/auth/user", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user data: ${response.status}`);
      }

      const data = await response.json();
      setUserData(data);
      applyUserToForm(data); // ✅ Fill the form with user data
    } catch (error) {
      console.error("Error fetching user data:", error);
      alert("Error fetching user data. Please try again.");
    } finally {
      setLoading(false); // ✅ This fixes the infinite loading issue
    }
  };

  fetchUserData();
}, [navigate]);




  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));
  };

  const cancelInfo = () => {
    applyUserToForm(userData);
    setInfoEdit(false);
  };
  const cancelAddr = () => {
    applyUserToForm(userData);
    setAddrEdit(false);
  };

  const saveProfile = async (fields) => {
    if (!token) {
      navigate("/user/login");
      return;
    }
    setSaving(true);
    try {
      const body = JSON.stringify(fields);
      const res = await fetch("https://asset-manager-new.onrender.com/api/user/update", {
        method: "PUT",
        headers: authHeaders,
        body
      });
      console.log(res)
      if (!res.ok) throw new Error("Failed to update profile");
      const updated = await res.json();
      setUserData(updated);
      applyUserToForm(updated);
      setInfoEdit(false);
      setAddrEdit(false);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="Profile-container"><div className="Profile-heading"><p>My Profile</p></div><p>Loading…</p></div>;
  }

  return (
    <div className="Profile-container">
      
      <div className='Profile-heading'>My Profile
      </div>

      {/* Top profile card */}
      <div className="personal-Profile">
        <div className="boxes-1">
          <div className="profile-img" />
          <div className="data-info">
            <div className="p-name" style={{ fontWeight: '600', color: '#565656', fontFamily: 'Montserrat,san-serif' }}>
              {userData?.username || '—'}
            </div>
            <div className="role" style={{ fontSize: '13px', fontWeight: '500', color: '#565656' }}>
              {formData.bio || 'Team Member'}
            </div>
            <div className="location" style={{ fontSize: '13px', fontWeight: '500', color: '#565656' }}>
              {formData.country || '—'}
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="personal-data">
        <div className="head-box">
          <div className="title-p">Personal Information</div>
          
        </div>

        <div className="boxes">
          <div className="one">
            <p>First Name</p>
            {infoEdit ? (
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
              />
            ) : (
              <h5>{formData.name || '—'}</h5>
            )}
          </div>
          <div className="two">
            <p>Bio</p>
            {infoEdit ? (
              <input
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="e.g., Team Member"
              />
            ) : (
              <h5>{formData.bio || "Team Member"}</h5>
            )}
          </div>
          <div className="three">
            <p>E mail</p>
            {infoEdit ? (
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
              />
            ) : (
              <h5>{formData.email || 'Anonymous@gmail.com'}</h5>
            )}
          </div>
          <div className="four">
            <p>Ph no</p>
            {infoEdit ? (
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone number"
              />
            ) : (
              <h5>{formData.phone || '1234565789'}</h5>
            )}
          </div>
          <div className="button-ed">
            {!infoEdit ? (
              <EditButton onClick={() => setInfoEdit(true)} />
            ) : (
              <div className="edit-actions">
                <button
                  className="save-btn"
                  disabled={saving}
                  onClick={() =>
                    saveProfile({
                      name: formData.name,
                      bio: formData.bio,
                      email: formData.email,
                      phone: formData.phone,
                    })
                  }
                >
                  {saving ? "Saving…" : "Save"}
                </button>
                <button className="cancel-btn" onClick={cancelInfo}>Cancel</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="address">
        <div className="head-box">
          <div className="title-p">Address</div>
         
        </div>

        <div className="boxes">
          <div className="one">
            <p>Country</p>
            {addrEdit ? (
              <input
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="Country"
              />
            ) : (
              <h5>{formData.country || 'India'}</h5>
            )}
          </div>
          <div className="two">
            <p>City/State</p>
            {addrEdit ? (
              <input
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="City/State"
              />
            ) : (
              <h5>{formData.city || 'JSR/India'}</h5>
            )}
          </div>
          <div className="three">
            <p>Postal-Code</p>
            {addrEdit ? (
              <input
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                placeholder="Postal code"
              />
            ) : (
              <h5>{formData.postalCode || '831001'}</h5>
            )}
          </div>
          <div className="four">
            <p>Tax-Id</p>
            {addrEdit ? (
              <input
                name="taxId"
                value={formData.taxId}
                onChange={handleChange}
                placeholder="Tax ID"
              />
            ) : (
              <h5>{formData.taxId || 'sh78d78e'}</h5>
            )}
          </div>
           <div className="button-ed">
            {!addrEdit ? (
              <EditButton onClick={() => setAddrEdit(true)} />
            ) : (
              <div className="edit-actions">
                <button
                  className="save-btn"
                  disabled={saving}
                  onClick={() =>
                    saveProfile({
                      country: formData.country,
                      city: formData.city,
                      postalCode: formData.postalCode,
                      taxId: formData.taxId,
                    })
                  }
                >
                  {saving ? "Saving…" : "Save"}
                </button>
                <button className="cancel-btn" onClick={cancelAddr}>Cancel</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
