const Router = require("koa-router");
const shopify = require("../../services/shopify");
const trackModel = require("../../models/trackModel");
const cron = require("node-cron");
const prodcutModel = require("../../models/productModel");

async function updateTable() {
  const products = await prodcutModel.find({});
  var purchaseUpdate = {};
  const resetProducts = [7342578958577, 7342578565361];
  products.forEach((product) => {
    purchaseUpdate = {
      ...purchaseUpdate,
      [product.product_id]: product.track,
    };
  });

  var orders = [];
  var params = { limit: 250, status: "any" };

  do {
    const pageData = await shopify.order.list(params);
    orders = [...orders, ...pageData];
    params = pageData.nextPageParameters;
  } while (params !== undefined);
  console.log("ordercount", orders.length);
  orders.reverse();
  var data = [],
    duplicate_check = {},
    index = 0;
  var check_rest = 0;

  orders.forEach((order) => {
    if (!order.customer) return;
    check_rest = 0;
    order.line_items.forEach((item) => {
      if (!item.product_id) return;

      if (
        resetProducts.includes(item.product_id) &&
        item.total_discount === item.price
      ) {
        check_rest++;
      }

      if (Object.keys(purchaseUpdate).includes(item.product_id.toString())) {
        const customer_id = order.customer.id;

        if (Object.keys(duplicate_check).includes(customer_id.toString())) {
          const i = duplicate_check[customer_id];
          data[i].track += purchaseUpdate[item.product_id];
          data[i].history = {
            ...data[i].history,
            [item.product_id + order.id]: [
              order.created_at,
              item.title,
              order.order_status_url,
              purchaseUpdate[item.product_id],
            ],
          };
        } else {
          duplicate_check = { ...duplicate_check, [customer_id]: index++ };
          const track = purchaseUpdate[item.product_id];
          const temp = {
            order_id: order.id,
            customer_id: customer_id,
            customer_name: `${order.customer.first_name} ${order.customer.last_name}`,
            customer_email: order.customer.email,
            item_title: item.title,
            track: track,
            history: {
              [item.product_id + order.id]: [
                order.created_at,
                item.title,
                order.order_status_url,
                purchaseUpdate[item.product_id],
              ],
            },
          };
          data.push(temp);
        }
      }

      if (check_rest === 2 && duplicate_check[order.customer.id]) {
        const i = duplicate_check[order.customer.id];
        data[i].track = 0;
        data[i].history = {
          [item.product_id + order.id]: [
            new Date().toLocaleDateString(),
            "Reset",
            order.order_status_url,
            0,
          ],
        };
      }
    });
  });
  const deleteModel = await trackModel.deleteMany({});
  const saveModel = await trackModel.insertMany(data);
  return saveModel;
}
cron.schedule("* * * * *", () => {
  console.log("running a task every minute");
  updateTable();
});

const router = new Router({
  prefix: "/api/customers",
});

function register(app) {
  router.post("/update", async (ctx) => {
    const updates = await updateTable();
    ctx.body = { success: true };
  });

  router.post("/get", async (ctx) => {
    const data = await trackModel.find({});
    ctx.body = { success: true, data: data };
  });

  app.use(router.routes());
  app.use(router.allowedMethods());
}

module.exports = register;