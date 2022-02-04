import React from "react";
import {
  Thumbnail,
  Card,
  ResourceItem,
  ResourceList,
  TextStyle,
  SkeletonThumbnail,
} from "@shopify/polaris";

export default function App({ products }) {
  return (
    <Card>
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
                <h3>
                  <TextStyle variation="strong">trackNumber</TextStyle>
                </h3>
                <div style={{ textAlign: "center" }}>{track}</div>
              </div>
            </ResourceItem>
          );
        }}
      />
    </Card>
  );
}
