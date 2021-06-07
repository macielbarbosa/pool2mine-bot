const { default: axios } = require("axios");
const { BOT_TOKEN, ETHERSCAN_TOKEN, PT_CHAT_ID, INFO_CHAT_ID, EN_CHAT_ID } = require("./private");

const WALLET = '0xcd7b9e2b957c819000b1a8107130f786636c5ccc'
const ETHERSCAN_API = 'https://api.etherscan.io/api'

var lastBlockNumber = 0

const getCurrentBlockNumber = async () => {
    const timestamp = String(Date.now()).substring(0,10)
    const {data: {result: number}} = await axios.get(`${ETHERSCAN_API}?module=block&action=getblocknobytime&timestamp=${timestamp}&closest=before&apikey=${ETHERSCAN_TOKEN}`)
    return number
}

const getBlock = async (number) => {
    const {data: {result: block}} = await axios.get(`${ETHERSCAN_API}?module=block&action=getblockreward&blockno=${number}&apikey=${ETHERSCAN_TOKEN}`)
    return block
}

const sendMessage = async (text, chat_id) => {
    try {
        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            chat_id, text, parse_mode: 'HTML'
        })
    } catch (error) {
        console.warn('Erro ao enviar mensagem.')
    }
}

const getNewBlockMessage = (number, reward, language) =>  `🎉 <b>${language === 'en' ? 'NEW BLOCK MINED' : 'NOVO BLOCO MINERADO'}</b> <a href='https://etherscan.io/block/${number}'>#${number}</a>\n\n🤑 ${language === 'en' ? 'Reward' : 'Recompensa'}: <b>${(reward/Math.pow(10,18)).toFixed(3)} ETH</b>`

const verifyFindedBlock = async (wallet) => {
    try {
        const currentBlockNumber = await getCurrentBlockNumber()
        if (currentBlockNumber === lastBlockNumber) return
        lastBlockNumber = currentBlockNumber
        const block = await getBlock(lastBlockNumber)
        if (block.blockMiner === wallet) {
            console.log('New block:', block)
            const {blockNumber, blockReward} = block
            await sendMessage(getNewBlockMessage(blockNumber, blockReward, 'en'), EN_CHAT_ID)
            await sendMessage(getNewBlockMessage(blockNumber, blockReward, 'pt'), PT_CHAT_ID)
            await sendMessage(getNewBlockMessage(blockNumber, blockReward, 'pt'), INFO_CHAT_ID)
        }
    } catch (error) {
        console.warn('Erro ao verificar o último bloco.')
    }
}

const app = async () => {
    await verifyFindedBlock(WALLET)
}

module.exports = app