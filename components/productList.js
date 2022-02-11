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
      track: value[product.product_id],
    }));

    http.saveProducts(productsToSave).then((res) => {
      if (res.data.success) setActive(true);
    });
  };

  const toastMarkup = active ? (
    <Toast
      content="It can take up to 1 min for the change to be reflected."
      onDismiss={toggleActive}
    />
  ) : null;

  return (
    <Card sectioned>
      {Object.keys(value).length > 0 ? (
        <Card.Header
          title="Selected Products"
          actions={[
            {
              content: <Button primary>Save Products</Button>,
              onAction: handleSave,
            },
          ]}
        ></Card.Header>
      ) : (
        <Card.Header title="Selected Products"></Card.Header>
      )}
      {toastMarkup}
      <ResourceList
        resourceName={{ singular: "product", plural: "products" }}
        items={products}
        renderItem={(item, index) => {
          const { product_id, image, title, tags, track } = item;
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
                    label="trackNumber"
                    value={value[product_id]}
                    placeholder={track}
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
