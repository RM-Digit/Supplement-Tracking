import React from "react";
import { Toast } from "@shopify/polaris";

export default function ToastComp({ notification, callBack }) {
  return (
    <Toast
      content={notification.msg}
      error={notification.err}
      onDismiss={() => callBack(false)}
    />
  );
}
