require('dotenv').config();
var express = require('express');
const cors = require('cors')
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');
const MongoStore = require('connect-mongo')


var app = express();

// DB Connection
const conn = require('./db/conn');
conn()

// Middlewares
app.use(cors({credentials:true, origin:"http://localhost:3000"}))
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, process.env.EVENT_MEDIA_ROOT)));
app.use(express.static(path.join(__dirname, process.env.PROFILE_MEDIA_ROOT)));
// Session
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.DEBUG ? false : true },
    store: MongoStore.create({
        mongoUrl: process.env.DBURI
    })
}));

// Routes
const routes = require('./routes/router');
const authRouter = require('./routes/auth');
const { requireAuth, requireTwoFactor } = require('./middleware/requireAuth');

app.use('/', authRouter)
app.use('/api', [requireAuth, requireTwoFactor], routes)

module.exports = app;
