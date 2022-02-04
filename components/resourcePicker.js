import { useState, useEffect } from "react";
import { EmptyState, Layout } from "@shopify/polaris";
import { ResourcePicker } from "@shopify/app-bridge-react";
import { http } from "../services/httpServices";

const Index = ({ setPickedProducts, initProducts }) => {
  const [open, setPickerOpen] = useState(false);
  const [initialSelectionIds, setInitialSelectionIds] = useState([]);
  const handleSelection = (resources) => {
    setPickerOpen(false);
    const track = [1, 5, 10, -1];
    const products = resources.selection.map((product, index) => ({
      product_id: product.id.split("/")[4],
      title: product.title,
      image: product.images[0]?.originalSrc,
      totalInventory: product.totalInventory,
      tags: product.tags.toString(),
      track: track[index],
    }));
    console.log("products", products);

    var productsToSave = initProducts;
    for (const [i, v] of products.entries()) {
      productsToSave[i] = v;
    }

    http.saveProducts(productsToSave).then((res) => {
      if (res.data.success) console.log("success");
    });
    setPickedProducts(productsToSave);
  };

  return (
    <Layout>
      <ResourcePicker
        resourceType="Product"
        showVariants={false}
        open={open}
        onSelection={(resources) => handleSelection(resources)}
        onCancel={() => setPickerOpen(false)}
        selectMultiple={4}
      />
      <EmptyState
        heading="Select up to 4 products"
        action={{
          content: "Select",
          onAction: () => setPickerOpen(true),
        }}
      ></EmptyState>
    </Layout>
  );
};

export default Index;
