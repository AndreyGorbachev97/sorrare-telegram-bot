
const delay = (time) => {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  })
}

const login = async (page) => {
  try {
    await page.waitForXPath(`/html[1]/body[1]/div[1]/div[1]/header[1]/div[1]/div[1]/div[1]/div[2]/button[2]/span[1]`, {
      timeout: 6000
    })
    const elements = await page.$x('/html[1]/body[1]/div[1]/div[1]/header[1]/div[1]/div[1]/div[1]/div[2]/button[2]/span[1]')
    await elements[0].click()

    await delay(1500)
    const frame = await page.frames().find(f => f.name() === 'wallet');
    const frames = await page.frames().map(f => f.name());
    console.log("frames", frames)
    await frame.waitForSelector("div[class=\"input-group\"] > input[type=\"text\"]")
    await frame.type("div[class=\"input-group\"] > input[type=\"text\"]", "andrew.react161@rambler.ru")
    await delay(1500)
    await frame.type("div[class=\"input-group\"] > input[type=\"password\"]", "20071997!gA")
    await delay(500)
    const button = await frame.$('div[class=\"dialog \"] button[type=\"submit\"]');
    button.click();
    await delay(5000)
    console.log("succsess login")
  } catch (e) {
    console.log("ERROR:", e)
  }
}

module.exports = {
  login
}