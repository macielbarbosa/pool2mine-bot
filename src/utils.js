import { v4 as uuid } from 'uuid'

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const formatReward = (number) => (number / Math.pow(10, 18)).toFixed(3)

export const newId = () => uuid()

export const lastItemArray = (array) => array.length && array[array.length - 1]

export const currentTime = () => {
  const date = new Date()
  return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
}
