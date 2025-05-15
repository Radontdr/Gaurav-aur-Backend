import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import apierror from "../utils/apierror.js"
import apiresponse from "../utils/apiresponse.js"
import asynchandler from "../utils/asynchandlers.js"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const createTweet = asynchandler(async (req, res) => {
    const {content}=req.body
    const {userId}=req.params
    if(!userId || !isValidObjectId(userId)){
        throw new apierror(400,"User id  invalid")
    }
    if(!content){
        throw new apierror(409,"Content not found")
    }
    const newTweet=await Tweet.create({
        content:content,
        owner:userId
    })
    const tweet=await Tweet.findById(newTweet._id)
    if(!tweet){
        throw new apierror(400,"tweet not found")
    }
    return res.status(200).json(new apiresponse(200,tweet,"Tweet created successfully"))
})

const getUserTweets = asynchandler(async (req, res) => {
    // TODO: get user tweets
    const {page=1,limit=10,userId,sortType="asc"}=req.query;
    const pagenum=parseInt(page);
    const limitnum=parseInt(limit);
    const sortOrder=sortType==="asc"? 1:-1
    if(!userId || !isValidObjectId(userId)){
        throw new apierror(400,"User id  invalid")
    }
   const tweetAggregate=Tweet.aggregate([
    {
        $match:{owner:new mongoose.Types.ObjectId(userId)}
    },
    {
        $sort:{
            createdAt:sortOrder
        }
    }
   ])
   const options={page:pagenum,limit:limitnum}
   const userTweets=await Tweet.aggregatePaginate(tweetAggregate,options)
   return res.status(200).json(new apiresponse(200,userTweets,"Got User tweets"))
})

const updateTweet = asynchandler(async (req, res) => {
    //TODO: update tweet
    const {content}=req.body
    const {tweetId}=req.params;
    if(!tweetId || !isValidObjectId(tweetId)){
        throw new apierror(400,"Tweet id  invalid")
    }
    const tweet=await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set:{content}
        },
        {
            new:true
        }
    )
    if(!tweet){
        throw new apierror(400,"tweet not found")
    }
    return res.status(200).json(new apiresponse(200,tweet,"Tweet updated successfully"))
})

const deleteTweet = asynchandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId}=req.params;
    if(!tweetId || !isValidObjectId(tweetId)){
        throw new apierror(400,"Tweet id  invalid")
    }
    const tweet=await Tweet.findById(tweetId)
    if(!tweet){
        throw new apierror(400,"Tweet does not exists")
    }
    await Tweet.deleteOne({_id:tweetId})
    
    return res.status(200).json(new apiresponse(200,null,"Tweet deleted")) 
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}