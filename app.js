const express = require('express')
const app = express()
const hbs = require('express-handlebars')
const mongoose = require('mongoose')
const passport = require('passport')
const flash = require('connect-flash')
const session = require('express-session')
const browserify = require('browserify-middleware');

const morgan = require('morgan');
const multer = require('multer');
const uuid = require('uuid/v4');
const { format } = require('timeago.js');

const path = require('path')
const bodyParser = require('body-parser')
const expressSanitizer = require('express-sanitizer')
const methodOverride = require('method-override')

const dotenv = require('dotenv')
dotenv.config()

// Passport Config
require('./config/passport')(passport);


//browserify 
browserify.settings({
    transform: ['hbsfy']
});
app.get('/javascripts/bundle.js', browserify('./public/script.js'));



// ----------------mongodb atlas start---------------------------------
const uristring = process.env.MONGODB_URI || 'mongodb://localhost/mytodoapplist';

mongoose.connect(
        uristring, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true }
    )
    .then(() => console.log('DB Connected'))
mongoose.connection.on('error', err => {
    console.log('DB connection error: ${err.message}')
});
// -----------------mongodb atlas end------------------------------------

function ignoreFavicon(req, res, next) {
    if (req.originalUrl === '/favicon.ico') {
        res.status(204).json({ nope: true });
    } else {
        next();
    }
}

app.use(ignoreFavicon);

// Handlebars middleware
app.engine('handlebars', hbs({ defaultLayout: 'layout' }));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars'); //we assigned our view engine to ejs

// Static Folder
app.use(express.static(path.join(__dirname, 'public')))

// Express body parser
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(expressSanitizer());

//
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
const storage = multer.diskStorage({
    destination: path.join(__dirname, 'public/images/uploads'),
    filename: (req, file, cb, filename) => {
        console.log(file);
        cb(null, uuid() + path.extname(file.originalname));
    }
})
app.use(multer({ storage }).single('image'));


// Express session
app.use(
    session({
        secret: 'secret',
        resave: true,
        saveUninitialized: true
    })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    app.locals.format = format;
    next();
});

//routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));


const PORT = process.env.PORT || 3000;
app.listen(PORT, console.log(`Server started on port ${PORT}`));