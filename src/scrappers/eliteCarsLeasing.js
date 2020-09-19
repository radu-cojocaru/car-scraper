const axios = require("axios");

// https://elite-cars-leasing.ro/collections/clasa-glc/products/mercedes-benz-glc-250-4matic-ledbeige-comand-pano-key-kam
// https://elite-cars-leasing.ro/collections/clasa-gle
// https://elite-cars-leasing.ro/collections/clasa-glc

const baseURL = "https://elite-cars-leasing.ro";
const axiosInstance = axios.create({ baseURL });

const modelSubPath = {
  glc: "/collections/clasa-glc",
  gle: "/collections/clasa-gle",
};

const modelUrlRegexp = {
  glc: /\/collections\/clasa-glc\/products\/mercedes-benz-glc[a-zA-Z0-9-]+/g,
  gle: /\/collections\/clasa-gle\/products\/mercedes-benz-gle[a-zA-Z0-9-]+/g,
};

const extractCarUrls = (html, carModel = "glc") => {
  let regexp = modelUrlRegexp[carModel];
  const allUrls = html.match(regexp);
  return allUrls
    ? Array.from(new Set(allUrls)).map((url) => `${baseURL}${url}`)
    : [];
};

const scrapper = (carConfig = {}) => ({
  async scrapCarUrls() {
    if (!modelSubPath[carConfig.model]) {
      return [];
    }

    return axiosInstance
      .request({
        url: modelSubPath[carConfig.model],
      })
      .then((response) => extractCarUrls(response.data, carConfig.model))
      .catch((err) => {
        console.error(err);
      });
  },
});

module.exports = {
  scrapper,
  website: baseURL,
};
