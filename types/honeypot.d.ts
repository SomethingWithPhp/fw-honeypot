import {IPList} from '../src/IPList'

export type HoneypotServerConfig = {
    banDurationMs?: number
    port?: number
    ipV4?: boolean
    ipV6?: boolean
    blacklist: IPList
    whitelist: IPList
}


type HoneypotIntegrationConfig = {
    name: string
    config: HoneypotServerConfig
}

export type HoneypotEnvironmentConfig = {
    integrations: (HoneypotIntegrationConfig | string)[]
    honeypot: HoneypotServerConfig
}
