const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const associateSchema = new Schema({

    Name:{
        type: String,
    },
    Email:{
        type:String,
        unique:true
    },
    Password:{
        type:String
    },
    JoinedDate:{
        type: Date,
        default:Date.now
    }
    
});

const associates = mongoose.model('associates',associateSchema)
module.exports= associates;
