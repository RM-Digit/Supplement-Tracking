const Shopify = require("shopify-api-node");
import dotenv from "dotenv";

dotenv.config();
const shopify = new Shopify({
  shopName: process.env.SHOP_PROD,
  apiKey: process.env.SHOPIFY_API_KEY_PROD,
  password: process.env.SHOPIFY_API_PWD_PROD,
});

module.exports = shopify;
