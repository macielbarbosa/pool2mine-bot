import { DISCORD_BOT_TOKEN } from '../private.js'
import { getBlock, getBlockNumber } from './block.js'
import { Bot } from './discord.js'
import Telegram from './telegram.js'
import { formatReward, sleep } from './utils.js'

const WALLET = '0xcd7b9e2b957c819000b1a8107130f786636c5ccc'

var blockNumber = 0

const checkNewBlock = async () => {
  try {
    const block = await getBlock(blockNumber)
    if (!block.blockNumber) return null
    blockNumber++
    if (block.blockMiner === WALLET) {
      console.log('Novo bloco:', block)
      return { number: block.blockNumber, reward: formatReward(block.blockReward) }
    }
    const uncle = block.uncles.find(({ miner }) => miner === WALLET)
    if (uncle) {
      console.log('Novo uncle:', block)
      return { number: block.blockNumber, reward: formatReward(uncle.blockreward), isUncle: true }
    }
  } catch (error) {
    console.warn('Erro ao verificar o último bloco.', error)
    return null
  }
}

export const app = async () => {
  try {
    const DiscordBot = new Bot(DISCORD_BOT_TOKEN)
    await DiscordBot.login()
    blockNumber = await getBlockNumber()
    console.log('Bloco inicial', blockNumber)
    if (!blockNumber) throw new Error('Erro ao obter o blockNumber.')
    while (true) {
      const block = await checkNewBlock()
      if (block) {
        await Telegram.alertBlock(block)
        await DiscordBot.alertBlock(block)
      }
      await sleep(3000)
    }
  } catch (error) {
    console.warn('Erro ao executar o app.', error)
  }
}
