export const jwtSecret = process.env.JWT_SECRET;
export const mongodbUri =
  process.env.NODE_ENV === "production"
    ? process.env.MONGODB_PROD_URI
    : process.env.MONGODB_DEV_URI;
export const defaultPassword = process.env.DEFAULT_PASSWORD;
export const encryptionKey = process.env.ENCRYPTION_KEY;
export const encryptionAlgorithm = process.env.ENCRYPTION_ALGORITHM;
export const xssOptions = {
  whiteList: [],
  stripIgnoreTag: [],
  stripIgnoreTagBody: ["script"],
};
