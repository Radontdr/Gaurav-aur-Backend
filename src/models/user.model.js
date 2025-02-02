import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema=new mongoose.Schema({
    username:{
        type: String,
        required:true,
        lowercase:true,
        trim:true,
        index:true
    },
    email:{
        type: String,
        required:true,
        trim:true,
        lowercase:true,
    },
    fullname:{
        type: String,
        required:true,
        lowercase:true,
        trim:true,
        index:true
    },
    avatar:{
        type:String,
        //required:true
    },
    coverimage:{
        type:String,
    },
    watchhistory:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
    password:{
        type:String,
        required:[true,"Please enter the password"]
    },
    refreshtoken:{
        type:String
    }
},
{timestamps:true}
)
// basically we will apply a middleware named pre which will check just before saving the data in database
userSchema.pre("save",async function(next){
    if(!this.isModified(this.password)) return next();
    await bcrypt.hash(this.password,10)
    next()
})
userSchema.methods.passwordcorrect= async function(password){
    return  await bcrypt.compare(password,this.password)
}
userSchema.methods.generateaccesstoken=function(){
    jwt.sign(
        {
            _id:this._id,
            email:this.email,
            username:this.username,
            fullname:this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generaterefreshtoken=function(){
    jwt.sign(
        {
            _id:this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


export const User=mongoose.model("User",userSchema)