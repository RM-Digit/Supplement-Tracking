import React from "react";
import { Card, EmptyState } from "@shopify/polaris";

export default function App({}) {
  const handleAction = () => {
    parent.location.href =
      "https://shiftsetgo.myshopify.com/admin/apps/shiftsetgo/";
  };

  return (
    <Card sectioned>
      <EmptyState
        heading="No history for this customer"
        action={{ content: "View All", onAction: handleAction }}
        image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
        fullWidth
      >
        <p>
          You can view all the fields by clicking the "View All" button. You can
          see the purchase history for the listed customers by clicking the
          "History" button.
        </p>
      </EmptyState>
    </Card>
  );
}
