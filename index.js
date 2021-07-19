import moment from 'moment'
import _ from 'lodash'

import { checkBlock, getBlockNumber } from './src/etherscan.js'
import { DiscordBot } from './src/discord.js'
import * as Telegram from './src/telegram.js'
import MongoConnector from './src/mongo.js'
import { sleep } from './src/utils.js'
import { minerApp } from './src/minerApp.js'
import { poolUpdate } from './src/pool.js'

var Pool2mineBot
var DB
var blockNumber
var lastMinutePoolUpdate

const initConfiguration = async () => {
  try {
    console.log('Setando a configuração inicial')
    await DiscordBot.login()
    //blockNumber = await getBlockNumber()
    DB = new MongoConnector()
    await DB.connect()
    await poolUpdate(DB)
  } catch (error) {
    console.error('Erro ao obter a configuração inicial')
    throw error
  }
}

const blockListener = async () => {
  let mined
  try {
    mined = await checkBlock(blockNumber)
  } catch (_) {
  } finally {
    if (mined) {
      await Telegram.alertBlock(mined)
      await Pool2mineBot.alertBlock(mined)
    }
    blockNumber++
  }
}

const shouldPoolUpdate = () => {
  const minute = moment().minute()
  return minute !== lastMinutePoolUpdate && minute % 2 === 0
}

export const service = async () => {
  console.log('Iniciando serviço')
  await initConfiguration()
  //setInterval(blockListener, 1000)
  while (true) {
    if (shouldPoolUpdate()) {
      await poolUpdate(DB)
      lastMinutePoolUpdate = moment().minute()
    }
    await minerApp(DB)
    await sleep(1000)
  }
}

service()
