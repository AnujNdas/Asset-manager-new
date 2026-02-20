import ClassificationPage from "../Components/ClassificationComponent";

import {
  getStatuses,
  createStatus,
  updateStatus,
  deleteStatus,
  restoreStatus,
} from "../Services/ApiServices";

const Status = () => {
  return (
    <ClassificationPage
      title="Status"
      getAll={getStatuses}
      createItem={createStatus}
      updateItem={updateStatus}
      deleteItem={deleteStatus}
      restoreItem={restoreStatus}
    />
  );
};

export default Status;