const scrollAuto = (page) => {
  page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      let totalHeight = 0;
      let distance = 100;
      let timer = setInterval(() => {
        let scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance)
        totalHeight += distance
        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    })
  })

}

async function scrollToFixed(page) {
  await page.evaluate((y) => { document.scrollingElement.scrollBy(0, 150); });
}

async function scrollToBottom(page) {
  const distance = 100; // should be less than or equal to window.innerHeight
  const delay = 100;
  while (await page.evaluate(() => document.scrollingElement.scrollTop + window.innerHeight < document.scrollingElement.scrollHeight)) {
    await page.evaluate((y) => { document.scrollingElement.scrollBy(0, y); }, distance);
    await page.waitForTimeout(delay);
  }
}

module.exports = {
  scrollAuto,
  scrollToBottom,
  scrollToFixed,
}