class Config {
  enableLogs = true
  isDev = !!(process.env.NODE_ENV === 'development')
  get apiURL() {
    return this.isDev
      ? this.testApi
      : this.api
  }
  api = 'https://elipelisr.lexcloud.ru/elipelibot'
  staticApi = this.api
  testApi = 'https://elipelisr.lexcloud.ru/elipelibottest'
}

export default new Config() // eslint-disable-line