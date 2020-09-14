const axios = require("axios");

// https://www.autoklass-market.ro/masini/Mercedes-Benz/GLC?filtre=km_min:0|an_fabr_min:2019"
// https://www.autoklass-market.ro/masini/Mercedes-Benz/GLC_Coupe?filtre=an_fabr_min:2019
const baseURL = "https://www.autoklass-market.ro/masini/";
const axiosInstance = axios.create({ baseURL });

const modelSubPath = {
  glc: "Mercedes-Benz/GLC",
  glcCoupe: "Mercedes-Benz/GLC_Coupe"
};

// filtre=km_min:0|an_fabr_min:2019
const buildFilter = ({ minYear, minKm } = {}) => {
  const params = [];
  if (minYear) {
    params.push(`an_fabr_min:${minYear}`);
  }
  if (minKm && minKm > 0) {
    params.push(`km_min:${minKm}`);
  }
  return params.join("|");
};

const extractCarUrls = (html, carModel = "glc") => {
  let regexp = /https:\/\/www.autoklass-market.ro\/masini\/Mercedes-Benz\/GLC\/([A-Za-z0-9-_])+/g;
  if (carModel === "glcCoupe") {
    regexp = /https:\/\/www.autoklass-market.ro\/masini\/Mercedes-Benz\/GLC_Coupe\/([A-Za-z0-9-_])+/g;
  }

  const allUrls = html.match(regexp);
  return allUrls ? Array.from(new Set(allUrls)) : [];
};

const scrapper = (config = {}) => {
  const carConfig = config.car;

  const fetchUrlsFromPage = (pageNo = 1) => {
    return axiosInstance
      .request({
        url: modelSubPath[carConfig.model],
        params: {
          filtre: buildFilter(carConfig),
          s: pageNo,
        },
      })
      .then((response) =>
        response.data.includes("Cautarea nu a returnat nici un rezultat.")
          ? []
          : extractCarUrls(response.data, carConfig.model)
      )
      .catch((err) => {
        console.error(err);
      });
  };

  return {
    async scrapCarUrls() {
      let page = 1;
      let stop = false;
      let allCarUrls = [];
      while (!stop) {
        try {
          const urls = await fetchUrlsFromPage(page);
          if (urls.length > 0) {
            allCarUrls = allCarUrls.concat(urls);
            page += 1;
          } else {
            stop = true;
          }
        } catch (err) {
          stop = true;
          console.error(err);
        }
      }
      return allCarUrls;
    },
  };
};

module.exports = {
  buildFilter,
  extractCarUrls,
  scrapper,
};
