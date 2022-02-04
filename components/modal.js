import React, { useCallback, useState, useEffect } from "react";
import { List, Link, Modal } from "@shopify/polaris";

export default function ModalExample({ open, data }) {
  const [active, setActive] = useState(false);
  const [modalData, setModalData] = useState([]);
  useEffect(() => {
    setActive(open);
    setModalData(data);
  }, [open, data]);
  const handleChange = useCallback(() => setActive(!active), [active]);

  return (
    <Modal
      open={active}
      onClose={handleChange}
      title="View Purchase History"
      secondaryActions={[
        {
          content: "Close",
          onAction: handleChange,
        },
      ]}
    >
      <Modal.Section>
        <List type="number">
          {modalData &&
            modalData.map((line, i) => <List.Item key={i}>{line}</List.Item>)}
        </List>
      </Modal.Section>
    </Modal>
  );
}
