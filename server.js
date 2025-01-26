import {readConfig} from "./src/Config.js";
import {createHoneypot} from "./src/CreateHoneypot.js";
import {HoneypotSshServerIntegration} from "./src/Integrations/HoneypotSshServerIntegration.js";
import {fileURLToPath} from 'url';
import {dirname, resolve} from 'path';
import {HoneypotSmtpServerIntegration} from "./src/Integrations/HoneypotSmtpServerIntegration.js";

const config = readConfig(resolve(dirname(fileURLToPath(import.meta.url)), '.env.json'))

const integrationMap = {
  HoneypotSshServerIntegration,
  HoneypotSmtpServerIntegration
}

/**
 * @type {AbstractHoneypotIntegration[]}
 */
const integrations = config.integrations.map((integration) => {
  if (typeof integration === 'string') {
    integration = {
      name: integration
    }
  }
  return new integrationMap[integration.name](integration.config)
})

await createHoneypot(integrations, config.honeypot).run()
