import axios from 'axios'
import { TELEGRAM_PT_CHAT_ID, TELEGRAM_INFO_CHAT_ID, TELEGRAM_EN_CHAT_ID, TELEGRAM_BOT_TOKEN } from '../private.js'
import { enumLanguage, strings } from './strings.js'

const sendMessage = async (text, chat_id) => {
  try {
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id,
      text,
      parse_mode: 'HTML',
    })
  } catch (error) {
    console.warn('Falha ao enviar mensagem. chat_id =', chat_id)
  }
}

const message = ({ number, reward, isUncle }, language) =>
  `🎉 <b>${strings[isUncle ? 'newUncle' : 'newBlock'][language]} 🎉</b>

🔷 ${strings.block[language]}: <a href='https://etherscan.io/block/${number}'>${number}</a>
💰 ${strings.reward[language]}: <b>${reward}</b> ETH`

export const alertBlock = async (block) => {
  const englishNewBlockMessage = message(block, enumLanguage.en)
  const portugueseNewBlockMessage = message(block, enumLanguage.pt)
  await sendMessage(englishNewBlockMessage, TELEGRAM_EN_CHAT_ID)
  await sendMessage(portugueseNewBlockMessage, TELEGRAM_PT_CHAT_ID)
  await sendMessage(portugueseNewBlockMessage, TELEGRAM_INFO_CHAT_ID)
}

export default { alertBlock }
