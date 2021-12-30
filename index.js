import moment from 'moment'
import _ from 'lodash'

import MongoConnector from './src/mongo.js'
import { sleep } from './src/utils.js'
import { minerApp } from './src/minerApp.js'
import { poolUpdate } from './src/pool.js'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const POOL_UPDATE_MINUTES = 2

var DB
var lastMinutePoolUpdate

const initConfiguration = async () => {
  try {
    console.log('[LOG] Setting initial configuration')
    DB = new MongoConnector()
    await DB.connect()
    await poolUpdate(DB)
  } catch (error) {
    console.error('[WARN] Error getting initial configuration')
    throw error
  }
}

const shouldPoolUpdate = () => {
  const minute = moment().minute()
  return minute !== lastMinutePoolUpdate && minute % POOL_UPDATE_MINUTES === 0
}

export const service = async () => {
  try {
    console.log('[LOG] Starting service')
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
    console.log('[WARN] Service error. Restarting...')
    service()
  }
}

service()
