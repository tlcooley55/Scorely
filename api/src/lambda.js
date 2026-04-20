const serverlessHttp = require('serverless-http')
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager')

async function loadSecretsIfNeeded() {
  if (process.env.IS_OFFLINE) {
    try {
      // eslint-disable-next-line global-require
      require('dotenv').config()
    } catch (_) {
      // ignore
    }

    return
  }

  const secretId = process.env.SECRETS_ID
  if (!secretId) return

  try {
    const client = new SecretsManagerClient({})
    const res = await client.send(new GetSecretValueCommand({ SecretId: secretId }))
    const secretString = res.SecretString

    if (!secretString) return

    const parsed = JSON.parse(secretString)
    if (!parsed || typeof parsed !== 'object') return

    for (const [key, value] of Object.entries(parsed)) {
      if (process.env[key] === undefined && value !== undefined && value !== null) {
        process.env[key] = String(value)
      }
    }
  } catch (err) {
    // Cold start should never throw.
    // eslint-disable-next-line no-console
    console.warn('Secrets Manager load failed:', err && err.message ? err.message : err)
  }
}

// Start secrets loading on cold start; do not block module initialization.
// Routes that require secrets will fail later with clearer messages.
const secretsReady = loadSecretsIfNeeded()

const { createApp } = require('./app')

const app = createApp()

const handler = serverlessHttp(app)

module.exports.handler = async (event, context) => {
  await secretsReady
  return handler(event, context)
}
