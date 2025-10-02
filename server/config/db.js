const mongoose = require('mongoose');

async function connectToMongoDB(){
    try{
        // await mongoose.connect("mongodb://127.0.0.1:27017/chatapp")
        // await mongoose.connect("mongodb://localhost:27017/chatapp");
        await mongoose.connect(process.env.DB);
        console.log("DB Connected Successfully")
    }catch(error){
        console.log(error)
        console.log("Could not connect to DB")
    }
}

module.exports = connectToMongoDB;

