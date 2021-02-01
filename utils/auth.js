const fs = require('fs')
const {google} = require('googleapis');
const _ = require('lodash')

const SCOPES = ['https://www.googleapis.com/auth/admin.directory.user', 'https://www.googleapis.com/auth/admin.directory.group', 'https://www.googleapis.com/auth/admin.directory.group.member'];

const TOKEN_PATH = './credentials/token.json'
const CREDS_PATH = '../credentials/credentials.json'
let keys = {redirect_uris: ["urn:ietf:wg:oauth:2.0:oob", "http://localhost"]}

if(fs.existsSync('./credentials/credentials.json')){
    keys = require(CREDS_PATH).installed
}

const auth2 = new google.auth.OAuth2(keys.client_id, keys.client_secret, keys.redirect_uris[0])
google.options({auth: auth2})
let service = google.admin({version: 'directory_v1'})

async function initAuth() {
    try {
        if(!fs.existsSync('./credentials/credentials.json')) {
            return false
        }else{
            if (fs.existsSync(TOKEN_PATH)){ 
                const {tokens} = require('../credentials/token.json')
                auth2.credentials = tokens
                return
            }else
            return auth2.generateAuthUrl({ access_type: 'offline', scope: SCOPES })
        } 
    } catch (error) {
        console.log(error)
    }
}
exports.initAuth = initAuth

async function saveToken(code){
    const r = await auth2.getToken(code)
    auth2.setCredentials(r.tokens)
    return storeToken(r)
}
exports.saveToken = saveToken

function storeToken(token) {
    fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
      if (err) return console.warn(`Token not stored to ${TOKEN_PATH}`, err)
      console.log(`Token stored to ${TOKEN_PATH}`)
    })
} 

let sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))
                   
/*+++++++++++++++++++++++++++++++++++++++++++++++ Groups insertions functions +++++++++++++++++++++++++++++++++++++++++++++++++++++ */
async function bulkNewGroups(grpEmails, res) {
    let ch = _.chunk(grpEmails, 10)
    let batchRes = []                
    for(emails of ch) {
        const r = await Promise.all(emails.map(email => newGroup(email, res)))
        if( _.some(r, ['statusText', 'Forbidden'])){
            batchRes.push(...r)
            return batchRes
        }else{
            batchRes.push(...r)
            await sleep(200)
        } 
    }
    return batchRes
} exports.bulkNewGroups = bulkNewGroups

async function newGroup(email, res) {
    try {
        let r = await service.groups.insert({ requestBody: { email: email } })
        const responseEventStream = buildEventStream(r)
        res.write(responseEventStream)
        return r
    } catch (e) {
        return e
    }
} exports.newGroup = newGroup

/*+++++++++++++++++++++++++++++++++++++++++++++++ Members insertions functions +++++++++++++++++++++++++++++++++++++++++++++++++++++ */

async function newMembers(groupKey, emails, res) {
    try {
        let r = await Promise.all(emails.map(email => newMember(groupKey, email, res)))
        if(_.includes(r, 403)){
            return _.find(x => x.status > 200)
        }
        return [...new Set(r)]
    } catch (error) {}
} exports.newMembers = newMembers

async function newMember(groupKey, email, res) {
    try {
        let r = await service.members.insert({ groupKey: groupKey, requestBody: { email: email } })
        if (r.status <= 200){
            console.log('-------ok------> memebre :', email)
            const responseEventStream = buildEventStream(r.status)
            res.write(responseEventStream)
            return r.staus
        }else{
            console.log('-----echec-----> memebre :', email)
            let erMsg = {
                status: r.status,
                errors: [{message: r.errors[0].message, reason: errors[0].reason}]
            }
            const responseEventStream = buildEventStream(erMsg)
            res.write(responseEventStream)
            res.end()
            return erMsg
        }
    } catch (e) {console.log(e)} 
} exports.newMember = newMember

/*+++++++++++++++++++++++++++++++++++++++++++++++++++++++ Stream Helpers++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */
/**
 * Builds event stream. Accept either string or object
 * @param object
 * @returns Stream of json data and a retry wich maybe deprecated
 */
function buildEventStream(r) {
    const retry = 1000
    let data = JSON.stringify(r)
    let message = `retry: ${retry}\n`
    message += `data: ${data}\n\n`

    return message
}

/**
 * Sends proper headers to keep connection alive. Also starts a time which periodically sends handshake event
 * @param res
 * @param handShakeInterval
 */
function establishConnection(res, handShakeInterval) {
    keepAlive(res);
    setHandshakeInterval(res, handShakeInterval);
}exports.establishConnection = establishConnection

/**
 * Sends headers to keep connection alive
 * @param res
 */
function keepAlive(res) {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no'
    });
}

/**
 * Periodically sends messages to client to keep connection alive
 * @param res
 * @param updateInterval
 */
function setHandshakeInterval(res, updateInterval) {
    const handshakeInterval = setInterval(() => res.write(': sse-handshake\n'), updateInterval);

    res.on('finish', () => clearInterval(handshakeInterval));
    res.on('close', () => clearInterval(handshakeInterval));
}

