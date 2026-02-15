import React, { useEffect, useState } from "react";
import {
  assignUserToDepartment,
  getDepartments,
  getAllUsers
} from "../Services/ApiServices"; // adjust path
import "../Page_styles/SetUser.css";
const SetUserDepartment = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);

  const [editingUser, setEditingUser] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState("");

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, []);

const fetchUsers = async () => {
  try {
    const usersData = await getAllUsers();
    setUsers(usersData);
    console.log("Fetched users:", usersData);
  } catch (err) {
    alert("Failed to load users");
  }
};

  const fetchDepartments = async () => {
    try {
      const data = await getDepartments();
      setDepartments(data);
      console.log("Fetched departments:", data);
    } catch (err) {
      alert("Failed to load departments");
    }
  };
  const handleAssign = async () => {
    if (!selectedDepartment) {
      alert("Please select a department");
      return;
    }

    try {
      setLoading(true);

      await assignUserToDepartment(
        editingUser._id,
        selectedDepartment
      );

      alert("Department assigned successfully");

      setEditingUser(null);
      fetchUsers();

    } catch (err) {
      alert(
        err.response?.data?.error || "Failed to assign department"
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="page-container">
      <h2>Assign Department to Users</h2>

      <table className="table">
        <thead>
          <tr>
            <th>User</th>
            <th>Email</th>
            <th>Role</th>
            <th>Department</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                {user.departmentId?.name || "Not Assigned"}
              </td>
              <td>
                <button className="depart-button"
                  onClick={() => {
                    setEditingUser(user);
                    setSelectedDepartment(
                      user.departmentId?._id || ""
                    );
                  }}
                >
                  Change
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {editingUser && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>
              Assign Department to {editingUser.username}
            </h3>

            <select
              value={selectedDepartment}
              onChange={(e) =>
                setSelectedDepartment(e.target.value)
              }
            >
              <option value="">Select Department</option>
              {departments.map((dep) => (
                <option key={dep._id} value={dep._id}>
                  {dep.name}
                </option>
              ))}
            </select>

            <div className="modal-actions">
              <button onClick={handleAssign} disabled={loading}>
                {loading ? "Saving..." : "Save"}
              </button>

              <button onClick={() => setEditingUser(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SetUserDepartment;
