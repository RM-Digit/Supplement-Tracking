const Router = require("koa-router");
const trackModel = require("../../models/trackModel");

const router = new Router({
  prefix: "/api",
});

function register(app) {
  router.post("/resetById", async (ctx) => {
    const customer_id = ctx.request.body.id;
    console.log("reset", customer_id);
    const update = await trackModel.findOneAndUpdate(
      { customer_id: customer_id },
      {
        track: 0,
        history: {
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
    console.log("update", customer_id);
    const update = await trackModel.findOneAndUpdate(
      { customer_id: customer_id },
      {
        track: val,
        history: {
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

  app.use(router.routes());
  app.use(router.allowedMethods());
}

module.exports = register;
