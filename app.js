const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const router = require('./routes/router');
const session = require('express-session');

const app = express();


app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.set('view engine', 'ejs');
    
// Serve static files from uploads


app.use(express.static('public')); // For static files like CSS or images

// Use the router
app.use('/', router);


app.listen(3000, () => {
    console.log(`Server running on port http://localhost:3000`);
});
