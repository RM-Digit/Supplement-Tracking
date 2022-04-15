import React, { useCallback } from "react";
import {
  Thumbnail,
  Card,
  ResourceItem,
  ResourceList,
  TextStyle,
  SkeletonThumbnail,
  TextField,
  Button,
  Toast,
} from "@shopify/polaris";
import { http } from "../services/httpServices";
export default function App({ products }) {
  const [value, setValue] = React.useState({});
  const [active, setActive] = React.useState(false);
  const handleTextChange = (v, id) => {
    setValue((value) => ({ ...value, [id]: v }));
  };
  const toggleActive = useCallback(() => setActive((active) => !active), []);
  const handleSave = () => {
    const productsToSave = products.map((product) => ({
      ...product,
      quantity: value[product.product_id],
    }));

    http.saveSupplements(productsToSave).then((res) => {
      if (res.data.success) setActive(true);
    });
  };

  const toastMarkup = active ? (
    <Toast content="Successfully Added Supplements" onDismiss={toggleActive} />
  ) : null;

  return (
    <Card sectioned>
      {Object.keys(value).length > 0 ? (
        <Card.Header
          title="Selected Products"
          actions={[
            {
              content: <Button primary>Save Supplements</Button>,
              onAction: handleSave,
            },
          ]}
        ></Card.Header>
      ) : (
        <Card.Header title="Selected Supplements"></Card.Header>
      )}
      {toastMarkup}
      <ResourceList
        resourceName={{ singular: "product", plural: "products" }}
        items={products}
        renderItem={(item, index) => {
          const { product_id, image, title, tags, quantity } = item;
          const media = image ? (
            <Thumbnail source={image} alt={title} />
          ) : (
            <SkeletonThumbnail size="medium" />
          );

          return (
            <ResourceItem
              id={product_id}
              tags={tags}
              media={media}
              accessibilityLabel={`View details for ${title}`}
            >
              <div style={{ float: "left" }}>
                <h3>
                  <TextStyle variation="strong">{title}</TextStyle>
                </h3>
                <div>{tags}</div>
              </div>
              <div style={{ float: "right" }}>
                <div style={{ textAlign: "center" }}>
                  <TextField
                    label="Quantity"
                    value={value[product_id]}
                    placeholder={quantity}
                    onChange={(v) => handleTextChange(v, product_id)}
                    autoComplete="off"
                  />
                </div>
              </div>
            </ResourceItem>
          );
        }}
      />
    </Card>
  );
}
