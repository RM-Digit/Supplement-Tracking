import { useState, useEffect } from "react";
import { EmptyState, Layout } from "@shopify/polaris";
import { ResourcePicker } from "@shopify/app-bridge-react";

const Index = ({ setPickedProducts, initProducts }) => {
  const [open, setPickerOpen] = useState(false);
  const handleSelection = (resources) => {
    setPickerOpen(false);
    const products = resources.selection.map((product, index) => ({
      product_id: product.id.split("/")[4],
      title: product.title,
      image: product.images[0]?.originalSrc,
      totalInventory: product.totalInventory,
      tags: product.tags.toString(),
      track: 0,
    }));
    console.log("products selected");

    setPickedProducts(products);
  };

  return (
    <Layout>
      <ResourcePicker
        resourceType="Product"
        showVariants={false}
        open={open}
        onSelection={(resources) => handleSelection(resources)}
        onCancel={() => setPickerOpen(false)}
        selectMultiple
      />
      <EmptyState
        heading="Select products"
        action={{
          content: "Select",
          onAction: () => setPickerOpen(true),
        }}
      ></EmptyState>
    </Layout>
  );
};

export default Index;
