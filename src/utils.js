export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const formatReward = (number) => (number / Math.pow(10, 18)).toFixed(3)
