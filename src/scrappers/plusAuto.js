const axios = require("axios");

// https://plus-auto.ro/parc-auto/autoturisme/comanda/%7B%22make%22:%22mercedes-benz%22,%22model%22:%22glc-coupe%22,%22year_from%22:%2208.2019%22%7D?sort=noi

const baseURL = "https://plus-auto.ro";
const axiosInstance = axios.create({ baseURL });

const subPathForModel = (model) =>
  `parc-auto/autoturisme/comanda/%7B%22make%22:%22mercedes-benz%22,%22model%22:%22${model}%22,%22year_from%22:%2208.2019%22%7D`;

const modelSubPath = {
  glb: subPathForModel("glb"),
  glc: subPathForModel("glc"),
  glcCoupe: subPathForModel("glc-coupe"),
  gle: subPathForModel("gle"),
  gleCoupe: subPathForModel("gle-coupe"),
};

const extractCarUrls = (html, carModel = "glc") => {
  let regexp = /\/anunt\/[0-9]+/g;
  const allUrls = html.match(regexp);
  return allUrls
    ? Array.from(new Set(allUrls)).map((url) => `${baseURL}${url}`)
    : [];
};

const scrapper = (carConfig = {}) => ({
  async scrapCarUrls() {
    return axiosInstance
      .request({
        url: modelSubPath[carConfig.model],
        params: {
          sort: "noi",
        },
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
