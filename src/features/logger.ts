import config from "./config"

export const logger = {
  log: (text: string, context?: string) => {
    if (config.enableLogs) {
      console.log(`[${context?.toUpperCase()}]: - ${text}`)
    }
  },
  warn: (text: string, context?: string) => {
    if (config.enableLogs) {
      console.warn(`[${context?.toUpperCase()}]: - ${text}`)
    }
  },
  error: (err: unknown, context?: string) => {
    if (config.enableLogs) {
      console.error(`ERROR [${context}]: \n`)
      console.error(err)
    }
  },
}