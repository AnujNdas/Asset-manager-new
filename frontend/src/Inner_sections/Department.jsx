import ClassificationPage from "../Components/ClassificationComponent";
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  restoreDepartment
} from "../Services/ApiServices";

const Department = () => {
  return (
    <ClassificationPage
      title="Department"
      getAll={getDepartments}
      createItem={createDepartment}
      updateItem={updateDepartment}
      deleteItem={deleteDepartment}
      restoreItem={restoreDepartment}
    />
  );
};

export default Department;