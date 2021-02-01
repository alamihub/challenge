const express = require('express')
const router = express.Router()


router.get('/', (req, res, next) => res.render('app'))
router.get('/gapi', (req, res, next) => res.render('gapi'))


















module.exports = router