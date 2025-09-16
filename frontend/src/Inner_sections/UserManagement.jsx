import React, { useEffect, useState } from "react";
import { getAllUsers, updateUserRole } from "../Services/ApiServices";
import Swal from "sweetalert2";
import "../Page_styles/UserManagement.css"


const UserManagement = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      Swal.fire("✅ Success", "User role updated!", "success");
      fetchUsers();
    } catch (err) {
      Swal.fire("❌ Error", "Failed to update role", "error");
    }
  };

  return (
    <div className="user-management">
      <h2>👤 User Management</h2>
      <table className="user-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Change Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td>{u.username}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>
                {u.role === "super-admin" ? (
                  <span>🔒 Protected</span>
                ) : (
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u._id, e.target.value)}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                )}
              </td>
            </tr>
          ))}
        </tbody>        <tbody>
  {users.map((u) => (
    <tr key={u._id}>
      <td data-label="Username">{u.username}</td>
      <td data-label="Email">{u.email}</td>
      <td data-label="Role">
        <span
          className={`role-badge ${
            u.role === "user"
              ? "role-user"
              : u.role === "admin"
              ? "role-admin"
              : "role-super-admin"
          }`}
        >
          {u.role}
        </span>
      </td>
      <td data-label="Change Role">
        {u.role === "super-admin" ? (
          <span>🔒 Protected</span>
        ) : (
          <select
            value={u.role}
            onChange={(e) => handleRoleChange(u._id, e.target.value)}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        )}
      </td>
    </tr>
  ))}
</tbody>
      </table>
    </div>
  );
};

export default UserManagement;
