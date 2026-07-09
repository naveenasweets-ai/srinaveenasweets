import { useState } from 'react';
import UpdateCatalogue from '../../components/app-customize/update-catalogue';

const ProductCatalogue = () => {
  const [showUpdateCatalogueModal, setShowUpdateCatalogueModal] =
    useState(false);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Product Catalogue</h1>
      <p>Here you can manage your product catalogue.</p>

      <div className="mt-4">
        <button
          onClick={() => setShowUpdateCatalogueModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add New Product
        </button>
      </div>

      {showUpdateCatalogueModal && (
        <UpdateCatalogue
          action="add"
          closeModal={() => setShowUpdateCatalogueModal(false)}
        />
      )}
    </div>
  );
};

export default ProductCatalogue;
