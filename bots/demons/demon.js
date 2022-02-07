const CronJob = require('cron').CronJob;

// демон, выполняет задачу раз в 50 секунд
const demon = (page, clientDB, bot) => {

  return new CronJob('*/50 * * * * *', async function () {

    try {
      // достаем url и цену
      const checkedCard = clientDB.db().collection("checkedCard")
      const checkedCardData = await checkedCard.find({}).toArray();

      const { url, priceDesired } = checkedCardData[checkedCardData.length - 1]

      // // проверяем курс валют
      await page.goto(url)

      await page.waitForSelector("div[class=\"MuiGrid-root MuiGrid-item MuiGrid-grid-xs-12 MuiGrid-grid-sm-3\"]")

      await scrollToFixed(page)
      const data = await page.evaluate(async () => {

        let res = []
        let container = await document.querySelectorAll("div[class=\"MuiGrid-root MuiGrid-item MuiGrid-grid-xs-12 MuiGrid-grid-sm-3\"]")

        container.forEach(item => {
          let href = item.querySelector("div[class=\"MuiGrid-root MuiGrid-item MuiGrid-grid-xs-12 MuiGrid-grid-sm-3\"] > div > div > a")?.href
          let name = item.querySelector("div[class=\"MuiGrid-root MuiGrid-item MuiGrid-grid-xs-12 MuiGrid-grid-sm-3\"] > div > div:last-of-type > div:last-of-type > div :nth-child(1)")?.innerText
          let type = item.querySelector("div[class=\"MuiGrid-root MuiGrid-item MuiGrid-grid-xs-12 MuiGrid-grid-sm-3\"] > div > div:last-of-type > div:last-of-type > div :nth-child(2)")?.innerText
          let price = item.querySelector("div[class=\"MuiGrid-root MuiGrid-item MuiGrid-grid-xs-12 MuiGrid-grid-sm-3\"] > div > div:last-of-type > div:last-of-type  >  div:last-of-type > div > div > span")?.innerText

          res.push({
            href,
            name,
            type,
            price: +price?.replace(',', '.').replace(/[^0-9\.]/g, "")
          })
        })
        return res
      })

      // получаем все карточки из базы
      const cards = clientDB.db().collection("cards")
      const allСards = await cards.find({}).toArray();

      data
        .filter(item => item.price)
        .map(item => ({
          ...item,
          price: item.price || null,
          priceTitle: item.price ? `${item.price} ETH` : null
        }))
        .forEach(async item => {
          if (!allСards.find(card => card.type === item.type)) {
            await cards.insertOne({ ...item, status: "NEW" })
          }
        })

      const newCards = await cards.find({ status: "NEW" }).toArray()
      const cardDesired = newCards
        .filter(card => card.price <= priceDesired)
        .map(card => [card.href, card.name, card.type, card.priceTitle])

      const users = clientDB.db().collection("users")
      const allUsers = await users.find({}).toArray();

      cardDesired[0] && allUsers.forEach(async (el) => {

        await bot.sendMessage(el.id, cardDesired.map(card => card.join('\n')).join('\n\n'))

      })

      await cards.updateMany({ status: "NEW" }, { $set: { status: "CHECKED" } })
  
    } catch (e) {
      console.log("Ошибка в парсинге карточек", e)
    }



  }, null, false, 'Europe/Moscow')

}


module.exports = {
  demon
}