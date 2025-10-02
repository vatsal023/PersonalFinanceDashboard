const User = require("../models/userModel");
const {validateLogin} = require("../Validation/auth.js")
const {setUser} = require("../service/auth.js")
const bcrypt = require("bcrypt");

async function loginController(req,res){
    try{
          
        const {error} = validateLogin(req.body);

        if(error){
            return res.status(400).send({message:error.details[0].message});
            // return res.status(400).send({message:"Hello"});
        }

        //Find the user by email
        const user = await User.findOne({email:req.body.email});
        
        if(!user){
            return res.status(401).send({message:"Invalid Email"});
        }
        
        //Check password validity using bcrypt
          
        const validPassword = await bcrypt.compare(req.body.password,user.password);

        if(!validPassword){
           
            return res.status(401).send({message:"Invalid Password"});
        }

        //Check if the user's email is verified
        // if(!user.verified){
        //     return res.status(400).send({message:"User doesn't exist"});
        // }

        
        const token = setUser(user);
          
        res.status(200).cookie("authToken",token,{
            httpOnly:false,
            // httpOnly:true, //for production
            secure:true,
            sameSite:"none",
            expires:new Date(Date.now() + 7*24*60*60*1000),
        }).send({message:"Login successful",status:200});
        return;
    }catch(error){
        console.error("Error in loginController:",error);
        res.status(500).send({message:"Internal Server Error"});
    }
}

module.exports = loginController;
