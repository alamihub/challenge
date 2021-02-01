        const       express = require('express'),
                    router = express.Router(),
                    path = require('path'),
                    multer  = require('multer'),
                    driver = require('../utils/driver'),
                    chunker = require('../utils/constructData'),
                    gauth = require('../utils/auth'),
                    _ = require('lodash')
/*-------------------------------------------------------------------------------------------------------------------------------------------------*/
/*                               Muleter Config for Handling Multipart-form data
/*-------------------------------------------------------------------------------------------------------------------------------------------------*/
                            const dataStorage = multer.diskStorage({
                                destination: function (req, file, cb) {
                                    cb(null, './uploads/')
                                },
                                filename: function (req, file, cb) {
                                    cb(null, file.originalname);
                                }
                            })

                            const credentialsStorage = multer.diskStorage({
                                destination: function (req, file, cb) {
                                    cb(null, './credentials/')
                                },
                                filename: function (req, file, cb) {
                                    cb(null, file.originalname);
                                }
                            })

                            const txtFilter = (req, file, cb) => {
                                const mimetype = file.mimetype === "text/plain" ? true : false 
                                const extname = path.extname(file.originalname).toLowerCase() === ".txt" ? true : false
                                if (mimetype && extname) {return cb(null, true)}
                                cb("Error: File upload only supports .txt format")
                            }
                            const JsonFilter = (req, file, cb) => {
                                const mimetype = file.mimetype === "application/json" ? true : false 
                                const extname = path.extname(file.originalname).toLowerCase() === ".json" ? true : false
                                if (mimetype && extname) {return cb(null, true)}
                                cb("Error: File upload only supports .json format")
                            }

                            const upload = multer({
                                storage: dataStorage,
                                fileFilter: txtFilter
                            })
                            const uploadJson = multer({
                                storage: credentialsStorage,
                                fileFilter: JsonFilter
                            })

/*-------------------------------------------------------------------------------------------------------------------------------------------------*/
        router.post('/upload', upload.single('file'), (req, res) => {
            if (!req.file ) { return res.status(400).send('No files were uploaded.') }
            const listName = req.file.originalname
            const domain = req.body.domain
            const grpPrefixe = req.body.grpPrefixe
            const emailTest = req.body.email
            const chunkSize = req.body.chunksize
            chunker.asyncChunkList(listName, grpPrefixe, chunkSize, emailTest, domain).then(res.send({"message": "Data Uploaded & treated Succefully!!"}))
        })

        router.post('/cred-json', uploadJson.single('json'), (req, res) => {
            if (!req.file ) { return res.status(400).send('No files were uploaded.') }
            res.send({"message": "crendentials saved Succefully!!"})
        })

        router.get('/getlistinfo', (req, res) => {
            driver.listDetails().then((result) => res.send(result))
        })

        router.post('/getgrpemails', (req, res) => {
            let name = req.body.listName
            driver.getGrpEmails(name).then((result) => res.send(result))
        })

       let sseScope = []
        router.post('/get-groups/', async (req, res) => {
            let name = req.body.listName
            sseScope = await driver.getGrpEmails(name)
            res.sendStatus(200)
        })
        
        router.get('/ssegrps', async (req, res) => {
            gauth.establishConnection(res, 2000)
            const result = await gauth.bulkNewGroups(sseScope, res)
            console.log(result)
        })

        let name, grpCount
        router.post('/get-emails/', async (req, res) => {
            name = req.body.listName
            grpCount = req.body.gSize
            res.sendStatus(200)
        })

        router.get('/ssembrs', async (req, res) => {
            let batchRes = []
            try{
                gauth.establishConnection(res, 3000)
                for(grp of [...Array(grpCount).keys()]){
                    const groupKey = await driver.getGrpName(name, grp)
                    console.log('inserting memebres for:', groupKey)
                    for (i of [...Array(10).keys()]) {
                        let emails = await driver.getEmailsTen(name, grp, i)
                        let r = await gauth.newMembers(groupKey, emails, res)
                        if(_.includes(r, 403)){
                            return r 
                        }
                            batchRes.push(r[0])
                            await sleep(50)
                    }
                } 
                return batchRes  
            }catch (error) {}
        })

        router.post('/getemailsten', (req, res) => {
            let name = req.body.listName
            driver.getEmailsTen(name, 0, 0)
            .then((result) => {
                res.send(result)
            })
        })

        router.post('/send-code', (req, res) => {
            console.log('code:', req.body.authcode)
            gauth.saveToken(req.body.authcode).then(res.send({"message": "Token saved Succefully!!"}))
        })

        router.get('/get-auth-url', (req, res) => {
            gauth.initAuth().then((result) => {
                if (result === false) {res.send({ "display": true })}
                else if (typeof result === undefined){ res.sendStatus(200) }
                else{ res.send({ "authUrl": result }) }
            })
        })

        const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

















module.exports = router