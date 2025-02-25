import createError from 'http-errors';
import express, { json, urlencoded } from 'express';
import cookieParser from 'cookie-parser';
import methodOverride from 'method-override';
import logger from 'morgan';
import flash from 'connect-flash';
import session from 'express-session';
import 'dotenv/config';
import { errorHandler } from './middlewares/errorHandler.js';

import indexRouter from './routes/pagesRoute.js';
import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

// database connection
import getDb from './config/db.js';

const checkConnection = async () => {
    try {
        const db = await getDb(); // Get the db connection after the tunnel is established
        await db.query('SELECT 1');
        console.log('Connected to MySQL');
    } catch (err) {
        console.error('MySQL Connection Error:', err.message);
    }
};
checkConnection(); // Check the connection

const app = express();

// view engine setup
app.set('view engine', 'ejs');

// configuration
app.use(logger('dev'));
app.use(express.json());
app.use(urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));
app.use(
    methodOverride('_method', {
        methods: ['POST', 'GET'],
    })
);
app.use(
    session({
        secret: process.env.FLASH_SECRET_KEY,
        resave: false,
        saveUninitialized: true,
        cookie: { maxAge: 600000 },
    })
);
app.use(flash());

// Routes
app.use((req, res, next) => {
    res.locals.messages = req.flash();
    next();
});
app.use('*', (req, res, next) => {
    res.locals.isUserSignedIn = req.session.userID;
    next();
});
app.use('/auth', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/', indexRouter);

app.listen(8080);
console.log('Server is listening on port 8080');

// catch 404 and forward to error handler
app.use((req, res, next) => {
    next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

// Global Error Handler
app.use(errorHandler);

export default app;
