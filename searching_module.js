var mssql = require('mssql');
async function main() {
    var conn = new mssql.ConnectionPool(
        'server=localhost,1433;database=WEPPO;user id=weppo_sklep;password=weppo123');
    try {
        await conn.connect();
        var request = new mssql.Request(conn);
        var result = await request.query('select * from users');
        result.recordset.forEach(r => {
            console.log(`${r.ID} ${r.name}`);
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


/*
//

const http =       require("http")
var express =      require("express");

var app = express();



app.post('/', (req, res,next) => {
    const search_value = req.body.name;
    //make question to the SQL or sth...app
    var sql = require("mssql")
    var config = {
        server: 'localhost', //palceholder
        datebase: 'Sklep'
    };

    //conencting to the datebase
    sql.connect(config,function(err){

    
        if (err) console.log(err);
        
        //create Request object
        var request = new sql.Request();

        //querry to the datebase and get the records
        request.query('SELECT * FROM [Sklep].[dbo].[goods] WHERE name LIKE \'%{$search_value}%\'',function (err, recordset){
            if(err) console.log(err)

            //sending recors as a response
            res.send(recordset);
        });
    });



});

*/