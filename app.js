var http = require('http');
var authorize = require('./authorize')
var express = require('express');
var cookieParser = require('cookie-parser');
var mssql = require('mssql');

var app = express();
app.use( express.static( "./static" ) );

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser('sgs90890s8g90as8rg90as8g9r8a0srg8'));
app.set('view engine', 'ejs');
app.set('views', './views');

//w definicji obslugi sciezki wrzucamy middlewhare authorize i jesli on przepusci zadanie to req.user bedzie wypelniony wartoscia
//jednoczesnie authorize jest straznikiem i jesli nie przepusci żądania, to pójdziemy do endpointa końcowego - login   
productsTAB = [];
    
async function main() {       
    var conn = new mssql.ConnectionPool(
        'server=localhost,1433;database=WEPPO;user id=weppo_sklep;password=weppo123;Trusted_Connection=True;TrustServerCertificate=True;');
    try {
        await conn.connect();
        var request = new mssql.Request(conn);
        var result = await request.query('select * from products');
        result.recordset.forEach(r => {
            productsTAB.push({'name': r.name,'description':r.description,'imgLink': r.imgLink,'price':r.price});
            console.log(productsTAB)
        })
        await conn.close();
    }
    catch (err) {
        if (conn.connected)
            conn.close();
        console.log(err);
    }
}
main();

app.get('/', authorize, (req, res) => {
    //res.render('user', {username: 'foo'});
    res.render('user', { products: productsTAB });

});

app.get('/logout', authorize, (req, res) => {
    res.cookie('user', '', { maxAge: -1 });
    res.redirect('/')
});




// strona logowania
//endpoint ktorego zadaniem bedzie wydanie ciastka dla nowego uzytkownika
app.get('/login', (req, res) => {
    
    res.render('login');
});
app.post('/login', (req, res) => {
    var username = req.body.txtUser;
    var pwd = req.body.txtPwd;
    if (username == pwd) {
        // wydanie ciastka
        res.cookie('user', username, { signed: true });
        // przekierowanie
        var returnUrl = req.query.returnUrl;
        res.redirect(returnUrl);
    } else {
        res.render('login', { message: "Zła nazwa logowania lub hasło" }
        );
    }
});


http.createServer(app).listen(8080);
console.log('serwer działa, nawiguj do http://localhost:8080');