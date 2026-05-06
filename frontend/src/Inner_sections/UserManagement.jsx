import React, { useEffect, useState } from "react";
import { getAllUsers, updateUserRole } from "../Services/ApiServices";
import ThemeSwal from "../utils/SwalTheme";
import "../Page_styles/UserManagement.css";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
      ThemeSwal.fire("Error", "Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      ThemeSwal.fire("Success", "User role updated", "success");
      fetchUsers();
    } catch (err) {
      ThemeSwal.fire("Error", "Failed to update role", "error");
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="saas-user-page">
      {/* Header */}
      <div className="saas-user-header">
        <div>
          <h1>User Management</h1>
          <p>Manage user access and permissions</p>
        </div>

        <div className="saas-user-search">
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table Card */}
      <div className="saas-user-card">
        <table className="saas-user-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Change Role</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="table-center">
                  Loading users...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="4" className="table-center">
                  No users found
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => (
                <tr key={u._id}>
                  <td className="user-name">{u.username}</td>

                  <td>{u.email}</td>

                  <td>
                    <span className={`role-pill role-${u.role}`}>
                      {u.role}
                    </span>
                  </td>

                  <td>
                    {u.role === "super-admin" ? (
                      <span className="protected-label">Protected</span>
                    ) : (
                      <select
                        value={u.role}
                        onChange={(e) =>
                          handleRoleChange(u._id, e.target.value)
                        }
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
