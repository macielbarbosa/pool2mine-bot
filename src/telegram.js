import axios from 'axios'
import nested from 'nested-property'
import { TELEGRAM_PT_CHAT_ID, TELEGRAM_INFO_CHAT_ID, TELEGRAM_EN_CHAT_ID } from '../private.js'
import { URL_TELEGRAM_GET_UPDATES, URL_TELEGRAM_SEND_MESSAGE } from './constants.js'
import { enumLanguage, strings } from './strings.js'

export const sendMessage = async (text, chat_id) => {
  try {
    await axios.post(URL_TELEGRAM_SEND_MESSAGE, {
      chat_id,
      text,
      parse_mode: 'HTML',
    })
  } catch (error) {
    console.warn('Telegram - Falha ao enviar mensagem. chat_id =', chat_id)
  }
}

const messageBlock = ({ number, reward, isUncle }, language) =>
  `🎉 <b>${strings[isUncle ? 'newUncle' : 'newBlock'][language]} 🎉</b>

🔷 ${strings.block[language]}: <a href='https://etherscan.io/block/${number}'>${number}</a>
💰 ${strings.reward[language]}: <b>${reward}</b> ETH`

export const alertBlock = async (block) => {
  const englishNewBlockMessage = messageBlock(block, enumLanguage.en)
  const portugueseNewBlockMessage = messageBlock(block, enumLanguage.pt)
  await sendMessage(englishNewBlockMessage, TELEGRAM_EN_CHAT_ID)
  await sendMessage(portugueseNewBlockMessage, TELEGRAM_PT_CHAT_ID)
  await sendMessage(portugueseNewBlockMessage, TELEGRAM_INFO_CHAT_ID)
}

export const getPrivateUpdates = async (offset) => {
  try {
    const {
      data: { result: updates },
    } = await axios.get(URL_TELEGRAM_GET_UPDATES, {
      params: { offset, allowed_updates: ['message'] },
    })
    return updates.filter((update) => nested.get(update, 'message.chat.type') === 'private')
  } catch (_) {
    console.error('Erro ao obter os updates do Telegram')
    return []
  }
}
