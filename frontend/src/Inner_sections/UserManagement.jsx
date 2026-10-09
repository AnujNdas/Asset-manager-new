import React, { useEffect, useState } from "react";
import { getAllUsers, updateUserRole } from "../Services/ApiServices";
import ThemeSwal from "../utils/swalTheme";
import "../Page_styles/UserManagement.css";
import {
  FiUsers,
  FiSearch,
  FiShield,
  FiLoader,
  FiUserX,
  FiMail,
  FiUserCheck,
  FiUser,
  FiLock,
  FiChevronDown,
} from "react-icons/fi";
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

  {/* ================= PAGE HEADER ================= */}

  <div className="saas-user-header">

    <div className="saas-user-heading">

      <span className="saas-user-heading-icon">
        <FiUsers />
      </span>

      <div>
        <h1>User Management</h1>
        <p>Manage user access and permissions</p>
      </div>

    </div>


    <div className="saas-user-header-actions">

      <span className="saas-user-count">
        <FiUsers />
        {filteredUsers.length} Users
      </span>

      <div className="saas-user-search">

        <FiSearch className="saas-search-icon" />

        <input
          type="search"
          placeholder="Search users..."
          aria-label="Search users"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

      </div>

    </div>

  </div>


  {/* ================= USER TABLE ================= */}

  <div className="saas-user-card">

    <div className="saas-user-card-header">

      <div className="saas-user-card-heading">

        <span className="saas-user-card-icon">
          <FiShield />
        </span>

        <div>
          <h3>Organization Users</h3>
          <p>View members and manage their assigned roles.</p>
        </div>

      </div>

      <span className="saas-user-card-count">
        {filteredUsers.length} Records
      </span>

    </div>


    <div className="saas-user-table-wrapper">

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
                <div className="saas-table-message">
                  <FiLoader className="saas-user-spinner" />
                  <span>Loading users...</span>
                </div>
              </td>
            </tr>

          ) : filteredUsers.length === 0 ? (

            <tr>
              <td colSpan="4" className="table-center">
                <div className="saas-table-empty">
                  <FiUserX />
                  <h4>No users found</h4>
                  <p>
                    {search
                      ? "Try a different search term."
                      : "No organization users are available."}
                  </p>
                </div>
              </td>
            </tr>

          ) : (

            filteredUsers.map((u) => (

              <tr key={u._id}>

                {/* USER */}
                <td data-label="User">

                  <div className="saas-user-identity">

                    <span className="saas-user-avatar">
                      {u.username?.charAt(0)?.toUpperCase() || "U"}
                    </span>

                    <span className="user-name">
                      {u.username}
                    </span>

                  </div>

                </td>


                {/* EMAIL */}
                <td data-label="Email">

                  <span className="saas-user-email">
                    <FiMail />
                    {u.email}
                  </span>

                </td>


                {/* ROLE */}
                <td data-label="Role">

                  <span className={`role-pill role-${u.role}`}>

                    {u.role === "super-admin" ? (
                      <FiShield />
                    ) : u.role === "admin" ? (
                      <FiUserCheck />
                    ) : (
                      <FiUser />
                    )}

                    {u.role}

                  </span>

                </td>


                {/* CHANGE ROLE */}
                <td data-label="Change Role">

                  {u.role === "super-admin" ? (

                    <span className="protected-label">
                      <FiLock />
                      Protected
                    </span>

                  ) : (

                    <div className="saas-role-select-wrapper">

                      <select
                        aria-label={`Change role for ${u.username}`}
                        value={u.role}
                        onChange={(e) =>
                          handleRoleChange(
                            u._id,
                            e.target.value
                          )
                        }
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>

                      <FiChevronDown className="saas-select-arrow" />

                    </div>

                  )}

                </td>

              </tr>

            ))

          )}

        </tbody>

      </table>

    </div>

  </div>

</div>

  );
};

export default UserManagement;
