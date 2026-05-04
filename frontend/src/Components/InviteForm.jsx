import { useState } from "react";
import { createInvite } from "../Services/ApiServices";
import ThemedSwal from "../utils/SwalTheme";

const InviteForm = ({ onCreated }) => {
  const [role, setRole] = useState("user");
  const [expiresInDays, setExpiresInDays] = useState(7);
  const [loading, setLoading] = useState(false);
  const [inviteUrl, setInviteUrl] = useState("");

  const handleCreate = async () => {
    try {
      setLoading(true);

      const data = await createInvite({
        role,
        expiresInDays,
      });

      setInviteUrl(data.inviteUrl);

      ThemeSwal.fire({
        icon: "success",
        title: "Invite Created",
        text: "You can copy the invite link below.",
      });

      onCreated?.();
    } catch (err) {
      console.error(err);
      ThemeSwal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.error || "Failed to create invite",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      ThemeSwal.fire({
        icon: "success",
        title: "Copied!",
        text: "Invite link copied to clipboard",
        timer: 1500,
        showConfirmButton: true,
          customClass: {
            confirmButton: "my-confirm-btn",
            cancelButton: "my-cancel-btn"
          },

      });
    } catch (err) {
      ThemeSwal.fire({
        icon: "error",
        title: "Copy Failed",
        text: "Unable to copy invite link",
      });
    }
  };

  return (
    <div className="invite-form-card">
      <h3>Create Invite</h3>

      <div className="form-row">
        <label>Role</label>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div className="form-row">
        <label>Expires In (days)</label>
        <input
          type="number"
          min="1"
          max="30"
          value={expiresInDays}
          onChange={(e) => setExpiresInDays(Number(e.target.value))}
        />
      </div>

      <button onClick={handleCreate} disabled={loading}>
        {loading ? "Creating..." : "Generate Invite"}
      </button>

      {inviteUrl && (
        <div className="invite-result">
          <label>Invite Link</label>
          <div className="invite-link-row">
            <input type="text" value={inviteUrl} readOnly />
            <button onClick={handleCopy}>Copy</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InviteForm;