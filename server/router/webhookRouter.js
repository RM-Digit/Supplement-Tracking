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
    console.log("webhook order", order.customer.id);
    const customer_id = order.customer.id;
    const products = await prodcutModel.find({});
    const tracks = await trackModel.find({});
    var purchaseUpdate = {};
    products.forEach((product) => {
      purchaseUpdate = {
        ...purchaseUpdate,
        [product.product_id]: product.track,
      };
    });

    order.line_items.forEach((item) => {
      if (Object.keys(purchaseUpdate).includes(item.product_id.toString())) {
        const customer = tracks.find((x) => x.customer_id === customer_id);
        if (customer) {
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
        } else {
          const temp = {
            customer_id: customer_id,
            customer_email: order.customer.email,
            customer_name: `${order.customer.first_name} ${order.customer.last_name}`,
            track: purchaseUpdate[item.product_id] * item.quantity,
            history: {
              [item.product_id + order.id]: [
                order.created_at,
                item.title,
                order.order_status_url,
                purchaseUpdate[item.product_id] * item.quantity,
              ],
            },
          };
          trackModel.insertOne(temp);
        }
      }
    });
    ctx.status = 200;
    ctx.body = { success: true };
  });

  app.use(router.routes());
  app.use(router.allowedMethods());
}

module.exports = register;
