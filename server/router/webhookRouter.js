const Router = require("koa-router");
// const customerModel = require("../../models/customerModel");
const trackModel = require("../../models/trackModel");

const router = new Router({
  prefix: "/webhook",
});

function register(app) {
  router.post("/order-received", async (ctx) => {
    const trackProducts = {
      7443809140977: 1,
      7516467396849: 5,
      7516467298545: 10,
      7519373263089: -1,
    };
    const order = ctx.request.body;
    console.log("body", order);
    const customer_id = order.customer.id;

    const findItem1 = order.line_items.find(
      (item) => item.product_id == Object.keys(trackProducts)[0]
    );
    const findItem2 = order.line_items.find(
      (item) => item.product_id == Object.keys(trackProducts)[1]
    );
    const findItem3 = order.line_items.find(
      (item) => item.product_id == Object.keys(trackProducts)[2]
    );
    const findItem4 = order.line_items.find(
      (item) => item.product_id == Object.keys(trackProducts)[3]
    );

    if (findItem1) {
      let update = await trackModel.findOneAndUpdate(
        { customer_id: customer_id },
        {
          $set: {
            order_id: order.id,
            customer_id: customer_id,
            customer_name: `${order.customer.first_name} ${order.customer.last_name}`,
            customer_email: order.customer.email,
            item_title: findItem1.title,
            $inc: { track: 1 },
            $mergeObjects: {
              history: {
                [findItem1.product_id]: [
                  order.created_at,
                  item.title,
                  order.order_status_url,
                  purchaseUpdate[item.product_id],
                ],
              },
            },
          },
        },
        { upsert: true, new: true }
      );

      console.log("item1 updated");
    }

    if (findItem2) {
      let update = await trackModel.findOneAndUpdate(
        { customer_id: customer_id },
        {
          $set: {
            order_id: order.id,
            customer_id: customer_id,
            customer_name: `${order.customer.first_name} ${order.customer.last_name}`,
            customer_email: order.customer.email,
            item_title: findItem1.title,
            $inc: { track: 5 },
          },
        },
        { upsert: true, new: true }
      );

      console.log("item2 updated");
    }

    if (findItem3) {
      let update = await trackModel.findOneAndUpdate(
        { customer_id: customer_id },
        {
          $set: {
            order_id: order.id,
            customer_id: customer_id,
            customer_name: `${order.customer.first_name} ${order.customer.last_name}`,
            customer_email: order.customer.email,
            item_title: findItem3.title,
            $inc: { track: 10 },
          },
        },
        { upsert: true, new: true }
      );

      console.log("item3 updated");
    }

    if (findItem4) {
      let update = await trackModel.findOneAndUpdate(
        { customer_id: customer_id },
        {
          $set: {
            order_id: order.id,
            customer_id: customer_id,
            customer_name: `${order.customer.first_name} ${order.customer.last_name}`,
            customer_email: order.customer.email,
            item_title: findItem4.title,
            $inc: { track: -1 },
          },
        },
        { upsert: true, new: true }
      );

      console.log("item4 updated");
    }

    ctx.body = { success: true };
  });

  app.use(router.routes());
  app.use(router.allowedMethods());
}

module.exports = register;
