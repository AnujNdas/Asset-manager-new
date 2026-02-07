import { useEffect, useState } from "react";
import InviteForm from "../Components/InviteForm";
import InviteTable from "../Components/InviteTable";
import { getInvites } from "../Services/ApiServices";
import "../Page_styles/TeamInvites.css";
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
    <div className="settings-container">
      {/* <h2>Team Invitations</h2> */}
    <div className="invite-box">
      <InviteForm onCreated={loadInvites} />
      <InviteTable invites={invites} onRevoke={loadInvites} />
      </div>
    </div>
  );
};

export default TeamInvites;
