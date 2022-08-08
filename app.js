const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors")
const associates = require("./src/models/associates")
const bookings = require("./src/models/bookings");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');

const path = require('path');

//port
const port = 3000;
const App = express();

App.use(express.static('./dist/frontend'));


//server connection
App.listen(process.env.PORT || port,(err)=>{
    if(err)
    console.log(err)
    else
    console.log("Server connected on port "+port)
});



//Middlewares
function verifyToken(req,res,next){
    if(!req.headers.authorization){
      return res.status(401).send('Unauthorized request');
    }
    let token = req.headers.authorization.split(' ')[1];
    console.log(token);
    if(token==null){
      return res.status(401).send('Unauthorized request');
    }
    let payload=jwt.verify(token,'secretKey')
    console.log(payload);
    if(!payload){
      return res.status(401).send('Unauthorized request');
    }
    req.username=payload.username;
    req.email=payload.email;
    
    next();
  }

  function verifyAdminToken(req,res,next){
    if(!req.headers.authorization){
      return res.status(401).send('Unauthorized request');
    }
    let token = req.headers.authorization.split(' ')[1];
    console.log(token);
    if(token==null){
      return res.status(401).send('Unauthorized request');
    }
    let payload=jwt.verify(token,'secretKey')
    console.log(payload);
    console.log(payload.username);
    // if(!payload){
    //   return res.status(401).send('Unauthorized request');
    // } 
  
    if(payload.username!=="admin"){
      return res.status(401).json({message:'Unauthorized'});
    }

    req.username=payload.username;
    
    
    next();
  }


App.use(cors());
App.use(express.json());
App.use(express.urlencoded({extended:true}));

//database connection
const Mongodb = "mongodb://localhost:27017/bookingportal";
const Mdatabase= "mongodb+srv://subin:subin@cluster0.gp64kyd.mongodb.net/bookingportal"


