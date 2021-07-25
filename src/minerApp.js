import { getPrivateUpdates, sendMessage } from './telegram.js'

const isWallet = (text) => text.substr(0, 2) === '0x' && text.length === 42

export const minerApp = async (DB) => {
  let lastHandledUpdateId = null
  try {
    const { telegramOffset, hashrate, miners } = await DB.getData()
    const updates = await getPrivateUpdates(telegramOffset)
    for (const update of updates) {
      const {
        message: { chat, text },
      } = update
      if (isWallet(text)) {
        const user = await DB.getUser(chat.id)
        if (user.wallets.includes(text)) {
          await DB.collection('user').updateOne(
            { _id: user._id },
            { $set: { wallets: user.wallets.filter((w) => w !== text) } },
          )
          await sendMessage('🗑️ The wallet has been <b>removed</b>', chat.id)
        } else {
          const countWallet = await DB.collection('wallet').countDocuments({ _id: text })
          if (!countWallet) {
            await DB.collection('wallet').insertOne({ _id: text, shares: 0, balance: 0, workers: [], hashrate: 0 })
          }
          await DB.collection('user').updateOne({ _id: user._id }, { $set: { wallets: [text, ...user.wallets] } })
          await sendMessage('✅ The wallet has been <b>added</b>', chat.id)
        }
      } else if (text === '/pool') {
        await sendMessage(
          `📉 Hashrate: <b>${hashrate}</b>
          
⛏️ Miners: <b>${miners}</b>`,
          chat.id,
        )
      } else if (text === '/miner') {
        const user = await DB.getUser(chat.id)
        const wallets = await DB.collection('wallet')
          .find({ _id: { $in: user.wallets } })
          .toArray()
        if (wallets.length === 0) {
          await sendMessage('No wallet. Send me one.\n\n/help', chat.id)
        } else {
          for (const { _id: wallet, workers, hashrate, shares, balance, paid } of wallets) {
            await sendMessage(
              `<b>${wallet.replace(wallet.substr(9, 24), '...')}</b>
            
⛏️ Workers online: <b>${workers.length}</b>
📉 Effective hashrate: <b>${hashrate}</b>

📄 Shares: <b>${shares}</b>
💸 Balance: <b>${balance}</b>
💵 Today paid: <b>${paid}</b>`,
              chat.id,
            )
          }
        }
      } else if (text === '/clear') {
        const user = await DB.getUser(chat.id)
        await DB.collection('user').updateOne({ _id: user._id }, { $set: { wallets: [] } })
        await sendMessage('🗑️ All wallets has been <b>removed</b>', chat.id)
      } else if (text === '/notify') {
        const { _id, notify } = await DB.getUser(chat.id)
        await DB.collection('user').updateOne({ _id }, { $set: { notify: !notify } })
        await sendMessage(
          `${!notify ? '🔔' : '🔕'} Notifications have been <b>${!notify ? 'activated' : 'disabled'}</b>`,
          chat.id,
        )
      } else if (text === '/help') {
        await sendMessage(
          `0x00...00 - <i>Add or remove a wallet</i>
/miner - <i>Miner info</i>
/pool - <i>Pool stats</i>
/notify - <i>Enable or disable notifications</i>
/clear - <i>Remove all wallets</i>`,
          chat.id,
        )
      } else {
        await sendMessage('⛔️ Invalid command.\n\n/help', chat.id)
      }
      lastHandledUpdateId = update.update_id
    }
  } catch (error) {
    console.error('Erro ao executar o telegramBot', error)
  } finally {
    if (lastHandledUpdateId) await DB.setData({ telegramOffset: lastHandledUpdateId + 1 })
  }
}
