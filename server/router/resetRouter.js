const Router = require("koa-router");
const trackModel = require("../../models/trackModel");
const { v4: uuidv4 } = require("uuid");

const router = new Router({
  prefix: "/api",
});

function register(app) {
  router.post("/resetById", async (ctx) => {
    const customer_id = ctx.request.body.id;
    const customer = await trackModel.findOne({ customer_id: customer_id });
    const update = await trackModel.findOneAndUpdate(
      { customer_id: customer_id },
      {
        customer_id: customer_id,
        customer_email: customer.customer_email,
        customer_name: customer.customer_name,
        track: 0,
        history: {
          ...customer.history,
          "manual reset": [
            new Date().toLocaleDateString(),
            "Manual Reset",
            "#",
            0,
          ],
        },
      }
    );

    ctx.body = { success: true };
  });

  router.post("/updateById", async (ctx) => {
    const customer_id = ctx.request.body.id;
    const val = ctx.request.body.value;
    const customer = await trackModel.findOne({ customer_id: customer_id });

    const update = await trackModel.findOneAndUpdate(
      { customer_id: customer_id },
      {
        customer_id: customer_id,
        customer_email: customer.customer_email,
        customer_name: customer.customer_name,
        track: val,
        history: {
          ...customer.history,
          "manual change": [
            new Date().toLocaleDateString(),
            "Manual Change",
            "#",
            val,
          ],
        },
      }
    );
    ctx.body = { success: true };
  });

  router.post("/deleteById", async (ctx) => {
    const customer_id = ctx.request.body.id;
    console.log("delete", customer_id);
    await trackModel.findOneAndDelete({
      customer_id: customer_id,
    });
    ctx.body = { success: true };
  });

  router.post("/addNewCustomer", async (ctx) => {
    const dataToAdd = ctx.request.body.customer;
    const customer = await trackModel.findOne({
      customer_email: dataToAdd.customer_email,
    });
    if (customer) ctx.body = { success: false };
    else {
      const id = uuidv4();
      const data = {
        customer_id: id,
        customer_email: dataToAdd.customer_email,
        customer_name: dataToAdd.customer_name,
        track: dataToAdd.track,
        history: {
          [id]: [dataToAdd.date, "Add New Customer", "#", dataToAdd.track],
        },
      };
      await trackModel.create(data);
      ctx.body = { success: true };
    }
  });

  app.use(router.routes());
  app.use(router.allowedMethods());
}

module.exports = register;