mongoose.connect(Mdatabase,{useNewUrlParser:true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on("error",console.error.bind(console,"connection error"));
db.once("open",()=>{
    console.log("connected to Mongodb");
});


App.route("/api/users")
.post((req,res)=>{
    res.header("Access-Contol-Allow-Origin","*");
    res.header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
    var user ={
        Name: req.body.name,
        Email:req.body.email,
        Password:req.body.password
    }
    var user = new associates(user);
    user.save((err,data)=>{
    if(err)
    console.log(err)
    else
    console.log(data)
    });
})

App.route("/api/book-hall")
.post(verifyToken,(req,res)=>{
    res.header("Access-Contol-Allow-Origin","*");
    res.header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
    var booking ={
        associateName: req.username,
        associateEmail:req.email,
        hallName:req.body.item.hallName,
        Date:req.body.item.Date,
        fromTime:req.body.item.fromTime,
        toTime:req.body.item.toTime
    }
    
booking.fromTime= booking.fromTime;
    var booking = new bookings(booking);
    booking.save((err,data)=>{
    if(err)
    console.log(err)
    else
    console.log(data)
    });
})

App.route("/api/checkslot")
.post(verifyToken,(req,res)=>{
    res.header("Access-Contol-Allow-Origin","*");
    res.header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
    var  date ={
        associateName: req.username,
        associateEmail:req.email,
        hallName:req.body.item.hallname,
        Date:req.body.item.date,
        fromTime:req.body.item.fromtime,
        toTime:req.body.item.totime
    }
    ////
    console.log(date)

    let day =date.Date.split('T')[0];
    date.fromTime=day+"T"+date.fromTime+":00"
    date.toTime=day+"T"+date.toTime+":00"
    ///

        bookings.find({"hallName":date.hallName,"fromTime":{$lt: (date.toTime)},"toTime":{$gt: (date.fromTime)}},(err,data)=>{
       if(err)
        console.log(err)
        else
        {
            if(data.length!==0)
            {
                var msg = "slotunavailable";
                 res.status(200).send(false);
            }
            else
            {
                console.log("available")
                res.status(200).send(date);}

        }

    })
});

App.route("/api/getbookingdetail")
.get(verifyToken,(req,res)=>{
    res.header("Access-Contol-Allow-Origin","*");
    res.header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
var email = req.email;
bookings.find({"associateEmail":email},(err,data)=>{
    if(err)
    console.log(err)
    else
    {
        res.send(data)
    }
})
})

App.route("/api/getbookingdetails")
.get(verifyToken,(req,res)=>{
    res.header("Access-Contol-Allow-Origin","*");
    res.header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
    bookings.find({})
    .then(data=>{
        res.send(data);
    })
});

App.route("/api/getbookingitem/:id")
.get(verifyAdminToken,(req,res)=>{
    res.header("Access-Contol-Allow-Origin","*");
    res.header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
    let id = req.params.id
    bookings.findById({"_id":id})
    .then(data=>{
        res.send(data);
    })
});

App.route("/api/deletebooking")
.post(verifyToken,(req,res)=>{
    res.header("Access-Contol-Allow-Origin","*");
    res.header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
    console.log(req.body)
    let id = req.body.id;
    bookings.deleteOne({"_id":id})
    .then((err,data)=>{
        if(err)
        console.log(err)
    });
    console.log("Success")



});

App.post('/api/register', function(req,res){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
    let associateData = {
        Name: req.body.associate.username,
        Email: req.body.associate.email,
        Password: req.body.associate.password,
    };
    console.log(associateData);
    bcrypt.hash(associateData.Password,10,function(err,hash){
        if(err){
            res.status(400).json({
                msg:"Something went wrong",results:err
            });
        }
        else{
            var associate = new associates({
                Name:associateData.Name,
                Email:associateData.Email,
                Password:hash
            });
            associate.save((error, registeredUser)=>{
                if(error){
                res.status(401).json({message:"Email already exists"});
                console.log(error)
                 } 
                else {
                    // let payload={username:registeredUser.username,
                    //              email:registeredUser.email};
                    // let token = jwt.sign(payload,'secretKey');
                    // res.status(200).send({token});
                    res.status(200).send();
                }

                });
            }
            })
        });

App.post('/api/login', function(req,res){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
    let associateData = {
        Email: req.body.associate.username,
        Password: req.body.associate.password,
    };
    console.log(associateData);
    associates.findOne({Email:associateData.Email},(err,user)=>{
        if (err) 
        console.log(err);
        else if(user==null)
        {
            res.status(401).json({
                message:"Invalid credentials"
            });
        }
        else{
            let validation =  bcrypt.compareSync(associateData.Password,user.Password);
            console.log(validation);

            if (validation) {
                console.log(user)
                let payload = {username:user.Name, email:user.Email};
                let token= jwt.sign(payload,'secretKey');
                let data ={
                    token,
                    id: user._id
                }
                res.status(200).send(data);
            } 
            else
            {
                console.log("Invalid credentials")
            res.status(401).json({
                message:"Invalid credentials"
            });
            }

        }
  
        


    })

                    
            
        });
        
App.get("/api/currentbookings", verifyToken,(req,res)=>{
    res.header("Access-Contol-Allow-Origin","*");
    res.header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");

    let todayDate = new Date();
    let afterDate = new Date();
    afterDate.setDate(afterDate.getDate() + 7);
    console.log(todayDate);
    console.log(req.email);

    bookings.aggregate([
        {
            "$match":
                {   
                    "associateEmail": req.email,
                    "Date":
                        {
                            "$lte": afterDate,
                            "$gte": todayDate
                        }
                }
        }
    ],function(err, docs) {
        if (err) {
            console.log(err);
            return;
        } else {
            console.log("Successful loaded data");
            res.send(docs);
        }
    }) 

})       

App.post('/api/adm-login', function(req,res){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
    let adminData = req.body;
    console.log(adminData);
    
            if (adminData.username!=="admin") {
                console.log('incorrect usrname');                
                          
                res.status(401).json({message:"Username is incorrect"});
               
            } else {
                // const validPassword = item.comparePassword(item.password);
                // console.log(validPassword)
            if (adminData.password!=="12345") 
    
            {
                console.log("Incorrect password");
                
                res.status(401).json({message:"Incorrect Password"});
                
            }else{
                console.log("Match");
                let payload = {username:adminData.username};
                let token= jwt.sign(payload,'secretKey');
                res.status(200).send({token});
               
            }
                    
            }
        })
        App.route("/api/admcheckslot")
        .post(verifyAdminToken,(req,res)=>{
            res.header("Access-Contol-Allow-Origin","*");
            res.header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
            var  date ={
                associateName: req.body.item.associateName,
                associateEmail:req.body.item.associateEmail,
                hallName:req.body.item.hallname,
                Date:req.body.item.DATE,
                fromTime:req.body.item.fromTime,
                toTime:req.body.item.toTime,
                _id:req.body.item._id
            }
            ////
        console.log(date)
            let day =date.Date.split('T')[0];
            date.fromTime=day+"T"+date.fromTime+":00"
            date.toTime=day+"T"+date.toTime+":00"
            ///
        
                bookings.find(
                    {"_id":{$ne:(date._id)},"hallName":date.hallName,"fromTime":{$lt: (date.toTime)},"toTime":{$gt: (date.fromTime)}},(err,data)=>{
               if(err)
                console.log(err)
                else
                {
                    if(data.length!==0)
                    {
                        var msg = "slotunavailable";
                         res.status(200).send(false);
                    }
                    else
                    {
                        console.log("available")
                        res.status(200).send(date);}
        
                }
        
            })
        });
        App.route("/api/admbooking")
        .post(verifyAdminToken,(req,res)=>{
            res.header("Access-Contol-Allow-Origin","*");
            res.header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
            let id = req.body.item._id;
            var booking ={
                associateName: req.body.item.username,
                associateEmail:req.body.item.email,
                hallName:req.body.item.hallName,
                Date:req.body.item.Date,
                fromTime:req.body.item.fromTime,
                toTime:req.body.item.toTime,
            
            }

        bookings.findByIdAndUpdate({"_id":id},{$set:booking},(err,data)=>{
        if(err)
        console.log(err)
        else
        res.send(data);
        })
        })


        App.get("/api/associates" , verifyAdminToken, function(req,res){
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
            associates.find()
              .then(function(associate){
               res.send(associate);
             })
       })
       
       App.get("/api/associate/:id" ,verifyAdminToken, function(req,res){
           res.header("Access-Control-Allow-Origin", "*");
           res.header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
           const id = req.params.id;
           console.log(id);
           associates.findOne({"_id":id})
             .then(function(associate){
              res.send(associate);
            })
       })
       
       App.put("/api/edit-associate" ,verifyAdminToken, function(req,res){
           res.header("Access-Control-Allow-Origin", "*");
           res.header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
           console.log(req.body);
           bcrypt.hash(req.body.Password,10,function(err,hash){
            if(err){
                res.status(400).json({
                    msg:"Something went wrong",results:err
                });
            }
            else{
                var id=req.body._id;
                var username=req.body.Name;
                var email=req.body.Email;
                 var password=hash;
                 associates.findByIdAndUpdate(id,
                    {$set:{
                      "Password":password
                      }})
                     .then(function(){
                        res.send();
        })  
        
    }
    
    })
    })
       
       App.delete("/api/del-associate/:id",verifyAdminToken, function(req,res){
           res.header("Access-Control-Allow-Origin", "*");
           res.header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
           
           
           console.log(req.params.id);
           associates.findByIdAndDelete(req.params.id)
           .then(()=>{
               console.log("Success");
               
               res.send();
           })
       })

       App.get('/*', function(req, res) {
        res.sendFile(path.join(__dirname + '/dist/frontend/index.html'));
        });      