const path = require("path");
const { JsonDB } = require("node-json-db");
const { Config } = require("node-json-db/dist/lib/JsonDBConfig");
const config = require("./config");
const autoklass = require("./scrappers/autoklass.js");

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; // allow any https certificate

const db = new JsonDB(
  new Config(path.join(__dirname, "../db.json"), true, true, "|")
);

const findNewCars = () => {
  const autoklassScrapper = autoklass.scrapper(config);
  autoklassScrapper.scrapCarUrls().then((urls) => {
    let newUrls = 0;

    urls.forEach((url) => {
      let urlData;
      const urlPath = `|urls|${url}`;
      try {
        urlData = db.getData(urlPath);
        urlData.lastSeen = new Date().toISOString();
        db.push(urlPath, urlData);
      } catch (err) {
        urlData = { firstSeen: new Date().toISOString() };
        db.push(urlPath, urlData);
      }
      if (!urlData.verdict) {
        console.log(url);
        newUrls++;
      }
    });

    console.log(`New urls: ${newUrls}`);
  });
};

const visitNewCars = () => {
  const urlsData = db.getData("|urls");
  const urls = Object.keys(urlsData).filter((url) => !urlsData[url].visited);
  console.log(urls);
};

const countCars = () => {
  const urlsData = db.getData("|urls");
  console.log(Object.keys(urlsData).length);
};

findNewCars();
// countCars();
