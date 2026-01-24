import Swal from "sweetalert2";
import { revokeInvite } from "../Services/ApiServices";

const InviteTable = ({ invites = [], onRevoke }) => {

  const handleCopy = (token) => {
    const link = `${window.location.origin}/signup?invite=${token}`;
    navigator.clipboard.writeText(link);

    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "Invite link copied",
      showConfirmButton: false,
      timer: 1500,
    });
  };

  const handleRevoke = async (id) => {
    const confirm = await Swal.fire({
      title: "Revoke Invite?",
      text: "This invite will no longer be usable.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Revoke",
    });

    if (!confirm.isConfirmed) return;

    await revokeInvite(id);
    onRevoke?.();
  };

  return (
    <div className="invite-table-card">
      <h3>Active Invites</h3>

      {invites.length === 0 ? (
        <p>No invites created yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Role</th>
              <th>Uses</th>
              <th>Expires</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {invites.map((invite) => (
              <tr key={invite._id}>
                <td>{invite.role}</td>
                <td>
                  {invite.usedCount} / {invite.maxUses}
                </td>
                <td>
                  {new Date(invite.expiresAt).toLocaleDateString()}
                </td>
                <td className="actions">
                  <button onClick={() => handleCopy(invite.inviteToken)}>
                    Copy Link
                  </button>
                  <button
                    className="danger"
                    onClick={() => handleRevoke(invite._id)}
                  >
                    Revoke
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default InviteTable;
