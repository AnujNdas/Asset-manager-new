import { useState } from "react";
import { createInvite } from "../Services/ApiServices";
import ThemeSwal from "../utils/swalTheme";
import {
  FiUserPlus,
  FiInfo,
  FiLoader,
  FiSend,
} from "react-icons/fi";
const InviteForm = ({ onCreated }) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [expiresInDays, setExpiresInDays] = useState(7);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    try {
      if (!email.trim()) {
        return ThemeSwal.fire({
          icon: "warning",
          title: "Email Required",
          text: "Please enter an email address",
        });
      }

      setLoading(true);

      await createInvite({
        email,
        role,
        expiresInDays,
      });

      ThemeSwal.fire({
        icon: "success",
        title: "Invite Sent",
        text: `Invitation email sent to ${email}`,
        customClass: {
          confirmButton: "my-confirm-btn",
        },
      });

      setEmail("");
      setRole("user");
      setExpiresInDays(7);

      onCreated?.();

    } catch (err) {
      console.error(err);

      ThemeSwal.fire({
        icon: "error",
        title: "Error",
        text:
          err.response?.data?.message ||
          "Failed to send invite",
        customClass: {
          confirmButton: "my-confirm-btn",
        },
      });

    } finally {
      setLoading(false);
    }
  };

  return (

<div className="invite-form-card">

  <div className="invite-form-header">
    <div className="invite-form-heading">
      <span className="invite-form-icon">
        <FiUserPlus />
      </span>

      <div>
        <h3>Create Invitation</h3>
        <p>
          Send an invitation to add a new team member.
        </p>
      </div>
    </div>
  </div>

  <div className="invite-form-fields">

    {/* EMAIL */}
    <div className="form-row">
      <label htmlFor="invite-email">
        Email Address
      </label>

      <input
        id="invite-email"
        type="email"
        placeholder="Enter user email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
    </div>

    {/* ROLE */}
    <div className="form-row">
      <label htmlFor="invite-role">
        Assign Role
      </label>

      <select
        id="invite-role"
        value={role}
        onChange={(e) => setRole(e.target.value)}
      >
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>
    </div>

    {/* EXPIRY */}
    <div className="form-row">
      <label htmlFor="invite-expiry">
        Expires In (Days)
      </label>

      <input
        id="invite-expiry"
        type="number"
        min="1"
        max="30"
        value={expiresInDays}
        onChange={(e) =>
          setExpiresInDays(Number(e.target.value))
        }
      />
    </div>

  </div>

  <div className="invite-form-footer">
    <div className="invite-form-hint">
      <FiInfo />
      <span>
        The invitation will expire after the selected number of days.
      </span>
    </div>

    <button
      type="button"
      className="invite-submit-btn"
      onClick={handleCreate}
      disabled={loading}
    >
      {loading ? (
        <>
          <FiLoader className="invite-spinner" />
          Sending...
        </>
      ) : (
        <>
          <FiSend />
          Send Invite
        </>
      )}
    </button>
  </div>

</div>

  );
};

export default InviteForm;