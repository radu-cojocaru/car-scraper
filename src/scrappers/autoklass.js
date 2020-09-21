const axios = require("axios");

// https://www.autoklass-market.ro/masini/Mercedes-Benz/GLC?filtre=km_min:0|an_fabr_min:2019"
// https://www.autoklass-market.ro/masini/Mercedes-Benz/GLC_Coupe?filtre=an_fabr_min:2019

const baseURL = "https://www.autoklass-market.ro";
const axiosInstance = axios.create({ baseURL });

const modelSubPath = {
  glb: "/masini/Mercedes-Benz/GLB",
  glc: "/masini/Mercedes-Benz/GLC",
  glcCoupe: "/masini/Mercedes-Benz/GLC_Coupe",
  gle: "/masini/Mercedes-Benz/GLE",
  gleCoupe: "/masini/Mercedes-Benz/GLE_Coupe",
};

const modelUrlRegexp = {
  glb: /https:\/\/www.autoklass-market.ro\/masini\/Mercedes-Benz\/GLB\/([A-Za-z0-9-_])+/g,
  glc: /https:\/\/www.autoklass-market.ro\/masini\/Mercedes-Benz\/GLC\/([A-Za-z0-9-_])+/g,
  glcCoupe: /https:\/\/www.autoklass-market.ro\/masini\/Mercedes-Benz\/GLC_Coupe\/([A-Za-z0-9-_])+/g,
  gle: /https:\/\/www.autoklass-market.ro\/masini\/Mercedes-Benz\/GLE\/([A-Za-z0-9-_])+/g,
  gleCoupe: /https:\/\/www.autoklass-market.ro\/masini\/Mercedes-Benz\/GLE_Coupe\/([A-Za-z0-9-_])+/g,
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
  let regexp = modelUrlRegexp[carModel];
  const allUrls = html.match(regexp);
  return allUrls ? Array.from(new Set(allUrls)) : [];
};

const scrapper = (carConfig = {}) => {
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
      if (!modelSubPath[carConfig.model]) {
        return [];
      }

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
  website: baseURL,
};
