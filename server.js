const express = require('express')
const logger = require('morgan')
const fs = require('fs')
// const formidableMiddleware = require('express-formidable')

const bodyParser = require('body-parser')
const path = require('path')
const cons = require('consolidate')

const app = express()
app.disable('x-powered-by')
app.use(logger('dev'))

app.use(express.static(path.join(__dirname, 'public')))

// view engine setup
app.engine('html', cons.swig)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

/* BodyParser config */
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

/* Routes */
app.use('/', require('./routes/index.js'))
app.use('/api', require('./routes/api.js'))


const port = process.env.PORT || 5500
app.listen(port, () => {console.log(`Listening on http://localhost:${port}`)})