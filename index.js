const puppeteer = require('puppeteer');
const TelegramApi = require('node-telegram-bot-api')
const { MongoClient } = require("mongodb")
const { demon } = require("./bots/demons/demon")
const { deleterCard } = require("./bots/demons/deleterCard")
const { singleSorare } = require("./bots/singleSorare")
const {CLIENT, TOKEN} = require("./config")

const token = TOKEN
const client = new MongoClient(CLIENT)

const bot = new TelegramApi(token, { polling: true })

const start = async () => {

  try {

    await client.connect()
      .then(() => console.log("success connect"))
      .catch((e) => console.log(`error ${e}`))

    //initial data
    const browser = await puppeteer.launch({
      headless: true,
      // executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      userDataDir: "./UserData",
      defaultViewport: null,
      args: [
        '--window-size=500,800',
        "--no-sandbox",
        "--disabled-setupid-sandbox"
      ]
      // max size
      // args: ['--start-maximized']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 500, height: 800 })
    const job = demon(page, client, bot)
    const updateCards = deleterCard(client, job)
    let url = ""
    let priceDesired = ""


    // telegram
    bot.setMyCommands([
      { command: "/start", description: "Начальное приветствие" },
      { command: "/go", description: "Настроить и запустить бота" },
      { command: "/startbot", description: "Продолжить работу бота (в разработке)" },
      { command: "/stopbot", description: "Приостановить работу бота (в разработке)" },
    ])

    bot.onText(/\/start/, async msg => {

      const text = msg.text;
      const chatId = msg.chat.id

      const users = client.db().collection("users")
      const allUsers = await users.find({}).toArray();

      if (!allUsers.find(user => user.id === msg.from.id)) {
        await users.insertOne(msg.from)
      }

      console.log(`${msg.chat.first_name} ${msg.chat.last_name ? msg.chat.last_name : ""}`)
      return await bot.sendMessage(chatId,
        `Привет, ${msg.chat.first_name} ${msg.chat.last_name ? msg.chat.last_name : ""}! Добро пожаловать в телеграм бот Sorare.`)
    })

    bot.onText(/\/stopbot/, async msg => {
      await job.stop()
    })

    bot.onText(/\/go/, async msg => {
      let rxUrl = /https:(.+)/
      let rxNumber = /^[0-9]*[.,]?[0-9]+$/

      const users = client.db().collection("users")
      const allUsers = await users.find({}).toArray();

      if (allUsers.find(user => user.id === msg.from.id)) {
        bot.sendMessage(msg.from.id, 'Кинь мне ссылку с настроенными фильтрами.')
          .then(() => {
            bot.removeTextListener(rxUrl)
            bot.onText(rxUrl, msg => {
              console.log("msg1", msg);
              url = msg.text
              bot.sendMessage(msg.from.id, "Укажи минимальную стоимость в ETH.")
                .then(() => {
                  bot.removeTextListener(rxNumber)
                  bot.onText(rxNumber, async (msg) => {
                    bot.sendMessage(msg.from.id, "Бот запущен!")
                    priceDesired = +msg.text

                    const checkedCard = client.db().collection("checkedCard")
                    checkedCard.insertOne({
                      url,
                      priceDesired
                    })

                    console.log("test1")

                    await singleSorare(page, url, job, updateCards)

                    allUsers.forEach(async (el) => {
                      await bot.sendMessage(el.id, `Пользователь ${msg.chat.first_name} запустил поиск карты:`)
                      await bot.sendMessage(el.id, url)
                      await bot.sendMessage(el.id, `C ценой ниже ${priceDesired} ETH`)
                    })
                  });
                })
            })
          })
      } else {
        bot.sendMessage(msg.from.id, 'Для работы введи команду /start')
      }

    });

  } catch (e) {
    console.log("ERROR", e)
  }

}

start()