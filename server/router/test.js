const Router = require("koa-router");
const trackModel = require("../../models/trackModel");

const router = new Router({
  prefix: "/test",
});

function register(app) {
  router.post("/database", async (ctx) => {
    const customers = await trackModel.find({});
    customers.forEach((c,index) => {
        const find = customers.filter((d,i)=>i!==index).findIndex((x)=>x.customer_email === c.customer_email);
        if(find !== -1) {
            console.log('duplicate', c )
        }
    });
    ctx.body = { success: true };
  });

  

  app.use(router.routes());
  app.use(router.allowedMethods());
}

module.exports = register;
