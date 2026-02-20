import ClassificationPage from "../Components/ClassificationComponent";
import "../Page_styles/Unit.css";
import {
  getUnits,
  createUnit,
  updateUnit,
  deleteUnit,
  restoreUnit
} from "../Services/ApiServices";

const Unit = () => {
  return (
    <ClassificationPage
      title="Unit"
      getAll={getUnits}
      createItem={createUnit}
      updateItem={updateUnit}
      deleteItem={deleteUnit}
      restoreItem={restoreUnit}
    />
  );
};

export default Unit;