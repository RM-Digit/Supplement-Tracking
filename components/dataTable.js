import React, { useCallback, useState, useEffect } from "react";
import {
  Card,
  DataTable,
  Page,
  Button,
  FooterHelp,
  Pagination,
  Link,
} from "@shopify/polaris";
import Modal from "./modal";
import Empty from "./empty.js";

export default function Table({ data, cId }) {
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [modalData, setModalData] = useState();
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);

  const perPage = 10;
  const handleClick = (history) => {
    const dateTimeFormat = new Intl.DateTimeFormat("en", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const modalData = Object.values(history).map((p) => {
      const date = new Date(p[0]);
      const pDate = dateTimeFormat.format(date);
      return (
        <>
          <Link url={p[2]} external>
            {pDate}
          </Link>
          {` : ${p[1]} - Track Field : ${p[3] > 0 ? "+" + p[3] : p[3]}`}
        </>
      );
    });
    setOpen(true);
    setModalData(modalData);
  };

  useEffect(() => {
    let pageData = data;
    if (cId) {
      pageData = data.filter((row) => row.customer_id.toString() === cId);
    }
    let tableRows = pageData.map((row) => [
      row.customer_name,
      row.customer_email,
      row.track,
      <Button
        onClick={() => {
          handleClick(row.history);
        }}
      >
        History
      </Button>,
    ]);

    setTotal(pageData.length);
    setRows(tableRows);
  }, [data, cId]);

  return (
    <>
      {(cId === "" || (cId && rows.length > 0)) && (
        <Card>
          <DataTable
            columnContentTypes={["text", "text", "numeric", "numeric"]}
            headings={["Name", "Email", "Track", "History"]}
            rows={rows.slice(
              (currentPage - 1) * perPage,
              total > currentPage * perPage - 1
                ? currentPage * perPage - 1
                : total
            )}
          />

          <FooterHelp>
            <Pagination
              label={`${(currentPage - 1) * perPage}-${
                total > currentPage * perPage - 1
                  ? currentPage * perPage - 1
                  : total
              } of total ${total}`}
              hasPrevious={currentPage > 1}
              onPrevious={() => {
                setCurrentPage((currentPage) => currentPage - 1);
              }}
              hasNext={total > currentPage * perPage}
              onNext={() => {
                setCurrentPage((currentPage) => currentPage + 1);
              }}
            />
          </FooterHelp>
          <Modal open={open} data={modalData} />
        </Card>
      )}
      {cId && rows.length === 0 && <Empty />}
    </>
  );
}
