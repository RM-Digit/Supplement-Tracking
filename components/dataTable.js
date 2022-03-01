import React, { useCallback, useState, useEffect } from "react";
import {
  Card,
  DataTable,
  Icon,
  Button,
  FooterHelp,
  Pagination,
  Link,
  TextField,
  Toast,
} from "@shopify/polaris";
import Modal from "./modal";
import Empty from "./empty.js";
import { http } from "../services/httpServices";
import {
  RecentSearchesMajor,
  ResetMinor,
  ExchangeMajor,
  SaveMinor,
} from "@shopify/polaris-icons";

export default function Table({ data, cId }) {
  const [rows, setRows] = useState([]);
  const [changeActive, setChangeActive] = useState(-1);
  const [track, setTrack] = useState(0);
  const [open, setOpen] = useState(false);
  const [modalData, setModalData] = useState();
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [active, setActive] = React.useState(false);
  const [resetActive, setResetActive] = React.useState([]);
  const toggleActive = useCallback(() => setActive((active) => !active), []);
  const [searchValue, setSearchValue] = useState("");

  const perPage = 10;
  const handleClick = (history) => {
    if (history === {}) return true;
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

  const handleChange = (row, index) => {
    console.log("changeActive", row);
    setChangeActive(index);
  };

  const handleUpdate = async (id, index) => {
    const update = await http.updateById(id, track);
    setChangeActive(-1);
    setActive(true);
  };
  const handleReset = async (id, index) => {
    const reset = await http.resetById(id);
    setResetActive([...resetActive, index]);
    setActive(true);
  };

  const handleTextChange = (v) => {
    console.log("v", v);
    setTrack(v);
  };

  const handleSearch = (value) => {
    console.log("value", value);
    setSearchValue(value);
  };

  useEffect(() => {
    let pageData = data;
    if (cId) {
      pageData = data.filter((row) => row.customer_id.toString() === cId);
    }
    let tableRows = pageData
      .filter(
        (row) =>
          (row.customer_email &&
            row.customer_email
              .toLowerCase()
              .includes(searchValue.toLowerCase())) ||
          (row.customer_name &&
            row.customer_name.toLowerCase().includes(searchValue.toLowerCase()))
      )
      .map((row, index) => [
        row.customer_name,
        row.customer_email,
        changeActive === index ? (
          <TextField value={track} onChange={handleTextChange} />
        ) : resetActive.includes(index) ? (
          0
        ) : (
          row.track
        ),
        <span style={{ display: "flex", gap: "10px" }}>
          {changeActive === index ? (
            <Button
              onClick={() => handleUpdate(row.customer_id, index)}
              icon={SaveMinor}
            ></Button>
          ) : (
            <Button
              onClick={() => {
                handleChange(row.customer_id, index);
              }}
              icon={ExchangeMajor}
            ></Button>
          )}
          <Button
            onClick={() => {
              handleClick(row.history);
            }}
            icon={RecentSearchesMajor}
          ></Button>
          <Button
            onClick={() => handleReset(row.customer_id, index)}
            icon={ResetMinor}
          ></Button>
        </span>,
      ]);

    setTotal(pageData.length);
    setRows(tableRows);
  }, [data, cId, changeActive, track, resetActive, searchValue]);

  const toastMarkup = active ? (
    <Toast content="Operation Success!" onDismiss={toggleActive} />
  ) : null;

  return (
    <>
      {(cId === "" || (cId && rows.length > 0)) && (
        <Card
          actions={[
            {
              content: (
                <TextField
                  value={searchValue}
                  onChange={(v) => handleSearch(v)}
                  placeholder="Search By Email or Name"
                />
              ),
            },
          ]}
        >
          {toastMarkup}
          <DataTable
            columnContentTypes={["text", "text", "numeric", "text"]}
            headings={["Name", "Email", "Track", "Actions"]}
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
