import asynchandler from "../utils/asynchandlers.js"
import apiresponse from"../utils/apiresponse.js"
import apierror from "../utils/apierror.js"
import {User} from "../models/user.model.js"
import {cloudinaryfileupload} from "../utils/cloudinary.js"
import {verifyjwt} from "../middlewares/auth.middleware.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"

const getAccesstokenandRefreshtoken=async(userId)=>{
    try {
        const user=await User.findById(userId)
        const AccessToken=user.generateaccesstoken();
        const RefreshToken=user.generaterefreshtoken();
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
        email:email.toLowerCase(),
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
    if(!username && !email){
        throw new apierror(400,"user or email is required")
    }

    // fetching the registered user from the database 
    const user= await User.findOne({
        $or:[{ username:username?.toLowerCase() },{ email:email?.toLowerCase() }]
    })

    // checking whether the user exists or not 
    if(!user){
        throw new apierror(404,"user does not exist")
    }

    //checking the password by mtaching it with the one stored in db with the method we have defined in the usermodel
    const ispasswordvalid=await user.ispasswordcorrect(password);
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

const userLogout=asynchandler(async(req,res)=>{
    const user=User.findByIdAndUpdate(
        req.user._id,
        {
            $unset:{
                refreshtoken:1 //the value which has to be unset ,that values flag is set 
            }
        },
        {
            new:true  // if we dont use it then here it will return the old user i.e before refreshtoken update
            // if we use then it will return the final updated user
        }
    )
    const option={
        httpOnly:true,
        secure:true
    }
    res.status(200)
    .clearCookie("AccessToken",option)
    .clearCookie("RefreshToken",option)
    .json(
        new apiresponse(200,{},"User logout")
    )
})

const refreshaccesstoken=asynchandler(async(req,res)=>{
    const incomingrefreshtoken=req.cookies.RefreshToken || req.body.RefreshToken
    if(!incomingrefreshtoken){
        throw new apierror(401,"Invalid token")
    }
    try {
        const validatedtoken=jwt.verify(incomingrefreshtoken,process.env.REFRESH_TOKEN_SECRET)
        const user=await User.findById(validatedtoken?._id)
        if(!user){
            throw new apierror(400,"Invalid token")
        }
        if(incomingrefreshtoken !== user?.refreshtoken){
            throw new apierror(401,"Refresh token is expired")
        }
        const option={
            httpOnly:true,
            secure:true
        }
        const {newAccessToken,newRefreshToken}=getAccesstokenandRefreshtoken(user._id)
        res.status(200)
        .cookie("accesstoken",newAccessToken,option)
        .cookie("refreshtoken",newRefreshToken,option)
        .json(
            new apiresponse(200,{
                accesstoken:newAccessToken,refreshtoken:newRefreshToken
            },"Access token refreshed")
        )
    } catch (error) {
        throw new apierror(401,error?.message || "invalid refresh token")
    }

})

const updatepassword=asynchandler(async(req,res)=>{
    const{oldpassword,newpassword}=req.body;
    //here first i will apply auth.middleware to check whether the user is logged in or not jstverify
    // so we access to req.user
    const user=await User.findById(req.user?._id);
    const isPasswordCorrect=user.ispasswordcorrect(oldpassword)
    if(!isPasswordCorrect){
        throw new apierror(400,"invalid old password")
    }
    user.password=newpassword
    user.save({validateBeforeSave:false})
    res.status(200)
    .json(
        new apiresponse(200,{},"Password has been changed successfully")
    )
})

const getCurrentUser=asynchandler(async(req,res)=>{
    res.status(200)
    .json(new apiresponse(200,req.user,"Current User fetched"))
})

const updateUserDetails=asynchandler(async(req,res)=>{
    const {fullname,email}=req.body
    if(!email){
        throw new apierror(400,"email is missing")
    }
    const user=await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{fullname,email}
        },
        {
            new:true
        }
    )
    res.status(200)
    .json(new apiresponse(200,user,"User details updated"))
})

const updateUseravatar=asynchandler(async(req,res)=>{
    const avatarfilepath=req.file?.path
    if(!avatarfilepath){
        throw new apierror(400,"file path invalid")
    }
    const avatar=await cloudinaryfileupload(avatarfilepath)
    if(!avatar.url){
        throw new apierror(400,"Error while uploading avatar file")
    }
    const user=await User.findByIdAndUpdate(req.user?._id,{
        $set:{avatar:avatar.url}
    },{
        new:true
    })
    res.status(200)
    .json(new apiresponse(200,user,"Avatar successfully changed"))

})
const updateUserCoverimage=asynchandler(async(req,res)=>{
    const coverimagefilepath=req.file?.path
    if(!coverimagefilepath){
        throw new apierror(400,"file path invalid")
    }
    const coverimage=await cloudinaryfileupload(coverimagefilepath)
    if(!coverimage.url){
        throw new apierror(400,"Error while uploading coverimage file")
    }
    const user=await User.findByIdAndUpdate(req.user?._id,{
        $set:{coverimage:coverimage.url}
    },{
        new:true
    })
    res.status(200)
    .json(new apiresponse(200,user,"Coverimage successfully changed"))

})

const deleteprevavtar=asynchandler(async(req,res)=>{
    const user=await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{avatar:""}
        },
        {
            new:true
        }
    )
})

const getUserChannelProfile=asynchandler(async(req,res)=>{
    const {username}=req.params
    if(!username?.trim()){
        throw new apierror(400,"Invalid username")
    }
    const channel=await User.aggregate([
        {
            $match:{username:username.toLowerCase()}
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"channeluser",
                as:"subscribers"
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"channelsubscribedto"
            }
        },
        {
            $addFields:{
                SubscriberCount:{
                    $size:"$subscribers"
                },
                channelSubscribedToCount:{
                    $size:"$channelsubscribedto"
                },
                isSubscribed:{
                    $cond:{
                        if:{$in:[new mongoose.Types.ObjectId(req.user?._id),"$subscribers.subscriber"]},
                        then:true,
                        else:false
                    }
                }
            }
        },
        {
            $project:{
                username:1,
                fullname:1,
                email:1,
                avatar:1,
                coverimage:1,
                isSubscribed:1,
                SubscriberCount:1,
                channelSubscribedToCount:1
            }
        }
    ])
    if(!channel?.length){
        throw new apierror(400,"Channel does not exist")
    }
    console.log(channel)
    const user=User.findById(req.user?._id)
    res.status(200)
    .json(new apiresponse(200,channel[0],"User channel fetched successfully"))
})

const getwatchhistory=asynchandler(async(req,res)=>{
    const user=await User.aggregate([
        {
            $match:{_id:new mongoose.Types.ObjectId(req.user?._id)}
        },
        {
            $lookup:{
                from:"videos",
                localField:"watchhistory",
                foreignField:"_id",
                as:"watchhistory",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        username:1,
                                        email:1,
                                        avatar:1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first:"$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])
    res.status(200)
    .json(new apiresponse(
        200,
        user[0].watchhistory,
        "Watch history fetched successfully"
    ))
})
export  {userRegister,userlogin,userLogout,refreshaccesstoken,updatepassword,
    updateUserCoverimage,updateUserDetails,updateUseravatar,
    deleteprevavtar,getCurrentUser,getUserChannelProfile,getwatchhistory}
