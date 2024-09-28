const bodyParser = require('body-parser');
const express = require('express');
const routes = require ('./routes/router.js')
const app = express();

app.set('view engine','ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:true}));
app.use('/',routes);

app.listen(4500,()=>{
    console.log('server initialized on http://localhost:4500');
});