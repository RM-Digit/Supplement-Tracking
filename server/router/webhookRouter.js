const Router = require("koa-router");
import Shopify, { ApiVersion } from "@shopify/shopify-api";
// const customerModel = require("../../models/customerModel");
const trackModel = require("../../models/trackModel");
const prodcutModel = require("../../models/productModel");
const supplementsModel = require("../../models/supplementModel");
import dotenv from "dotenv";

dotenv.config();

const client = new Shopify.Clients.Graphql(
  process.env.SHOP_PROD,
  process.env.SHOPIFY_API_PWD_PROD
);

const router = new Router({
  prefix: "/webhook",
});

const getCalcOrderID = async (order_gid) => {
  const queryString = `
    mutation beginEdit{
      orderEditBegin(id:"${order_gid}" ){
        calculatedOrder{
          id
        }
      }
    }`;
  const response = await client.query({ data: queryString });
  return response.body.data.orderEditBegin.calculatedOrder.id;
};

const addVariantToOrder = async (CALCULATED_ORDER_ID, VARIANT_ID, quantity) => {
  const queryString = `
    mutation addVariantToOrder{
      orderEditAddVariant(id: "${CALCULATED_ORDER_ID}", variantId: "${VARIANT_ID}" quantity: ${quantity}){
          calculatedOrder {
            id
            addedLineItems(first:5) {
              edges {
                node {
                  id
                }
              }
            }
          }
          userErrors {
            field
            message
          }
      }
    }`;

  const response = await client.query({ data: queryString });
  return response.body.data;
};

const commitOrderEdit = async (CALCULATED_ORDER_ID) => {
  const queryString = `
  mutation commitEdit {
    orderEditCommit(id: "${CALCULATED_ORDER_ID}", notifyCustomer: false, staffNote: "Edited By APP") {
      order {
        id
      }
      userErrors {
        field
        message
      }
    }
  }`;
  const response = await client.query({ data: queryString });
  return response.body;
};

function register(app) {
  router.post("/order-received", async (ctx) => {
    console.log("Hook Trigger");

    try {
      ctx.status = 200;
      ctx.body = { success: true };
      const order = ctx.request.body;
      const customer_id = order.customer.id.toString();
      const products = await prodcutModel.find({});

      const resetProducts = ["7342578958577", "7342578565361"];
      var purchaseUpdate = {};
      var hasSupplements = false;
      var check_reset = 0;
      var customer = await trackModel.findOne({ customer_id: customer_id });
      products.forEach((product) => {
        purchaseUpdate = {
          ...purchaseUpdate,
          [product.product_id]: product.track,
        };
      });
      const line_items = order.line_items.map((item) => ({
        product_id: item.product_id.toString(),
        title: item.title,
        quantity: item.quantity,
      }));

      line_items.forEach((item) => {
        if (Object.keys(purchaseUpdate).includes(item.product_id)) {
          hasSupplements = true;
        }
        if (
          resetProducts.includes(item.product_id) &&
          item.total_discount === item.price
        ) {
          check_reset++;
        }
      });

      if (customer) {
        if (hasSupplements) {
          let dataToSave = {};
          for (let i = 0; i < line_items.length; i++) {
            const item = line_items[i];
            if (Object.keys(purchaseUpdate).includes(item.product_id)) {
              const history = {
                ...customer.history,
                [item.product_id + order.id]: [
                  order.created_at,
                  item.title,
                  order.order_status_url,
                  purchaseUpdate[item.product_id] * item.quantity,
                ],
              };
              dataToSave = {
                customer_id: customer_id,
                customer_email: order.customer.email,
                customer_name: `${order.customer.first_name} ${order.customer.last_name}`,
                track:
                  customer.track +
                  purchaseUpdate[item.product_id] * item.quantity,
                history: history,
              };
            }
          }
          await trackModel.findOneAndReplace(
            { customer_id: customer_id },
            dataToSave
          );
          customer = dataToSave;
        }
      } else if (hasSupplements) {
        let dataToSave = {};
        dataToSave.track = 0;
        line_items.forEach((item) => {
          if (Object.keys(purchaseUpdate).includes(item.product_id)) {
            dataToSave = {
              customer_id: customer_id,
              customer_email: order.customer.email,
              customer_name: `${order.customer.first_name} ${order.customer.last_name}`,
              track:
                dataToSave.track +
                purchaseUpdate[item.product_id] * item.quantity,
              history: {
                ...dataToSave.history,
                [item.product_id + order.id]: [
                  order.created_at,
                  item.title,
                  order.order_status_url,
                  purchaseUpdate[item.product_id] * item.quantity,
                ],
              },
            };
          }
        });
        console.log("dataToSave -- no customer", dataToSave);
        await trackModel.create(dataToSave);
      } else {
        const temp = {
          customer_id: customer_id,
          customer_email: order.customer.email,
          customer_name: `${order.customer.first_name} ${order.customer.last_name}`,
          track: 0,
          history: {
            [customer_id]: [
              order.customer.created_at,
              `${order.customer.first_name} ${order.customer.last_name}`,
              order.customer.email,
              "New Customer Added",
            ],
          },
        };
        console.log("new customer");
        await trackModel.create(temp);
      }

      if (customer && customer.track > 8 && order.source_name === "web") {
        const order_gid = order.admin_graphql_api_id;
        const variantsToAdd = await supplementsModel.find({});
        for (let i = 0; i < variantsToAdd.length; i++) {
          const { product_GID, quantity } = variantsToAdd[i];
          const cid = await getCalcOrderID(order_gid);
          const variantAdd = await addVariantToOrder(
            cid,
            product_GID,
            quantity
          );
          const commit = await commitOrderEdit(cid);
        }
      }

      if (check_reset >= 2) {
        check_reset = 0;
        const customer_history = customer.history;
        const current = customer.track;
        const update = await trackModel.findOneAndUpdate(
          { customer_id: customer_id },
          {
            customer_id: customer_id,
            customer_email: customer.customer_email,
            customer_name: customer.customer_name,
            track: current > 8 ? current - 8 : 0,
            history: {
              ...customer_history,
              [order.id + customer_id]: [
                order.created_at,
                "Reset",
                order.order_status_url,
                current > 8 ? current - 8 : 0,
              ],
            },
          },
          { new: true }
        );
        customer = update;
      }
    } catch (error) {
      ctx.status = 200;
      ctx.body = { success: false, msg: "server error" };
    }
  });

  router.post("/order-created", async (ctx) => {
    const order = ctx.request.body;
    if (!order.customer) {
      ctx.status = 200;
      ctx.body = { success: false, msg: "no customer" };
      return;
    }

    const customer_id = order.customer.id.toString();

    const track = await trackModel
      .findOne({ customer_id: customer_id })
      .distinct("track");
    if (track > 8 && order.source_name === "web") {
      const variantsToAdd = await supplementsModel.find({});
      for (let i = 0; i < variantsToAdd.length; i++) {
        const { product_GID, quantity } = variantsToAdd[i];
        const cid = await getCalcOrderID(order_gid);
        const variantAdd = await addVariantToOrder(cid, product_GID, quantity);
        const commit = await commitOrderEdit(cid);
      }
    }

    ctx.status = 200;
    ctx.body = { success: true };
  });

  app.use(router.routes());
  app.use(router.allowedMethods());
}

module.exports = register;
