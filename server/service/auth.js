const jwt = require("jsonwebtoken");

function setUser(user){
    return jwt.sign({
        _id: user._id,
        firstName:user.firstName,
        lastName:user.lastName,
        email:user.email,
         plaidItems: user.plaidItems,
    }
    ,process.env.JWTPRIVATEKEY,
    {expiresIn:"7d"}
);

};



module.exports = {setUser}