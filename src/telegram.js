import axios from 'axios'
import { BOT_TOKEN } from '../private.js'

export const sendMessage = async (text, chat_id) => {
  try {
    await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      chat_id,
      text,
      parse_mode: 'HTML',
    })
  } catch (error) {
    console.warn('Falha ao enviar mensagem. chat_id =', chat_id)
  }
}
