import axios from 'axios'
import { ETHERSCAN_TOKEN } from '../private.js'

const ETHERSCAN_API = 'https://api.etherscan.io/api'

import { formatReward } from './utils.js'

const WALLET = '0xcd7b9e2b957c819000b1a8107130f786636c5ccc'

export const checkBlock = async (number) => {
  const block = await getBlock(number)
  if (!block.blockNumber) return false
  if (block.blockMiner === WALLET) {
    console.log('Novo bloco:', block)
    return { number, reward: formatReward(block.blockReward) }
  }
  const uncle = block.uncles.find(({ miner }) => miner === WALLET)
  if (uncle) {
    console.log('Novo uncle:', block)
    return { number, reward: formatReward(uncle.blockreward), isUncle: true }
  }
}

export const getBlockNumber = async () => {
  const timestamp = String(Date.now()).substring(0, 10)
  const {
    data: { result: number },
  } = await axios.get(
    `${ETHERSCAN_API}?module=block&action=getblocknobytime&timestamp=${timestamp}&closest=before&apikey=${ETHERSCAN_TOKEN}`,
  )
  console.log('Bloco inicial', number)
  if (!number) {
    throw new Error('Erro ao obter o blockNumber atual.')
  }
  return number
}

const getBlock = async (number) => {
  const {
    data: { result: block },
  } = await axios.get(`${ETHERSCAN_API}?module=block&action=getblockreward&blockno=${number}&apikey=${ETHERSCAN_TOKEN}`)
  return block
}
