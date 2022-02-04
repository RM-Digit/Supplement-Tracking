const Router = require("koa-router");
const trackModel = require("../../models/trackModel");
var i = 0;
const router = new Router({
  prefix: "/pos",
});

function register(app) {
  router.post("/promotions", async (ctx) => {
    i++;
    const body = ctx.request.body;

    const trackData = await trackModel.find({});
    var total = 0,
      curr = {};
    var balance = 0;

    trackData.forEach((d) => {
      if (d.customer_email === body.customer_email) {
        curr.track = d.track;
        curr.name = d.customer_name;
      }
      total += d.track;
    });
    if (body.customer_id === null) {
      balance = total;
    } else {
      balance = curr.track || 0;
    }

    ctx.status = 200;
    ctx.body = {
      type: "simple_action_list",
      points_label: "Visits",
      points_balance: balance,
      actions: [
        {
          type: "flat_discount",
          title: "RLT Tracking",
          description: "Track Purchase History",
          action_id: "123ABC" + i,
          value: "1",
        },
      ],
    };
  });

  router.post("/perform_action", async (ctx) => {});

  router.post("/revert_action", async (ctx) => {});
  app.use(router.routes());
  app.use(router.allowedMethods());
}

module.exports = register;
