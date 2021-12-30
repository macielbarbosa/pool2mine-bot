import axios from 'axios'
import _ from 'lodash'
import { defaultRequestTimeout, URL_POOL2MINE_MINER, URL_POOL2MINE_POOL } from './constants.js'
import { sendMessage } from './telegram.js'

const getPoolStats = async () => {
  const {
    data: {
      pools: [
        {
          sharesCount,
          poolStats: { poolHashrate, connectedMiners },
        },
      ],
    },
  } = await axios.get(URL_POOL2MINE_POOL, { timeout: defaultRequestTimeout })
  return {
    shares: sharesCount,
    hashrate: (poolHashrate / Math.pow(10, 9)).toFixed(3) + ' GH/s',
    miners: connectedMiners,
  }
}

const notifyUsersWorkersDown = async (users, workers) => {
  for (const { _id: chatId } of users) {
    try {
      for (const worker of workers) {
        await sendMessage(`⚠️ <b>${worker}</b> worker is down!\n\n/notify - Disable notifications`, chatId)
      }
    } catch (_) {
      console.warn('[LOG] Error notifying worker down to user', chatId)
    }
  }
}

export const poolUpdate = async (DB) => {
  try {
    const wallets = await DB.collection('wallet').find({}).toArray()
    const poolStats = await getPoolStats()
    await DB.setData(poolStats)
    for (const wallet of wallets) {
      const {
        data: { pendingShares, pendingBalance, todayPaid, performance },
      } = await axios.get(URL_POOL2MINE_MINER + wallet._id, { timeout: defaultRequestTimeout })
      const workers = !performance ? [] : Object.keys(performance.workers)
      const workersDown = _.difference(wallet.workers, workers)
      if (workersDown.length > 0) {
        const users = await DB.collection('user').find({ wallets: wallet._id, notify: true }).toArray()
        await notifyUsersWorkersDown(users, workersDown)
      }
      const hashrate = !performance
        ? 0
        : Object.values(performance.workers).reduce((total, { hashrate }) => total + hashrate, 0)
      await DB.collection('wallet').updateOne(
        { _id: wallet._id },
        {
          $set: {
            shares: (pendingShares / Math.pow(10, 12)).toFixed(3) + ' T',
            balance: pendingBalance === 0 ? 0 : pendingBalance.toFixed(5),
            paid: todayPaid === 0 ? 0 : todayPaid.toFixed(5),
            workers,
            hashrate:
              hashrate > Math.pow(10, 9)
                ? (hashrate / Math.pow(10, 9)).toFixed(3) + ' GH/s'
                : (hashrate / Math.pow(10, 6)).toFixed(1) + ' MH/s',
          },
        },
      )
    }
  } catch (_) {
    console.warn('[WARN] Error update pool data')
  }
}
