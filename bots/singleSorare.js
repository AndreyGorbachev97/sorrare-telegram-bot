const { login } = require("./utils/login")


const singleSorare = async (page, url, job, updateCards) => {

  await page.goto(url)
  await login(page)
  await page.goto(url)

  await job.stop()
  await job.start()
  await updateCards.stop()
  await updateCards.start()

}

module.exports = {
  singleSorare
}