const mongoose = require("mongoose")
const validator = require("validator")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const Task = require("../models/task")

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        trim : true,
        required : true 
    },
    email : {
        type : String,
        trim : true,
        unique : true,
        lowercase: true,
        required : true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Email is invalid")
            }
        }
    },
    age : {
        type : Number,
        default : 0,
        validate(value){
            if(value < 0)
            {
                throw new Error("Age must be Positive Number")
            }
        }
    },
    password : {
        type : String,
        trim : true,
        required : true,
        minlength : 7
    },
    tokens : [{
        token : {
            type : String,
            required : true
        }
    }],
    avatar : {
        type : Buffer
    }
}, { timestamps :true})
userSchema.methods.generateAuthToken = async function(){
    const user = this
    const token = jwt.sign({ _id : user._id.toString()} ,process.env.SECRET_KEY)
    user.tokens = user.tokens.concat({ token })
    await user.save();
    return token

}
//When express sends back data by res.send() it calls JSON.stringify() in behind and toJSON() can decide what to send
userSchema.methods.toJSON = function(){
     const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

userSchema.statics.findbyproperty = async (email,password) =>{
         
        const user = await User.findOne({ email })
        if(!user)
        {
            throw new Error("Unable to login")
        }
        const isOk = await bcrypt.compare(password, user.password)
        if(!isOk)
            throw new Error("Unable to login")
        
        return user
}

userSchema.pre('save' ,async function(next){
    const user = this
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password ,8)
    }
    next()
})

userSchema.pre('remove' , async function(next){
    const user =  this

    await Task.deleteMany({ owner : user._id})
    next();
})

const User = new mongoose.model("User" , userSchema)
module.exports = User