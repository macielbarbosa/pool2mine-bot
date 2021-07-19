import { TELEGRAM_BOT_TOKEN } from '../private.js'

const URL_TELEGRAM_BASE = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`
export const URL_TELEGRAM_SEND_MESSAGE = URL_TELEGRAM_BASE + '/sendMessage'
export const URL_TELEGRAM_GET_UPDATES = URL_TELEGRAM_BASE + '/getUpdates'

const URL_POOL2MINE_BASE = `https://api.pool2mine.net:4000/api/pools/eth`
export const URL_POOL2MINE_MINER = URL_POOL2MINE_BASE + '/miners/'
