import { useEffect, useState } from "react";
import "../Component_styles/OrganizationModal.css";
import { getOrganizationUsers } from "../Services/AdminServices";

const OrganizationModal = ({ organization, onClose }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await getOrganizationUsers(organization._id);
        setUsers(res.data || res);
        console.log("Organization Users:", res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [organization]);

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <h2>{organization.name}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {loading && <p>Loading users...</p>}

          {!loading && users.length === 0 && (
            <p>No users found in this organization</p>
          )}

          {!loading && users.length > 0 && (
            <table className="modal-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  {/* <th>Status</th> */}
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    {/* <td>{user.status}</td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrganizationModal;
