class Config {
  enableLogs = true
  isDev = !!(process.env.NODE_ENV === 'development')
  get apiURL() {
    return this.isDev
      ? this.testApi
      : this.api
  }
  api = 'https://elipelisr.craimez.ru/elipelibot'
  staticApi = 'https://elipelisr.craimez.ru/elipelibot'
  testApi = 'https://elipelisr.craimez.ru/elipelibottest'

  minPriceForDelivery: number | undefined = 750
}

export default new Config() // eslint-disable-line