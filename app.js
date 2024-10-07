const express = require('express');
const app = express();
const hardwareRoutes = require('./routes/hardwareRoutes');
const path = require('path');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); 

app.use('/', hardwareRoutes);

app.listen(4001, () => {
    console.log('Server running on http://localhost:4001');
});
