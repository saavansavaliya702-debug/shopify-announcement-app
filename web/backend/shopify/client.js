import "@shopify/shopify-api/adapters/node";
import { shopifyApi, LATEST_API_VERSION } from "@shopify/shopify-api";
import "dotenv/config";
export const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: (process.env.SHOPIFY_SCOPES || "write_products,read_products").split(
    ",",
  ),
  hostName: (process.env.SHOPIFY_APP_URL || "localhost:3000").replace(
    /^https?:\/\//,
    "",
  ),
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: true,
});

const METAFIELD_NAMESPACE = "my_app";
const METAFIELD_KEY = "announcement";

export async function syncAnnouncementToShopify(shopDomain, accessToken, text) {
  const session = {
    shop: shopDomain,
    accessToken,
  };

  const client = new shopify.clients.Graphql({ session });
  const shopQuery = await client.request(`query { shop { id } }`);
  const shopId = shopQuery?.data?.shop?.id;
  if (!shopId) {
    throw new Error("Could not resolve shop GID from Shopify Admin API");
  }

  const mutation = `
    mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields {
          id
          namespace
          key
          value
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables = {
    metafields: [
      {
        ownerId: shopId,
        namespace: METAFIELD_NAMESPACE,
        key: METAFIELD_KEY,
        type: "single_line_text_field",
        value: text,
      },
    ],
  };

  const response = await client.request(mutation, { variables });

  const userErrors = response?.data?.metafieldsSet?.userErrors;
  if (userErrors && userErrors.length > 0) {
    throw new Error(
      `Shopify metafieldsSet userErrors: ${JSON.stringify(userErrors)}`,
    );
  }

  return response?.data?.metafieldsSet?.metafields?.[0];
}
