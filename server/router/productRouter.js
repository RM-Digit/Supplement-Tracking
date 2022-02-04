const Router = require("koa-router");
const productModel = require("../../models/productModel");

const router = new Router({
  prefix: "/api/products",
});

function register(app) {
  router.post("/save", async (ctx) => {
    const body = ctx.request.body.data;
    const deleteModel = await productModel.deleteMany({});
    const saveModel = await productModel.insertMany(body);
    ctx.body = { success: true };
  });

  router.post("/get", async (ctx) => {
    const products = await productModel.find({});
    ctx.body = { success: true, products: products };
  });

  app.use(router.routes());
  app.use(router.allowedMethods());
}

module.exports = register;
