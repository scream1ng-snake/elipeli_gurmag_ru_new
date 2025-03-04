class Config {
  enableLogs = true
  isDev = !!(
    // window.location.hostname === 'localhost' || 
    // window.location.hostname === 'glowing-truffle-8a37a0.netlify.app' ||
    window.location.hostname === '127.0.0.1'
  )
  get apiURL() {
    return this.isDev
      ? this.testApi
      : this.api
  }
  api = 'https://elipelisr.craimez.ru/elipelibot'
  staticApi = 'https://elipelisr.craimez.ru/elipelibot'
  testApi = 'https://elipelisr.craimez.ru/elipelibottest'

  // minPriceForDelivery: number | undefined = 750
}

export default new Config() // eslint-disable-line