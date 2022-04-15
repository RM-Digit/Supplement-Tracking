import { useState, useEffect } from "react";
import { EmptyState, Layout } from "@shopify/polaris";
import { ResourcePicker } from "@shopify/app-bridge-react";

const Index = ({ setPickedProducts }) => {
  const [open, setPickerOpen] = useState(false);
  const handleSelection = (resources) => {
    setPickerOpen(false);
    console.log("product", resources.selection);
    const products = resources.selection.map((product, index) => ({
      product_id: product.id.split("/")[4],
      product_GID: product.id,
      title: product.title,
      image: product.image?.originalSrc,
      quantity: 0,
    }));

    setPickedProducts(products);
  };

  return (
    <Layout>
      <ResourcePicker
        resourceType="ProductVariant"
        showVariants={true}
        open={open}
        onSelection={(resources) => handleSelection(resources)}
        onCancel={() => setPickerOpen(false)}
        selectMultiple
      />
      <EmptyState
        heading="Select Supplements"
        action={{
          content: "Select",
          onAction: () => setPickerOpen(true),
        }}
      ></EmptyState>
    </Layout>
  );
};

export default Index;
