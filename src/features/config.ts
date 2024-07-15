class Config {
  enableLogs = true
  isDev = !!(process.env.NODE_ENV === 'development')
  get apiURL() {
    return this.isDev
      ? this.testApi
      : this.api
  }
  api = 'https://elipelisr.lexcloud.ru/elipelibot'
  testApi = 'https://elipelisr.lexcloud.ru/elipelibot_test'
}

export default new Config()