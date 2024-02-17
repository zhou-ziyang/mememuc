const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const multer = require('multer');
const app = express();
app.use(cors({
    origin: '*', // allow all origins
}));

// ##### IMPORTANT
// ### Your backend project has to switch the MongoDB port like this
// ### Thus copy and paste this block to your project
const MONGODB_PORT = process.env.DBPORT || '65535';
const db = require('monk')(`127.0.0.1:${MONGODB_PORT}/omm-ws2223`); // connect to database omm-2021
console.log(`Connected to MongoDB at port ${MONGODB_PORT}`)
// ######

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const templatesRouter = require('./routes/templates');
const memesRouter = require('./routes/memes');
const myMemesRouter = require('./routes/my_memes');
const draftsRouter = require('./routes/drafts');
const apisRouter = require('./routes/apis');
const loginRouter = require('./routes/login');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());

app.use(function (req, res, next) {
    req.db = db;
    next();
});

// app.use((req, res, next) => {
//     // If the path starts with /images/templates, skip the next middleware
//     console.log("PATH: " + req.path)
//     if (req.path.startsWith('/images/templates')) {
//         console.log("Skipping authentication for image request.")
//         return next();
//     }
//     // Otherwise, proceed to the next middleware (authentication)
//     next();
// });

// the login middleware. Requires BasicAuth authentication
app.use((req, res, next) => {
    const users = db.get('users');
    console.log("AUTHORIZATION: " + req.headers.authorization)
    users.findOne({basicauthtoken: req.headers.authorization}).then(user => {
        // console.log(user)
        if (req.path.startsWith('/images')) {
            console.log("Skipping authentication")
            next();
        } else if (user) {
            req.username = user.username;  // test test => Basic dGVzdDp0ZXN0
            req.id = user._id;
            req.loggedin = true;
            next()
            console.log("Logged in.")
        } else {
            res.set('WWW-Authenticate', 'Basic realm="401"')
            res.status(401).send()
            console.log("Authentication failed.")
        }
    }).catch(e => {
        console.error(e)
        res.set('WWW-Authenticate', 'Basic realm="401"')
        res.status(401).send()
        console.log("Login failed.")
    })
})


app.use(express.static(path.join(__dirname, 'public')));
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/templates', templatesRouter);
app.use('/memes', memesRouter);
app.use('/my_memes', myMemesRouter);
app.use('/drafts', draftsRouter);
app.use('/apis', apisRouter);
app.use('/login', loginRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

// const upload = multer({ dest: 'uploads/' });
// app.post('upload', upload.single('file'), (req, res) => {
//     if (req.file) {
//         res.status(200).send('File uploaded successfully.');
//     } else {
//         res.status(400).send('No file uploaded.');
//     }
// });

module.exports = app;
