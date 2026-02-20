import ClassificationPage from "../Components/ClassificationComponent";
import {
  getLocations,
  createLocation,
  updateLocation,
  deleteLocation,
  restoreLocation
} from "../Services/ApiServices";

const Location = () => {
  return (
    <ClassificationPage
      title="Location"
      getAll={getLocations}
      createItem={createLocation}
      updateItem={updateLocation}
      deleteItem={deleteLocation}
      restoreItem={restoreLocation}
    />
  );
};

export default Location;