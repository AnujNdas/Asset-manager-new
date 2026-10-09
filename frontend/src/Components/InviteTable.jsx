import ThemeSwal from "../utils/swalTheme";
import {
  revokeInvite,
} from "../Services/ApiServices";
// import "../Component_styles/InviteTable.css"
import {
  FiCopy,
  FiTrash2,
  FiMail,
  FiShield,
  FiUser,
  FiClock,
  FiInbox
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

  {/* TABLE HEADER */}
  <div className="invite-table-header">
    <div className="invite-table-heading">
      <span className="invite-table-heading-icon">
        <FiMail />
      </span>

      <div>
        <h3>Team Invites</h3>
        <p>
          Manage invitations sent to team members.
        </p>
      </div>
    </div>

    <span className="invite-count">
      {invites.length} Invite{invites.length !== 1 ? "s" : ""}
    </span>
  </div>

  {/* EMPTY STATE */}
  {invites.length === 0 ? (
    <div className="empty-invites">
      <span className="empty-invites-icon">
        <FiInbox />
      </span>

      <h4>No invitations yet</h4>
      <p>
        Invitations you create will appear here.
      </p>
    </div>
  ) : (
    <div className="invite-grid">

      {invites.map((invite) => (
        <div
          key={invite._id}
          className={`invite-card ${invite.status}`}
        >

          {/* CARD TOP */}
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

            <span className={`invite-status ${invite.status}`}>
              {invite.status}
            </span>
          </div>

          {/* EMAIL */}
          <div className="invite-email">
            <span className="invite-email-icon">
              <FiMail />
            </span>

            <div className="invite-email-details">
              <span className="invite-email-label">
                INVITED EMAIL
              </span>

              <span className="invite-email-value">
                {invite.email}
              </span>
            </div>
          </div>

          {/* META */}
          <div className="invite-meta-grid">
            <div className="meta-box">
              <span className="meta-label">
                Invitation Uses
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

          {/* DATE DETAILS */}
          <div className="invite-time">
            <FiClock />

            <div className="invite-time-details">
              <p>
                <span>Created</span>
                <strong>{formatDate(invite.createdAt)}</strong>
              </p>

              <p>
                <span>Expires</span>
                <strong>{formatDate(invite.expiresAt)}</strong>
              </p>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="invite-actions">
            <button
              type="button"
              className="copy-btn"
              onClick={() => handleCopy(invite.inviteUrl)}
            >
              <FiCopy />
              Copy Link
            </button>

            <button
              type="button"
              className="revoke-btn"
              onClick={() => handleRevoke(invite._id)}
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