const axios = require("axios");

// https://www.autovit.ro/autoturisme/mercedes-benz/glc/de-la-2019/?search%5Border%5D=created_at_first%3Adesc

const baseURL = "https://www.autovit.ro";
const axiosInstance = axios.create({ baseURL });

const subPathForModel = (model) =>
  `autoturisme/mercedes-benz/${model}/de-la-2019/?search%5Border%5D=created_at_first%3Adesc`;

const modelSubPath = {
  glb: subPathForModel("glb"),
  glc: subPathForModel("glc"),
  glcCoupe: subPathForModel("glc-coupe"),
  gle: subPathForModel("gle"),
  gleCoupe: subPathForModel("gle-coupe"),
};

const extractCarUrls = (html, carModel = "glc") => {
  let regexp = /https:\/\/www\.autovit\.ro\/anunt\/[a-zA-Z0-9-.]+/g;
  const allUrls = html.match(regexp);
  return allUrls ? Array.from(new Set(allUrls)) : [];
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
