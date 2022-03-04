const Router = require("koa-router");
// const customerModel = require("../../models/customerModel");
const trackModel = require("../../models/trackModel");
const prodcutModel = require("../../models/productModel");
const router = new Router({
  prefix: "/webhook",
});

function register(app) {
  router.post("/order-received", async (ctx) => {
    const order = ctx.request.body;
    console.log("webhook order", order.source_name, order.customer.id);
    const customer_id = order.customer.id.toString();
    const products = await prodcutModel.find({});
    const tracks = await trackModel.find({});
    const resetProducts = [7342578958577, 7342578565361];
    var purchaseUpdate = {};
    var hasSupplements = false;
    var check_rest = 0;

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
        check_rest++;
      }
    });

    const customer = tracks.find((x) => x.customer_id === customer_id);

    if (customer) {
      line_items.forEach((item) => {
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

          trackModel.findOneAndUpdate(
            { customer_id: customer_id },
            {
              $inc: {
                track: purchaseUpdate[item.product_id] * item.quantity,
              },
              history: history,
            }
          );
        }
      });
    } else if (hasSupplements) {
      let dataToSave = {};
      dataToSave.track = 0;
      line_items.forEach((item) => {
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
      const saveCustomer = new trackModel(dataToSave);
      saveCustomer.save(dataToSave);
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
      const inst = new trackModel(temp);
      inst.save(temp);
    }

    if (check_rest >= 2) {
      trackModel.findOneAndUpdate(
        { customer_id: customer_id },
        {
          track: 0,
          history: {
            [order.id]: [
              new Date().toLocaleDateString(),
              "Reset",
              order.order_status_url,
              0,
            ],
          },
        }
      );
    }
    ctx.status = 200;
    ctx.body = { success: true };
  });

  app.use(router.routes());
  app.use(router.allowedMethods());
}

module.exports = register;
