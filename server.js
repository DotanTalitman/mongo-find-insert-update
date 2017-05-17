var express = require("express");
var app = express();
var mongodb = require("mongodb")
var mongoClient = mongodb.MongoClient;
var objectId = mongodb.ObjectID;
app.set("view engine", "vash");
var bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

var dbConfig={
    url : "mongodb://localhost:27017/mysite" ,
    isConnected:false,
    database:null   
}




app.get("/", function (req, res) {

    res.sendFile(__dirname + "/index.html");
})

app.post("/profile/update", function (req, res) {
    var dataToUpdate = req.body;
    var id= dataToUpdate._id;
    delete dataToUpdate._id;// this is important because you can't modify the _id field in th db;
        mongoClient.connect(dbConfig.url, function (err, db) {
            dbConfig.database = db;
            dbConfig.database.collection("users").update({
                _id: objectId(id)
            },dataToUpdate, function (err, doc) {
                 dbConfig.database.close();
                dbConfig.isConnected=false;
                  res.redirect("/profile/" + id);
              
            })
        })
});



app.get("/profile/:id", function (req, res) {
    var id = req.params.id;
   
    if (dbConfig.isConnected)
    {
        dbConfig.database.collection("users").findOne({
            _id: objectId(id)
        }, function (err, doc) {
           dbConfig.database.close();
           dbConfig.isConnected=false;
            res.render("myProfile", doc);
        })
    }
    else {
     
        mongoClient.connect(dbConfig.url, function (err, db) {
            dbConfig.database = db;
            dbConfig.database.collection("users").findOne({
                _id: objectId(id)
            }, function (err, doc) {
              
                 dbConfig.database.close();
                dbConfig.isConnected=false;
                  res.render("myProfile", doc);
              
            })
        })
    }


})



app.post("/register", function (req, res) {

    var userData = req.body;

    mongoClient.connect(dbConfig.url, function (err, db) {
       dbConfig.database = db;
        dbConfig.database.collection("users").insert(userData, function (err, userInserted) {

            dbConfig.isConnected=true;
            res.redirect("/profile/" + userData._id);
        });
    })

    // var username= userData.username;
    //  var email =userData.email;
    //var password = userData.password;
    //res.redirect("/profile/"+username+"/"+email+"/"+password)


})

app.listen(3000, function () {
    console.log('App listening on port 3000!');
});