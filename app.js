<<<<<<< HEAD
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
=======
const bodyParser = require('body-parser');
const express = require('express');
const session = require('express-session'); // Import express-session
const flash = require('express-flash'); // Import express-flash
const routes = require('./routes/router.js');

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

// Set up express-session
app.use(session({
    secret: 'your_secret_key', // Replace with your own secret key
    resave: false,
    saveUninitialized: true
}));

// Set up express-flash
app.use(flash());

// Use routes
app.use('/', routes);

app.listen(4500, () => {
    console.log('Server initialized on http://localhost:4500');
>>>>>>> 4ab7021ef334343db14e4b36b6aee0b1c513a1c0
});
