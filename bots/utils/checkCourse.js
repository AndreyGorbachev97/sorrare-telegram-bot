const delay = (time) => {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  })
}

const checkCourse = async (page) => {

  try {
    await page.goto("https://pokur.su/eth/eur/1/")

    await page.waitForSelector("button[class=\"btn btn-link btn-img-behavior btn-xlg-specific\"]")
    const button = await page.$("button[class=\"btn btn-link btn-img-behavior btn-xlg-specific\"]");
    button.click();

    await delay(500)

    await page.waitForSelector("div[class=\"form-group_converter-row\"] div[data-form-group=\"secondary\"] input")
    const eth = await page.evaluate(async () => {
      return document.querySelector("div[class=\"form-group_converter-row\"] div[data-form-group=\"secondary\"] input").value
    })

    return +eth.replace(',', '.').replace(/[^0-9\.]/g, "")
    
  } catch (e) {
    return null
  }
}

module.exports = {
  checkCourse
}