export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const booleanToString = (value: boolean): string => {
  return value ? 'true' : 'false'
}

export const stringToBoolean = (value: string): boolean => {
  return value === 'true' ? true : false
}

export const objectToString = (value: object): string => {
  return JSON.stringify(value, undefined, 2)
}

export const containsSame = <T>(array1: T[], array2: T[]): boolean => {
  if (array1.length !== array2.length) return false
  return array1.every((v1) => array2.includes(v1))
}

export const tryFor = async <T>(maxSeconds: number, timeoutError: string, fn: () => Promise<T | null>): Promise<T> => {
  const startTime = Date.now()
  // eslint-disable-next-line no-constant-condition
  for (let i = 0; true; i++) {
    if (Date.now() > startTime + maxSeconds * 1000) {
      throw new Error(timeoutError)
    }
    const result = await fn()
    if (result !== null) {
      return result
    }
    const base = Math.pow(2, i)
    await sleep(Math.random() * base * 50 + base * 150)
  }
}
