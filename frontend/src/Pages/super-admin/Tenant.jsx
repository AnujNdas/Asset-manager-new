import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getOrganizations,
  toggleOrganizationStatus
} from "../../Services/AdminServices";
import "../../Page_styles/Tenant.css";
import OrganizationModal from "../../Components/OrganizationModal";
const Tenants = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [error, setError] = useState("");
  const handleView = (org) => {
  setSelectedOrg(org);
  setIsModalOpen(true);
};

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const orgs = await getOrganizations();
      setTenants(orgs.data || orgs); // safe for both formats
    } catch (err) {
      console.error(err);
      setError(err.userMessage || "Failed to load organizations");
    } finally {
      setLoading(false);
    }
  };

const handleToggleStatus = async (org) => {
  try {
    await toggleOrganizationStatus(org._id);
    fetchTenants();
  } catch (err) {
    alert(err.userMessage || "Failed to update status");
  }
};


  useEffect(() => {
    fetchTenants();
  }, []);

  if (loading) return <h2>Loading organizations...</h2>;
  if (error) return <h2>{error}</h2>;

  return (
    <>
      <h1 className="page-title">Organizations</h1>

      <div className="tenant-grid">
        {tenants.length === 0 && (
          <p>No organizations found</p>
        )}

        {tenants.map((org) => {
          const isActive = org.effectiveStatus === "active";


          return (
            <div className="tenant-card" key={org._id}>
              <div className="tenant-header">
                <h3>{org.name}</h3>
<span
  className={`status-badge ${
    isActive ? "active" : "suspended"
  }`}
>
  {isActive ? "Active" : "Inactive"}
</span>

              </div>

              <div className="tenant-body">
                <div className="meta">
                  <span>Users</span>
                  <strong>{org.userCount ?? 0}</strong>
                </div>

                <div className="meta">
                  <span>Created</span>
                  <strong>
                    {new Date(org.createdAt).toLocaleDateString()}
                  </strong>
                </div>
              </div>

              <div className="tenant-actions">
                <button className="btn" onClick={() => handleView(org)}>
  View
</button>


<button
  onClick={() => handleToggleStatus(org)}
  disabled={org.userCount === 0}
  className={`btn ${
    isActive ? "btn-danger" : "btn-success"
  }`}
>
  {org.userCount === 0
    ? "No Users"
    : isActive
    ? "Suspend"
    : "Activate"}
</button>

              </div>
            </div>
          );
        })}
        {isModalOpen && (
  <OrganizationModal
    organization={selectedOrg}
    onClose={() => setIsModalOpen(false)}
  />
)}

      </div>
    </>
  );
};

export default Tenants;
