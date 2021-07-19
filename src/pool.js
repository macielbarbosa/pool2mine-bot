import axios from 'axios'
import _ from 'lodash'
import { URL_POOL2MINE_MINER } from './constants.js'
import { sendMessage } from './telegram.js'

const notifyUsersWorkersDown = async (users, workers) => {
  for (const { _id: chatId } of users)
    for (const worker of workers) {
      await sendMessage(`⚠️ <b>${worker}</b> worker is down!`, chatId)
    }
}

export const poolUpdate = async (DB) => {
  const wallets = await DB.collection('wallet').find({}).toArray()
  for (const wallet of wallets) {
    const {
      data: { pendingShares, pendingBalance, todayPaid, performance },
    } = await axios.get(URL_POOL2MINE_MINER + wallet._id)
    const workers = !performance ? [] : Object.keys(performance.workers)
    const workersDown = _.difference(wallet.workers, workers)
    if (workersDown.length > 0) {
      const users = await DB.collection('user').find({ wallets: wallet._id }).toArray()
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
}
