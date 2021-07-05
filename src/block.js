import axios from 'axios'
import { ETHERSCAN_TOKEN } from '../private.js'

const ETHERSCAN_API = 'https://api.etherscan.io/api'

export const getBlockNumber = async () => {
  const timestamp = String(Date.now()).substring(0, 10)
  const {
    data: { result: number },
  } = await axios.get(
    `${ETHERSCAN_API}?module=block&action=getblocknobytime&timestamp=${timestamp}&closest=before&apikey=${ETHERSCAN_TOKEN}`,
  )
  return number
}

export const getBlock = async (number) => {
  const {
    data: { result: block },
  } = await axios.get(`${ETHERSCAN_API}?module=block&action=getblockreward&blockno=${number}&apikey=${ETHERSCAN_TOKEN}`)
  return block
}
