const Joi = require("joi")
const passwordComplexity = require("joi-password-complexity");

const validateRegister = (data)=>{
    const schema = Joi.object({
        firstName: Joi.string().required().label("First Name"),
        lastName: Joi.string().required().label("Last Name"),
        email: Joi.string().email().required().label("Email"),
        password: passwordComplexity().required().label("Password"),
    });
    return schema.validate(data);
}

const validateLogin = (data)=>{
    const schema = Joi.object({
        email:Joi.string().email().required().label("Email"),
        password: passwordComplexity().required().label("Password"),
    });
    return schema.validate(data);
}

module.exports = {validateRegister,validateLogin};
