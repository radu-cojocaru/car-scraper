// use as `await sleep(2000);`
module.exports.sleep = (ms = 1000) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
