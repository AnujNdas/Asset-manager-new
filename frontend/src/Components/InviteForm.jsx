import { useState } from "react";
import { createInvite } from "../Services/ApiServices";
import ThemeSwal from "../utils/SwalTheme";

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
      <h3>Create Invite</h3>

      {/* EMAIL */}
      <div className="form-row">
        <label>Email</label>

        <input
          type="email"
          placeholder="Enter user email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      {/* ROLE */}
      <div className="form-row">
        <label>Role</label>

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* EXPIRY */}
      <div className="form-row">
        <label>Expires In (days)</label>

        <input
          type="number"
          min="1"
          max="30"
          value={expiresInDays}
          onChange={(e) =>
            setExpiresInDays(Number(e.target.value))
          }
        />
      </div>

      {/* SUBMIT */}
      <button
        onClick={handleCreate}
        disabled={loading}
      >
        {loading ? "Sending..." : "Send Invite"}
      </button>
    </div>
  );
};

export default InviteForm;