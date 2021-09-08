import moment from 'moment'
import _ from 'lodash'

import MongoConnector from './src/mongo.js'
import { sleep } from './src/utils.js'
import { minerApp } from './src/minerApp.js'
import { poolUpdate } from './src/pool.js'

const POOL_UPDATE_MINUTES = 2

var DB
var lastMinutePoolUpdate

const initConfiguration = async () => {
  try {
    console.log('Setando a configuração inicial')
    DB = new MongoConnector()
    await DB.connect()
    await poolUpdate(DB)
  } catch (error) {
    console.error('Erro ao obter a configuração inicial')
    throw error
  }
}

const shouldPoolUpdate = () => {
  const minute = moment().minute()
  return minute !== lastMinutePoolUpdate && minute % POOL_UPDATE_MINUTES === 0
}

export const service = async () => {
  try {
    console.log('Iniciando serviço')
    await initConfiguration()
    while (true) {
      if (shouldPoolUpdate()) {
        await poolUpdate(DB)
        lastMinutePoolUpdate = moment().minute()
      }
      await minerApp(DB)
      await sleep(1000)
    }
  } catch (error) {
    console.log('Erro no serviço', error)
    service()
  }
}

service()
