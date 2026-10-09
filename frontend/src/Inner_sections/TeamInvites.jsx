import { useEffect, useState } from "react";
import InviteForm from "../Components/InviteForm";
import InviteTable from "../Components/InviteTable";
import { getInvites } from "../Services/ApiServices";
import "../Page_styles/TeamInvites.css";
import {
  FiUsers
} from "react-icons/fi";
const TeamInvites = () => {
  const [invites, setInvites] = useState([]);

  const loadInvites = async () => {
    const res = await getInvites();
    setInvites(res.data);
  };

  useEffect(() => {
    loadInvites();
  }, []);

  return (

<div className="settings-container team-invites-page">

  {/* PAGE HEADER */}
  <div className="team-invites-page-header">
    <div className="team-invites-heading">
      <span className="team-invites-heading-icon">
        <FiUsers />
      </span>

      <div>
        <h2>Team Invitations</h2>
        <p>
          Invite team members and manage access to your organization.
        </p>
      </div>
    </div>
  </div>

  {/* MAIN CONTENT */}
  <div className="invite-box">
    <InviteForm onCreated={loadInvites} />

    <InviteTable
      invites={invites}
      onRevoke={loadInvites}
    />
  </div>

</div>

  );
};

export default TeamInvites;
