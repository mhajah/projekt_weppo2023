var mssql = require('mssql');
//import * as mssql from 'mssql';

conn = new mssql.ConnectionPool(
    'server=localhost,1433;database=WEPPO;user id=weppo_sklep;password=weppo123;Trusted_Connection=True;TrustServerCertificate=True;');

async function querry(sql){
    var conn = new mssql.ConnectionPool(
        'server=localhost,1433;database=WEPPO;user id=weppo_sklep;password=weppo123;Trusted_Connection=True;TrustServerCertificate=True;');

    try{
        await conn.connect();
        var request = new mssql.Request(conn);
        try{
            var result_request = await request.query(sql);
            //console.log(result_request);
            console.log("Success");
        }
        catch(err){
            if (conn.connected)
                conn.close();
            console.log(err);
        }
        await conn.close();
        console.log(result_request.recordsets[0]);
        return result_request.recordsets[0];
    }
    catch (err) {
        if (conn.connected)
            conn.close();
        console.log(err);
    }  
}

async function insert_product(name,description,imgLink,price){
    var sql = `INSERT INTO products (name, description, imgLink, price) VALUES ('${name}','${description}','${imgLink}','${price}')`;
    querry(sql); 
}

async function insert_user(name,password,perm){
    var sql = `INSERT INTO users (name, password,perm) VALUES ('${name}','${password}',${perm})`;
    querry(sql);
}

async function delete_user_from_datebase(name){
    var sql = `DELETE FROM users WHERE name ='${name}'`;
    querry(sql)
}

async function delete_product_from_datebase(name){
    var sql = `DELETE FROM products WHERE name ='${name}'`;
    querry(sql)    
}

//zwraca tablicę akutalnych userów z bazy danych
async function pullUsersFromDB(arguments) {
    var usersTAB = [];
    try {
        await conn.connect();
        var request = new mssql.Request(conn);
        var result_users = await request.query('select * from users');
        result_users.recordset.forEach(user => {
            usersTAB.push({'name': user.name,'password':user.password,'perm': user.perm});
            console.log(">>Pobieram uzytkownikow z bazy danych...")
        })
        await conn.close();
    }
    catch (err) {
        if (conn.connected)
            conn.close();
        console.log(err);
    } 
    console.log(usersTAB)

    return usersTAB;
}

async function pullProductsFromDB(arguments) {
    var productsTAB = [];
    try {
        await conn.connect();
        var request = new mssql.Request(conn);
        var result = await request.query('select * from products');
        result.recordset.forEach(r => {
            productsTAB.push({'name': r.name,'description':r.description,'imgLink': r.imgLink,'price':r.price});
        })
        await conn.close();
    }
    catch (err) {
        if (conn.connected)
            conn.close();
        console.log(err);
    } 

    return productsTAB;
}

async function update_product(id,name,newname,newprice,newdescription,newimgLink){
    var sql;
    if(id === NULL){
        sql = `UPDATE products SET name = '${newname}', description = '${newdescription}', imgLink = '${newimgLink}', price = '${newprice}' WHERE name = '${name}'`;
    }
    else{
        sql = `UPDATE products SET name = '${newname}', description = '${newdescription}', imgLink = '${newimgLink}', price = '${newprice}' WHERE ID = '${id}'`;
    }
    querry(sql);
}

async function update_user(id,name,newname,newpassword,newperm){
    var sql;
    if(id === NULL){
        sql = `UPDATE users SET name = '${newname}', password = '${newpassword}', perm = '${newperm}' WHERE name = '${name}'`;
    }
    else{
        sql = `UPDATE users SET name = '${newname}', password = '${newpassword}', perm = '${newperm}' WHERE ID = '${id}'`;
    }
    querry(sql);
}

async function insert_order(products,amount,user){
    var sql = `INSERT INTO orders (products, amount, userName) VALUES ('${products}', ${amount}, '${user}')`;
    querry(sql);
}

async function select_products(){
    return querry('select * from products');
}

async function select_users(){
    return querry('select * from users');
}

function result_select_users(){
    return select_users();
}

//export{update_product,update_user,delete_product_from_datebase,delete_product_from_datebase,insert_product,insert_user}
module.exports = {insert_product,insert_user,update_user,update_product,delete_user_from_datebase,
    delete_product_from_datebase,insert_order,select_products,select_users,pullProductsFromDB,pullUsersFromDB};