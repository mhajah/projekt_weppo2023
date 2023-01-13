const http =       require("http")
var express =      require("express");

var app = express();

//
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