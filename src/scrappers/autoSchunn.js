const axios = require("axios");
const querystring = require("querystring");

const baseURL = "https://www.auto-schunn.ro";
const axiosInstance = axios.create({ baseURL });

const modelVal = {
  glc: "glc",
  gle: "gle",
};

const extractCarUrls = (html, carModel = "glc") => {
  let regexp = /https:\/\/www\.auto-schunn\.ro\/detaliu-auto-[a-zA-Z0-9-_/]+\.htm/g;
  const allUrls = html.match(regexp);
  return allUrls ? Array.from(new Set(allUrls)) : [];
};

const scrapper = (carConfig = {}) => ({
  async scrapCarUrls() {
    if (!modelVal[carConfig.model]) {
      return [];
    }

    return axiosInstance
      .post(
        "/auto-mercedes-benz-rulate-autoturisme-oferte-livrare-imediata",
        querystring.stringify({
          auto_noix: "on",
          auto_rulatex: "on",
          categ_autox: "ALL",
          marcax: "Mercedes-Benz",
          model_bazax: "ALL",
          culoarex: "ALL",
          auto_searchx: modelVal[carConfig.model],
          inm_an_minVAL: "2019",
          inm_an_maxVAL: "2020",
          inm_an_minSELECTED: "2019",
          inm_an_maxSELECTED: "2020",
          km_minVAL: "0",
          km_maxVAL: "680000",
          km_minSELECTED: "0",
          km_maxSELECTED: "680000",
          pret_minVAL: "3503",
          pret_maxVAL: "244095",
          pret_minSELECTED: "3000",
          pret_maxSELECTED: "250000",
          orderedx: "dmodifyed DESC",
        })
      )
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
