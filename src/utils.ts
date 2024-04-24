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

export const orderBySignificance = (domains: string[]): string[] => {
  const copy = [...domains]
  copy.sort((a, b) => {
    const ac = a.split('.').length
    const bc = b.split('.').length
    if (ac > bc) {
      return -1
    }
    if (ac < bc) {
      return 1
    }
    return 0
  })
  return copy
}

export const cleanDomainName = (domainName: string): string => {
  if (domainName.endsWith('.')) {
    return domainName.slice(0, -1)
  }
  return domainName
}

export const cleanHostedZoneId = (hostedZoneId: string): string => {
  return hostedZoneId.replace(/^\/hostedzone\//, '')
}

export const cleanChangeId = (changeId: string): string => {
  return changeId.replace('/change/', '')
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
