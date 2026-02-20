import ClassificationPage from "../Components/ClassificationComponent";

import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  restoreCategory,
} from "../Services/ApiServices";

const Category = () => {
  return (
    <ClassificationPage
      title="Category"
      getAll={getCategories}
      createItem={createCategory}
      updateItem={updateCategory}
      deleteItem={deleteCategory}
      restoreItem={restoreCategory}
    />
  );
};

export default Category;