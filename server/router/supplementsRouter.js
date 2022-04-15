const Router = require("koa-router");
const supplementModel = require("../../models/supplementModel");

const router = new Router({
  prefix: "/api/supplements",
});

function register(app) {
  router.post("/save", async (ctx) => {
    const body = ctx.request.body.data;
    await supplementModel.deleteMany({});
    await supplementModel.insertMany(body);
    ctx.body = { success: true };
  });

  router.post("/get", async (ctx) => {
    const products = await supplementModel.find({});
    ctx.body = { success: true, supplements: products };
  });

  app.use(router.routes());
  app.use(router.allowedMethods());
}

module.exports = register;
