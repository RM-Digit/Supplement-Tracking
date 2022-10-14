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

    console.log("pos promote", body);

    const trackData = await trackModel.find({});
    var total = 0,
      curr = {};
    var balance = 0;

    trackData.forEach((d) => {
      if (d.customer_id == body.customer_id) {
        curr.track = d.track;
        curr.name = d.customer_name;
      }
      total += d.track;
    });
    if (body.customer_id === null || body.customer_id === 0) {
      balance = total;
    } else {
      balance = curr.track || 0;
    }
    console.log("balance", balance);
    ctx.status = 200;
    ctx.body = {
      type: "simple_action_list",
      points_label: "Purchases",
      points_balance: balance,
      actions: [
        {
          type: "flat_discount",
          title: "Supplement Tracking",
          description: "Track Purchase History",
          action_id: "sup123ABC" + i,
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
