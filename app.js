var http = require('http');
//var authorize = require('./authorize')
var express = require('express');
var cookieParser = require('cookie-parser');
var mssql = require('mssql');
var path = require('path');
var database_handling  = require('./database_handling');
var app = express();

const crypto = require('crypto');
const secret = 'mysecretkey';
const cipher = crypto.createCipher('aes256', secret);
const decipher = crypto.createDecipher('aes256', secret);


app.use( express.static( "./static" ) );

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser('sgs90890s8g90as8rg90as8g9r8a0srg8'));
app.set('view engine', 'ejs');
app.set('views', './views');

//w definicji obslugi sciezki wrzucamy middlewhare authorize i jesli on przepusci zadanie to req.user bedzie wypelniony wartoscia
//jednoczesnie authorize jest straznikiem i jesli nie przepusci żądania, to pójdziemy do endpointa końcowego - login   
productsTAB = [];
usersTAB=[];
    
async function main() {       
    var conn = new mssql.ConnectionPool(
        'server=localhost,1433;database=WEPPO;user id=weppo_sklep;password=weppo123;Trusted_Connection=True;TrustServerCertificate=True;');
    try {
        await conn.connect();
        var request = new mssql.Request(conn);
        var result = await request.query('select * from products');
        var result_users = await request.query('select * from users');
        result.recordset.forEach(r => {
            productsTAB.push({'name': r.name,'description':r.description,'imgLink': r.imgLink,'price':r.price});
            console.log(productsTAB)
        })
        result_users.recordset.forEach(user => {
            usersTAB.push({'name': user.name,'password':user.password,'perm': user.perm});
            console.log(usersTAB)
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

app.get('/',(req, res) => {
    //res.render('user', {username: 'foo'});
    res.render('user', { products: productsTAB });
});

app.get('/search/:name', (req, res) => {
    const products_found = productsTAB.filter(product => 
        ((product.name).toLowerCase()).includes((req.params.name).toLowerCase()) || 
        ((product.description).toLowerCase()).includes((req.params.name).toLowerCase()) );
    res.render('user', { products: products_found });

});
app.post('/search/', (req, res) => {
    var searchValue = req.body.searchVal;
    res.redirect(`/search/${searchValue}`);
})

app.get('/cart/add/:name', (req, res) => {

    var cookieValue;
    if (!req.cookies.cart) {
        cookieValue = [req.params.name];
        res.cookie('cart', cookieValue);
    } else {
        cookieValue = req.params.name;
        cartValue = req.cookies.cart;
        console.log(cookieValue);
        console.log(cartValue);
        cartValue.push(cookieValue);

        res.cookie('cart', cartValue);
    }
   res.redirect('/');
});

app.get('/view_users/remove/:name',(req,res) =>{
    database_handling.delete_user_from_datebase(req.params.name);
    function where_name(name){
        if (name == req.params.name) return true;
        return false;
    }
    usersTab = usersTAB.filter(where_name);
    res.redirect('/view_users');
});

app.get('/cart', (req, res) => {
    if (!req.cookies.cart) {
        res.render('cart', { products: [] });
    //powaiadom delikwenta zen ic nie ma wariacie 
    } else {
        cartValues = req.cookies.cart;
        products_found=[]
        for (let i=0;i<cartValues.length;i++){
             products_found.push(productsTAB.filter(product => ((product.name).toLowerCase()) == cartValues[i].toLowerCase())[0])
        }
        res.render('cart', { products: products_found });
        
    }
})

app.get('/profile', authorize, (req, res) => {
    res.cookie('user', '', { maxAge: -1 });
    res.redirect('/')
});



app.get('/logout', authorize, (req, res) => {
    res.cookie('user', '', { maxAge: -1 });
    res.redirect(returnUrl)
});

app.get('/view_users',authorize, (req, res) => {
    //var answ = await database_handling.select_users();
    var value = []
    answ.recordset.forEach(r => {
        value.push({'name': user.name,'password':user.password,'perm': user.perm});
        console.log(value)
    })
    res.render('view_users', { users: value });
})



// strona logowania
//endpoint ktorego zadaniem bedzie wydanie ciastka dla nowego uzytkownika
app.get('/login', (req, res) => {
    res.render('login');
});
app.post('/login', (req, res) => {
    var username = req.body.txtUser;
    var password = req.body.txtPwd;
    for(i=0;i<usersTAB.length;i++){
        if(usersTAB[i].name==username&& usersTAB[i].password==password){
            let encryptedUsername = cipher.update(username, 'utf8', 'hex');
            encryptedUsername += cipher.final('hex');
            res.cookie('user',encryptedUsername,{signed:true});
            var returnUrl = req.query.returnUrl||'/'
            res.redirect(returnUrl)
        }
    };
    res.render('login', { message: "Taki uzytkownik nie istnieje!" })
        
    /*
    if (username == password) {
        // wydanie ciastka
        res.cookie('user', username, { signed: true });
        // przekierowanie
        var returnUrl = req.query.returnUrl;
        res.redirect(returnUrl);
    } else {
        res.render('login', { message: "Zła nazwa logowania lub hasło" }
        );
    }
    */
});



app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', (req, res) => {
    var username = req.body.txtUser;
    var password = req.body.txtPwd;
    var repeated_password = req.body.repeattxtPWD;
    if(password != repeated_password){
        res.render('login', { message: 'Podane haslo jest inne od powtórzonego.'})
    }
    else{
        database_handling.insert_user(username,password,1);
        res.redirect('/');
    }
});

app.get('/admin', authorize, (req, res) => {
    res.render('admin');
});


//SKŁADANIE ZAMÓWIENIA
app.post('/cart', (req, res) => {
    if (!req.cookies.cart) {
        res.send("Koszyk jest pusty...");
    }
    var orderAsString = (req.cookies.cart).join(', ');
    var amount = req.body.totalPrice;
    const encryptedUsername = req.signedCookies.user;

    const decipher = crypto.createDecipher('aes256', secret);
    let user = decipher.update(encryptedUsername, 'hex', 'utf8');
    user += decipher.final('utf8');
    database_handling.insert_order(orderAsString, amount, user);
    res.clearCookie("cart");
    res.redirect('/')
    
});

http.createServer(app).listen(8080);
console.log('serwer działa, nawiguj do http://localhost:8080');


function checkpermission(username){
    for(i=0;i<usersTAB.length;i++)
        if(usersTAB[i].name==username)
            return usersTAB[i].perm   
    return 1;
}

function authorize(req, res, next) {
    if ( req.signedCookies.user ) {
        console.log(req.signedCookies.user) //nazwa uzytkownika
        if(req.url=="/admin"||"/view_users"){
            const encryptedUsername = req.signedCookies.user;
            const decipher = crypto.createDecipher('aes256', secret);
            let username = decipher.update(encryptedUsername, 'hex', 'utf8');
            username += decipher.final('utf8');
            if(checkpermission(username)!=2)
              res.redirect('/')
        }
        next();
        } else {
            res.redirect(`/login?returnUrl=${req.url}`);
        }
        }
           