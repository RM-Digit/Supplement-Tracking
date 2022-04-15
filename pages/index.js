import { Page, SkeletonBodyText, Frame } from "@shopify/polaris";
import Table from "../components/dataTable";
import { useState, useEffect } from "react";
import { http } from "../services/httpServices";
import {
  CustomerPlusMajor,
  AddProductMajor,
  ExportMinor,
} from "@shopify/polaris-icons";
import ProductPicker from "../components/resourcePicker";
import SupplementsPicker from "../components/supplementsPicker";
import ProductList from "../components/productList";
import SupplementsList from "../components/supplementsList";
import { CSVLink } from "react-csv";
import AddCustomer from "../components/AddCustomer";
import Toast from "../components/Toast";

const Index = () => {
  const [customers, setCustomers] = useState([]);
  const [csvData, setCSVData] = useState([]);
  const [products, setProducts] = useState([]);
  const [supplements, setSupplements] = useState([]);
  const [cId, setCustomerId] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [supplementsPickerOpen, setSupplementsPickerOpen] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [active, setActive] = useState(false);
  const [filteredRows, setFilteredRows] = useState([]);
  const [notification, setNotification] = useState({
    err: false,
    msg: "",
  });

  const handleAddProducts = () => {
    setPickerOpen((pickerOpen) => !pickerOpen);
  };

  const handleAddSupplements = () => {
    setSupplementsPickerOpen((supplementsPickerOpen) => !supplementsPickerOpen);
  };

  const handleAddCustomers = () => {
    setShowAdd((showAdd) => !showAdd);
  };

  const handleCSVExport = (e, done) => {
    const data = filteredRows.map((c) => {
      const history = c.history ? Object.values(c.history) : [];
      var purchaseHistory = {};
      history.forEach((h, i) => {
        purchaseHistory = {
          ...purchaseHistory,
          ["purchaseHistory - " + i]: h[0] + " , " + h[1],
        };
      });
      return {
        customer_name: c.customer_name,
        customer_email: c.customer_email,
        track: c.track,
        ...purchaseHistory,
      };
    });
    console.log("csv", data);
    setCSVData(data);
    done();
  };

  const getPickedProducts = async (values) => {
    setProducts(values);
    console.log("product updated");
    // await http.updateCustomers();
    // const timer = setInterval(async () => {
    //   const customers = await http.getCustomers();
    //   setCustomers(customers.data.data);
    //   if (customers.data.data.length > 0) {
    //     clearInterval(timer);
    //     setCustomers(customers.data.data);
    //   }
    // }, 3000);
  };

  const getPickedSupplements = async (values) => {
    setSupplements(values);
  };

  const addNewCustomer = async (customer) => {
    const dataToAdd = {
      customer_email: customer.email,
      customer_name: customer.name,
      track: customer.track,
      date: customer.createdAt,
    };
    http
      .addCustomer(dataToAdd)
      .then((res) => {
        if (res.data.success) {
          setActive(true);
          setNotification({
            msg: "Successfully Added a New Customer!",
            err: false,
          });
        } else {
          setActive(true);
          setNotification({
            msg: "Failed! This email address is already being used!",
            err: true,
          });
        }
      })
      .catch((err) => {
        setActive(true);
        setNotification({ msg: "Server Error", err: true });
      });
  };

  const init = async () => {
    let params = new URLSearchParams(window.location.search);
    let id = params?.get("id");
    id && setCustomerId(id);

    const customers = await http.getCustomers();
    setCustomers(customers.data.data);
    const products = await http.getProducts();
    setProducts(products.data.products);
    const supplementProducts = await http.getSupplements();
    setSupplements(supplementProducts.data.supplements);
  };

  useEffect(() => {
    init();
  }, []);

  const toastMarkup = active ? (
    <Toast
      notification={notification}
      callBack={(active) => setActive(active)}
    />
  ) : null;

  return (
    <Frame>
      <Page
        title={"Tracking Report"}
        secondaryActions={[
          {
            content: "Add Customers",
            icon: CustomerPlusMajor,
            onAction: handleAddCustomers,
          },
          {
            content: "Add Products",
            icon: AddProductMajor,
            onAction: handleAddProducts,
          },
          {
            content: "Add Supplements",
            icon: AddProductMajor,
            onAction: handleAddSupplements,
          },
          {
            content: (
              <CSVLink
                data={csvData}
                asyncOnClick={true}
                onClick={handleCSVExport}
                filename={`${new Date().toLocaleString()}.csv`}
              >
                Export CSV
              </CSVLink>
            ),
            icon: ExportMinor,
          },
        ]}
      >
        {toastMarkup}
        {showAdd && <AddCustomer getCustomer={addNewCustomer} />}
        {pickerOpen && (
          <ProductPicker
            setPickedProducts={getPickedProducts}
            initProducts={products}
          />
        )}
        {supplementsPickerOpen && (
          <SupplementsPicker setPickedProducts={getPickedSupplements} />
        )}
        {supplementsPickerOpen && supplements.length > 0 && (
          <SupplementsList products={supplements} />
        )}
        {pickerOpen && products.length > 0 && (
          <ProductList products={products} />
        )}
        {customers.length > 0 ? (
          <Table
            data={customers}
            cId={cId}
            getFilteredRows={(rows) => setFilteredRows(rows)}
          />
        ) : (
          <SkeletonBodyText />
        )}
      </Page>
    </Frame>
  );
};

export default Index;
