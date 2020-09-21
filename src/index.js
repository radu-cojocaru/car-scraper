const path = require("path");
const { JsonDB } = require("node-json-db");
const { Config } = require("node-json-db/dist/lib/JsonDBConfig");
const config = require("./config");
const { sleep } = require("./lib/utils");

const autoklass = require("./scrappers/autoklass.js");
const eliteCarsLeasing = require("./scrappers/eliteCarsLeasing");
const plusAuto = require("./scrappers/plusAuto");
const autovit = require("./scrappers/autovit");
const autoSchunn = require("./scrappers/autoSchunn.js");

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

const scrap = async ({ website, scrapper }, model) => {
  console.log(`Search on ${website} for ${model}`);
  await scrapper({ ...config.car, model })
    .scrapCarUrls()
    .then((urls) => {
      // console.log(urls);
      processUrls(urls);
    });
  return sleep();
};

const visitNewCars = () => {
  const urlsData = db.getData("|urls");
  const urls = Object.keys(urlsData).filter((url) => !urlsData[url].visited);
  console.log(urls);
};

const countCars = () => {
  const urlsData = db.getData("|urls");
  console.log("Total urls: ", Object.keys(urlsData).length);
};

const findNewCars = async () => {
  // const scrappers = {
  //   autoklass,
  //   autoSchunn,
  //   autovit,
  //   eliteCarsLeasing,
  //   plusAuto,
  // };
  // const models = Object.keys(config.mercedesModels);
  // for (let scrapperKey of Object.keys(scrappers)) {
  //   for (let model of models) {
  //     await scrap(scrappers[scrapperKey], model);
  //   }
  // }

  const { mercedesModels } = config;

  await scrap(autoklass, mercedesModels.glb);
  await scrap(autoklass, mercedesModels.glc);
  await scrap(autoklass, mercedesModels.glcCoupe);
  await scrap(autoklass, mercedesModels.gle);
  await scrap(autoklass, mercedesModels.gleCoupe);

  await scrap(autoSchunn, mercedesModels.glb);
  await scrap(autoSchunn, mercedesModels.glc);
  await scrap(autoSchunn, mercedesModels.gle);

  await scrap(autovit, mercedesModels.glb);
  await scrap(autovit, mercedesModels.glc);
  await scrap(autovit, mercedesModels.glcCoupe);
  // await scrap(autovit, mercedesModels.gle);
  // await scrap(autovit, mercedesModels.gleCoupe);

  await scrap(eliteCarsLeasing, mercedesModels.glc);
  await scrap(eliteCarsLeasing, mercedesModels.gle);

  await scrap(plusAuto, mercedesModels.glb);
  await scrap(plusAuto, mercedesModels.glc);
  await scrap(plusAuto, mercedesModels.glcCoupe);
  await scrap(plusAuto, mercedesModels.gle);
  await scrap(plusAuto, mercedesModels.gleCoupe);
};

countCars();
findNewCars().then(countCars);
