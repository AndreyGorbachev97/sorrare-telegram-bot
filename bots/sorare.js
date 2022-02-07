const puppeteer = require('puppeteer');

const delay = (time) => {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  })
}

const start = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    // executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    userDataDir: "./User",
    defaultViewport: null,
    args: ['--start-maximized']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 })
  await page.goto('https://sorare.com/market/transfers?sortBy=BlockchainCard_NewlyListed')


  await delay(1500)
  const frame = await page.frames().find(f => f.name() === 'wallet');

  await frame.waitForSelector("div[class*=dialog]>form :nth-child(1)")
  await frame.type("div[class*=dialog]>form :nth-child(1) input", "andrew.react161@rambler.ru")
  await delay(1500)
  await frame.type("div[class*=dialog]>form :nth-child(2) input", "20071997!gA")
  await delay(500)
  const button = await frame.$('div[class*=dialog]>form :nth-child(3)');
  button.click();
  await delay(5000)


  await page.waitForSelector("div[class=\"MuiGrid-root MuiGrid-item MuiGrid-grid-xs-12 MuiGrid-grid-sm-3\"]")

}

start()