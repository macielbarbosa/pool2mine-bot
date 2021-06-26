import { DISCORD_BOT_TOKEN } from './private.js'
import { app } from './src/app.js'
import { Bot } from './src/discord.js'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const start = async () => {
  console.log('Iniciando servidor')
  const DiscordBot = new Bot(DISCORD_BOT_TOKEN)
  await DiscordBot.login()
  try {
    while (true) {
      await app(DiscordBot)
      await sleep(2000)
    }
  } catch (error) {
    console.error('Houve um erro na aplicação.', error)
  }
}

start()
