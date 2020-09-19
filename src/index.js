const path = require("path");
const { JsonDB } = require("node-json-db");
const { Config } = require("node-json-db/dist/lib/JsonDBConfig");
const config = require("./config");
const autoklass = require("./scrappers/autoklass.js");
const {
  scrapper: eliteCarsLeasingScrapper,
} = require("./scrappers/eliteCarsLeasing");
const { sleep } = require("./lib/utils");

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; // allow any https certificate

const db = new JsonDB(
  new Config(path.join(__dirname, "../db.json"), true, true, "|")
);

const processUrls = (urls) => {
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
};

const findNewCarsOnAutoklass = async (model) => {
  console.log(`Search on Autoklass for ${model}`);
  const autoklassScrapper = autoklass.scrapper({ ...config.car, model });
  await autoklassScrapper.scrapCarUrls().then(processUrls);
  return sleep();
};

const findNewCarsOnElite = async (model = "glc") => {
  console.log(`Search on elite-cars-leasing.ro for ${model}`);
  const carConfig = { ...config.car, model };
  await eliteCarsLeasingScrapper(carConfig).scrapCarUrls().then(processUrls);
  return sleep();
};

const findNewCars = async () => {
  await findNewCarsOnAutoklass("glc");
  await findNewCarsOnAutoklass("glcCoupe");
  await findNewCarsOnAutoklass("gle");
  await findNewCarsOnAutoklass("gleCoupe");

  await findNewCarsOnElite("glc");
  await findNewCarsOnElite("gle");
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
