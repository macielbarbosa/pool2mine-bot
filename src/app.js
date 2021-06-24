import { PT_CHAT_ID, INFO_CHAT_ID, EN_CHAT_ID } from '../private.js'
import { getBlock, getCurrentBlockNumber } from './block.js'
import { enumLanguage, strings } from './strings.js'
import { sendMessage } from './telegram.js'

const WALLET = '0xcd7b9e2b957c819000b1a8107130f786636c5ccc'

var lastBlockNumber = 0

const getNewBlockMessage = (number, reward, language) =>
  `🎉 <b>${strings.newBlock[language]} 🎉</b>

🔷 ${strings.block[language]}: <a href='https://etherscan.io/block/${number}'>${number}</a>
💰 ${strings.reward[language]}: <b>${(reward / Math.pow(10, 18)).toFixed(3)} ETH</b>`

const announceNewBlock = async (block) => {
  console.log('New block:', block)
  const { blockNumber, blockReward } = block
  const englishNewBlockMessage = getNewBlockMessage(blockNumber, blockReward, enumLanguage.en)
  const portugueseNewBlockMessage = getNewBlockMessage(blockNumber, blockReward, enumLanguage.pt)
  await sendMessage(englishNewBlockMessage, EN_CHAT_ID)
  await sendMessage(portugueseNewBlockMessage, PT_CHAT_ID)
  await sendMessage(portugueseNewBlockMessage, INFO_CHAT_ID)
}

const checkNewBlock = async (wallet) => {
  try {
    const currentBlockNumber = await getCurrentBlockNumber()
    if (currentBlockNumber === lastBlockNumber) return
    lastBlockNumber = currentBlockNumber
    const block = await getBlock(lastBlockNumber)
    if (block.blockMiner === wallet) {
      announceNewBlock(block)
    }
  } catch (error) {
    console.warn('Erro ao verificar o último bloco.', error)
  }
}

export const app = async () => {
  await checkNewBlock(WALLET)
}
