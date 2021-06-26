import { PT_CHAT_ID, INFO_CHAT_ID, EN_CHAT_ID } from '../private.js'
import { getBlock, getCurrentBlockNumber } from './block.js'
import { enumLanguage, strings } from './strings.js'
import { sendMessage } from './telegram.js'

const WALLET = '0xcd7b9e2b957c819000b1a8107130f786636c5ccc'

var lastBlockNumber = 0

const getNewBlockMessage = ({ number, reward }, language) =>
  `🎉 <b>${strings.newBlock[language]} 🎉</b>

🔷 ${strings.block[language]}: <a href='https://etherscan.io/block/${number}'>${number}</a>
💰 ${strings.reward[language]}: <b>${reward}</b> ETH`

const announceNewBlock = async (block) => {
  const englishNewBlockMessage = getNewBlockMessage(block, enumLanguage.en)
  const portugueseNewBlockMessage = getNewBlockMessage(block, enumLanguage.pt)
  await sendMessage(englishNewBlockMessage, EN_CHAT_ID)
  await sendMessage(portugueseNewBlockMessage, PT_CHAT_ID)
  await sendMessage(portugueseNewBlockMessage, INFO_CHAT_ID)
}

const checkNewBlock = async (wallet) => {
  try {
    const currentBlockNumber = await getCurrentBlockNumber()
    if (currentBlockNumber === lastBlockNumber) return null
    lastBlockNumber = currentBlockNumber
    const block = await getBlock(lastBlockNumber)
    if (block.blockMiner === wallet) {
      console.log('New block:', block)
      return { number: block.blockNumber, reward: (block.blockReward / Math.pow(10, 18)).toFixed(3) }
    }
  } catch (error) {
    console.warn('Erro ao verificar o último bloco.')
    return null
  }
}

export const app = async (DiscordBot) => {
  try {
    const block = await checkNewBlock(WALLET)
    if (block) {
      await announceNewBlock(block)
      await DiscordBot.alertBlock(block)
    }
  } catch (error) {
    console.warn('Erro ao executar o app.')
  }
}
