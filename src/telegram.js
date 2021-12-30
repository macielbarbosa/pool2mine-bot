import axios from 'axios'
import nested from 'nested-property'
import { defaultRequestTimeout, URL_TELEGRAM_GET_UPDATES, URL_TELEGRAM_SEND_MESSAGE } from './constants.js'

export const sendMessage = async (text, chat_id) => {
  try {
    await axios.post(URL_TELEGRAM_SEND_MESSAGE, {
      chat_id,
      text,
      parse_mode: 'HTML',
    })
  } catch (error) {
    console.warn('[WARN] Fail on send message to user', chat_id)
    throw error
  }
}

export const getPrivateUpdates = async (offset) => {
  try {
    const {
      data: { result: updates },
    } = await axios.get(URL_TELEGRAM_GET_UPDATES, {
      params: { offset, allowed_updates: ['message'] },
      timeout: defaultRequestTimeout,
    })
    console.log('[INFO] Number of messages:', updates.length)
    return [
      updates.filter((update) => nested.get(update, 'message.chat.type') === 'private'),
      updates && updates.length > 0 && updates[updates.length - 1],
    ]
  } catch (_) {
    console.error('[LOG] Error getting Telegram updates. Retrying... ')
    return [[], false]
  }
}
