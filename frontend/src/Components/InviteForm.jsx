    import { useState } from "react";
    import { createInvite } from "../Services/ApiServices";
    import Swal from "sweetalert2";

    const InviteForm = ({ onCreated }) => {
    const [role, setRole] = useState("user");
    const [expiresInDays, setExpiresInDays] = useState(7);
    const [loading, setLoading] = useState(false);

const handleCreate = async () => {
  try {
    setLoading(true);

    const data = await createInvite({
      role,
      expiresInDays,
    });

    const { inviteUrl } = data;

    await navigator.clipboard.writeText(inviteUrl);

    Swal.fire({
      icon: "success",
      title: "Invite Created",
      html: `
        <p>Invite link copied to clipboard</p>
        <small style="word-break: break-all;">${inviteUrl}</small>
      `,
    });

    onCreated?.();
  } catch (err) {
    console.error(err);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: err.response?.data?.error || "Failed to create invite",
    });
  } finally {
    setLoading(false);
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
        </div>
    );
    };

    export default InviteForm;
