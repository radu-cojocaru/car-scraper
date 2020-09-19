const path = require("path");
const { JsonDB } = require("node-json-db");
const { Config } = require("node-json-db/dist/lib/JsonDBConfig");
const config = require("./config");
const autoklass = require("./scrappers/autoklass.js");
const eliteCarsLeasing = require("./scrappers/eliteCarsLeasing");
const plusAuto = require("./scrappers/plusAuto");
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
  const scrapper = autoklass.scrapper({ ...config.car, model });
  await scrapper.scrapCarUrls().then(processUrls);
  return sleep();
};

const findNewCarsOnElite = async (model = "glc") => {
  console.log(`Search on elite-cars-leasing.ro for ${model}`);
  const scrapper = eliteCarsLeasing.scrapper({ ...config.car, model });
  await scrapper.scrapCarUrls().then(processUrls);
  return sleep();
};

const findNewCarsOnPlusAuto = async (model = "glc") => {
  console.log(`Search on plus-auto.ro for ${model}`);
  const scrapper = plusAuto.scrapper({ ...config.car, model });
  await scrapper.scrapCarUrls().then(processUrls);
  // await scrapper.scrapCarUrls().then((urls) => console.log(urls));
  return sleep();
};

const findNewCars = async () => {
  const { mercedesModels } = config;

  // await findNewCarsOnAutoklass("glc");
  // await findNewCarsOnAutoklass("glcCoupe");
  // await findNewCarsOnAutoklass("gle");
  // await findNewCarsOnAutoklass("gleCoupe");

  await findNewCarsOnElite(mercedesModels.glc);
  await findNewCarsOnElite(mercedesModels.gle);

  // await findNewCarsOnPlusAuto(mercedesModels.glcCoupe);
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
