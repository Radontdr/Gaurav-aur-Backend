import asynchandler from "../utils/asynchandlers.js"
import apiresponse from"../utils/apiresponse.js"
import apierror from "../utils/apierror.js"
import {User} from "../models/user.model.js"
import {cloudinaryfileupload} from "../utils/cloudinary.js"
const getAccesstokenandRefreshtoken=async(userId){
    try {
        const user=await User.findById(userId)
        const AccessToken=generateaccesstoken();
        const RefreshToken=generaterefreshtoken();
        user.refreshtoken=RefreshToken;
        user.save({ValidateBeforeSave:false})
        return {AccessToken,RefreshToken}
    } catch (error) {
        throw new apierror(500,"Something went wrong while generating the tokens")
    }
}

const userRegister=asynchandler(async(req,res)=>{
    //taking data from the user ,body contains all data when the input is json or forms
    const {fullname,email,username,password}=req.body
    //validating all the input ;checking for empty
    if(
        [fullname,email,username,password].some(
            (field)=> !field || field.trim() ==="")
    ){throw new apierror(400,"Please enter a valid input")}

    const existeduser= await User.findOne({
        $or:[{ username },{ email }]
    })
    if(existeduser){
        throw new apierror(409,"Username and email already exist")
    }

    const avatarfilepath=req.files?.avatar[0]?.path
    const coverimgfilepath=req.files?.coverimage[0]?.path

    if(!avatarfilepath){
        throw new apierror(400,"Avatar file is required")
    }
    if(!coverimgfilepath){
        throw new apierror(400,"coverimage file is required")
    }
    const avatar=await cloudinaryfileupload(avatarfilepath)
    const coverimage=await cloudinaryfileupload(coverimgfilepath)
    if(!avatar){
        throw new apierror(400,"Avatar file is required")
    }
    const user= await User.create({
        fullname,
        username:username.toLowerCase(),
        email,
        password,
        avatar:avatar.url,
        coverimage:coverimage?.url || ""
    })
    const createduser= await User.findById(user._id).select(
        "-password -refreshtoken"
    )
    if(!createduser){
        throw new apierror(500,"something went wrong while registering")
    }
    return res.status(200).json(
        new apiresponse(201,createduser,"User registered")
    )
})

const userlogin=asynchandler(async(req,res)=>{
    const {username,email,password}=req.body;
    if(!username || !email){
        throw new apierror(400,"user or email is not registered")
    }

    // fetching the registered user from the database 
    const user= await User.findOne({
        $or:[{ username },{ email }]
    })

    // checking whether the user exists or not 
    if(!user){
        throw new apierror(404,"user does not exist")
    }

    //checking the password by mtaching it with the one stored in db with the method we have defined in the usermodel
    const ispasswordvalid=await user.passwordcorrect(password);
    if(!ispasswordvalid){
        throw new apierror(404,"user does not exist")
    }

    //generating the tokens from the method defined above as we need these tokens many times so we have defined a dedicated method for it
    const {AccessToken,RefreshToken}=await getAccesstokenandRefreshtoken(user._id);
    const loggedinuser=await User.findById(user._id).select("-password -refreshtoken")

    const option={
        httpOnly:true,
        secure:true
    }
    return res
    .status(200)
    .cookie("AccessToken",AccessToken,option)
    .cookie("RefreshToken",RefreshToken,option)
    .json(
        new apiresponse(
            200,
            {
                user:loggedinuser,AccessToken,RefreshToken
            },
            "Login successfull"
        )
    );
})
export  {userRegister,userlogin}
