import ThemeSwal from "../utils/swalTheme";
import {
  revokeInvite,
} from "../Services/ApiServices";
import "../Component_styles/InviteTable.css"
import {
  FiCopy,
  FiTrash2,
  FiMail,
  FiShield,
  FiUser,
  FiClock,
} from "react-icons/fi";

const InviteTable = ({ invites = [], onRevoke }) => {

  const handleCopy = (inviteUrl) => {
    navigator.clipboard.writeText(inviteUrl);

    ThemeSwal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "Invite link copied",
      showConfirmButton: false,
      timer: 1500,
      background: "#222831",
      color: "#DFD0B8",
    });
  };

  const handleRevoke = async (id) => {
    const confirm = await ThemeSwal.fire({
      title: "Revoke Invite?",
      text: "This invite will no longer be usable.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Revoke",
      background: "#222831",
      color: "#DFD0B8",
    });

    if (!confirm.isConfirmed) return;

    await revokeInvite(id);
    onRevoke?.();
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="invite-table-card">
      <div className="invite-table-header">
        <div>
          <h3>Team Invites</h3>
          <p>Manage pending invitations sent to users</p>
        </div>

        <div className="invite-count">
          {invites.length} Invite{invites.length !== 1 ? "s" : ""}
        </div>
      </div>

      {invites.length === 0 ? (
        <div className="empty-invites">
          <h4>No invites created yet</h4>
          <p>
            Newly created invitations will appear here.
          </p>
        </div>
      ) : (
        <div className="invite-grid">
          {invites.map((invite) => (
            <div
              key={invite._id}
              className={`invite-card ${invite.status}`}
            >
              {/* TOP */}
              <div className="invite-top">
                <div className="invite-role">
                  {invite.role === "admin" ? (
                    <FiShield />
                  ) : (
                    <FiUser />
                  )}

                  <span>
                    {invite.role === "admin"
                      ? "Administrator"
                      : "User"}
                  </span>
                </div>

                <div
                  className={`invite-status ${invite.status}`}
                >
                  {invite.status}
                </div>
              </div>

              {/* EMAIL */}
              <div className="invite-email">
                <FiMail />
                <span>{invite.email}</span>
              </div>

              {/* META */}
              <div className="invite-meta-grid">

                <div className="meta-box">
                  <span className="meta-label">
                    Uses
                  </span>

                  <strong>
                    {invite.usedCount || 0}
                    {invite.maxUses
                      ? ` / ${invite.maxUses}`
                      : " / ∞"}
                  </strong>
                </div>

                <div className="meta-box">
                  <span className="meta-label">
                    Remaining
                  </span>

                  <strong>
                    {invite.remainingDays ?? 0} days
                  </strong>
                </div>

              </div>

              {/* TIME */}
              <div className="invite-time">
                <FiClock />

                <div>
                  <p>
                    Created:
                    {" "}
                    {formatDate(invite.createdAt)}
                  </p>

                  <p>
                    Expires:
                    {" "}
                    {formatDate(invite.expiresAt)}
                  </p>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="invite-actions">

                <button
                  className="copy-btn"
                  onClick={() =>
                    handleCopy(invite.inviteUrl)
                  }
                >
                  <FiCopy />
                  Copy Link
                </button>

                <button
                  className="revoke-btn"
                  onClick={() =>
                    handleRevoke(invite._id)
                  }
                >
                  <FiTrash2 />
                  Revoke
                </button>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InviteTable;