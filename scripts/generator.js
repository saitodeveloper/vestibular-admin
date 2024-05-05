const dotenv = require('dotenv')
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const firstArg = process.argv[2] || 'local'
const pathAssetsBuildFile = path.join(
    __dirname,
    '..',
    'public',
    'js',
    'build',
    'constants.js'
)
const envPath = path.join(__dirname, '..', '.env')
const tamplateEnvPath = path.join(__dirname, `${firstArg}.env`)
const pathAssets = path.join(__dirname, '..', 'public', 'js', 'build')
const os = process.platform

const chain = {
    darwin: {
        command: `cp ${tamplateEnvPath} ${envPath}`
    },
    linux: {
        command: `cp ${tamplateEnvPath} ${envPath}`
    },
    win32: {
        command: `TYPE ${tamplateEnvPath} > ${envPath}`
    }
}
execSync(chain[os].command)
dotenv.config({ path: envPath })
const API_URL = process.env.API_URL
const ENV = process.env.ENV

fs.mkdirSync(pathAssets, { recursive: true })
fs.writeFileSync(
    pathAssetsBuildFile,
    `
/** Auto Generated File Don't change */

window.apiUrl = '${API_URL}'
window.app = {
    env: '${ENV}'
}
`.trim()
)
