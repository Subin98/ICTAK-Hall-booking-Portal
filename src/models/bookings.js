const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema({

    associateName:{
        type: String,
    },
    associateEmail:{
        type:String
    },
    hallName:{
        type:String
    },
    Date:{
        type: Date
    },
    fromTime:{
        type:Date
    },
    toTime:{
        type:Date
    }
    
});

const bookings = mongoose.model('bookings',bookingSchema)
module.exports= bookings;