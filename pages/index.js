import { Page, SkeletonBodyText, Frame } from "@shopify/polaris";
import Table from "../components/dataTable";
import { useState, useEffect } from "react";
import { http } from "../services/httpServices";
import { AddProductMajor, ExportMinor } from "@shopify/polaris-icons";
import ProductPicker from "../components/resourcePicker";
import ProductList from "../components/productList";
import { CSVLink } from "react-csv";
const Index = () => {
  const [customers, setCustomers] = useState([]);
  const [csvData, setCSVData] = useState([]);
  const [products, setProducts] = useState([]);
  const [cId, setCustomerId] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);

  const handleAddProducts = () => {
    setPickerOpen((pickerOpen) => !pickerOpen);
  };

  const handleCSVExport = () => {
    console.log("handleCSVExport", customers);
    const data = customers.map((c) => {
      const history = Object.values(c.history);
      var purchaseHistory = {};
      history.forEach((h, i) => {
        purchaseHistory = {
          ...purchaseHistory,
          ["purchaseHistory - " + i]: h[0] + " , " + h[1],
        };
      });
      return {
        customer_id: c.customer_id + ".",
        customer_name: c.customer_name,
        customer_email: c.customer_email,
        track: c.track,
        ...purchaseHistory,
      };
    });
    console.log("csv", data);
    setCSVData(data);
  };

  const getPickedProducts = async (values) => {
    setProducts(values);
    console.log("product updated");
    await http.updateCustomers();

    const timer = setInterval(async () => {
      const customers = await http.getCustomers();
      setCustomers(customers.data.data);
      if (customers.data.data.length > 0) {
        clearInterval(timer);
        setCustomers(customers.data.data);
      }
    }, 3000);
  };

  const init = async () => {
    let params = new URLSearchParams(window.location.search);
    let id = params.get("id");
    id && setCustomerId(id);

    const customers = await http.getCustomers();
    setCustomers(customers.data.data);
    const products = await http.getProducts();
    setProducts(products.data.products);
  };

  useEffect(() => {
    init();
  }, []);
  return (
    <Frame>
      <Page
        title={"Tracking Report"}
        secondaryActions={[
          {
            content: "Add Products",
            icon: AddProductMajor,
            onAction: handleAddProducts,
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
        {pickerOpen && (
          <ProductPicker
            setPickedProducts={getPickedProducts}
            initProducts={products}
          />
        )}
        {pickerOpen && products.length > 0 && (
          <ProductList products={products} />
        )}
        {customers.length > 0 ? (
          <Table data={customers} cId={cId} />
        ) : (
          <SkeletonBodyText />
        )}
      </Page>
    </Frame>
  );
};

export default Index;
