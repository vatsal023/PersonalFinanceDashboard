const bcrypt = require("bcrypt")
const User = require("../models/userModel.js");
const {validateRegister} = require("../Validation/auth.js");
// const {Token} = require("../models/tokenModel.js")
// const sendEmail  = require("../utils/sendEmail.js")
const crypto  = require("crypto")

async function registerController(req,res){
    const {firstName,lastName,email,password} = req.body;
    
    try{
        const {error} = validateRegister(req.body)
         
        if(error){
            return res.status(400).send({ message: error.details[0].message });
        }

        //Check if user with the given email already exists
        let user = await User.findOne({email});

        if(user){
            return res.status(409).send({message:"User with given email already exists"});
        }

        const salt = await bcrypt.genSalt(Number(process.env.SALT));
        const hashPassword = await bcrypt.hash(password,salt);

        ///save the user with hashed password
        user = await new User({
            ...req.body,password:hashPassword
        }).save();

        //Generate a verification token and send an email
        // const token = await new Token({
        //     userId: user._id,
        //     token : crypto.randomBytes(16).toString("hex"),
        //     createdAt:Date.now(),
        //     expiresAt:Date.now()+3600000,
        // }).save();

        // const url = `${process.env.BASE_URL}/users/${user._id}/verify/${token.token}`;
        // await sendEmail(user.email,"Verify Email",url);

        // user.verificationLinkSent = true;
        // await user.save();
        // res.status(201).send({message:`Verification email sent to ${user.email}`});        
        res.status(201).send({ message: "User registered successfully"});
    }catch(error){
        console.error("Error in registerController:",error);
        res.status(500).send({message:"Internal Server Error"});
    }


};

module.exports = registerController;
