import React, { useCallback, useState, useEffect } from "react";
import {
  Card,
  DataTable,
  Button,
  FooterHelp,
  Modal,
  Pagination,
  Link,
  TextField,
  Toast,
} from "@shopify/polaris";
import HistoryModal from "./modal";
import Empty from "./empty.js";
import { http } from "../services/httpServices";
import {
  RecentSearchesMajor,
  ResetMinor,
  ExchangeMajor,
  SaveMinor,
  DeleteMajor,
} from "@shopify/polaris-icons";

export default function Table({ data, cId, getFilteredRows }) {
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
  const [rowToDelete, setDeleteRow] = useState("");
  const [deleteModalActive, setDeleteModalActive] = useState(false);
  const [supplements, searchSupplements] = useState("");

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
    setTrack(v);
  };

  const handleSearch = (value) => {
    setSearchValue(value);
  };

  const handleDelete = async (type) => {
    if (type === "yes") {
      await http.deleteById(rowToDelete);
    } else {
      setDeleteRow("");
    }
    setDeleteModalActive(false);
  };

  useEffect(() => {
    let pageData = data;
    if (cId) {
      pageData = data.filter((row) => row.customer_id.toString() === cId);
    }
    const filteredRows = pageData
      .filter((c) => supplements === "" || c.track == supplements)
      .filter((r) => r.customer_id !== rowToDelete)
      .filter(
        (row) =>
          (row.customer_email &&
            row.customer_email
              .toLowerCase()
              .includes(searchValue.toLowerCase())) ||
          (row.customer_name &&
            row.customer_name.toLowerCase().includes(searchValue.toLowerCase()))
      );
    let tableRows = filteredRows.map((row, index) => [
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
        <Button
          onClick={() => {
            setDeleteModalActive(true);
            setDeleteRow(row.customer_id);
          }}
          icon={DeleteMajor}
        ></Button>
      </span>,
    ]);

    setTotal(tableRows.length);
    setRows(tableRows);
    getFilteredRows(filteredRows);
  }, [
    data,
    cId,
    changeActive,
    track,
    resetActive,
    searchValue,
    rowToDelete,
    supplements,
  ]);

  const toastMarkup = active ? (
    <Toast content="Operation Success!" onDismiss={toggleActive} />
  ) : null;

  return (
    <>
      <Modal
        open={deleteModalActive}
        onClose={() => setDeleteModalActive(false)}
        title="Are you sure you want to delete this customer?"
        primaryAction={{
          content: "Yes",
          onAction: () => handleDelete("yes"),
        }}
        secondaryActions={[
          {
            content: "No",
            onAction: () => handleDelete("no"),
          },
        ]}
      ></Modal>
      {(cId === "" || (cId && rows.length > 0)) && (
        <Card
          actions={[
            {
              content: (
                <TextField
                  min={0}
                  value={supplements}
                  type="number"
                  onChange={(v) => searchSupplements(v)}
                  placeholder="All"
                />
              ),
            },
            {
              content: (
                <TextField
                  value={searchValue}
                  onChange={(v) => handleSearch(v)}
                  placeholder="Type Email or Name"
                />
              ),
            },
          ]}
        >
          {toastMarkup}
          <DataTable
            columnContentTypes={["text", "text", "numeric", "text"]}
            headings={["Name", "Email", "Track", "Actions"]}
            verticalAlign="middle"
            rows={rows.slice(
              (currentPage - 1) * perPage,
              total > currentPage * perPage - 1 ? currentPage * perPage : total
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
          <HistoryModal open={open} data={modalData} />
        </Card>
      )}
      {cId && rows.length === 0 && <Empty />}
    </>
  );
}
