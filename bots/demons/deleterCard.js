const CronJob = require('cron').CronJob;

const deleterCard = (clientDB, job) => {

  // удаляем записи из бд каждый час
  return new CronJob('1 */5 * * *', async function () {
    await job.stop()
    const cards = clientDB.db().collection("cards")
    await cards.deleteMany({ status: "CHECKED" })
    await job.start()
    console.log("success deleted")
  }, null, false, 'Europe/Moscow')

}

module.exports = {
  deleterCard
}