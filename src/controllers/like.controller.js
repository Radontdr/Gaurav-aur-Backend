import mongoose, {isValidObjectId} from "mongoose"
import {like} from "../models/like.model.js"
import apierror from "../utils/apierror.js"
import apiresponse from "../utils/apiresponse.js"
import asynchandler from "../utils/asynchandlers.js"

const toggleVideoLike = asynchandler(async (req, res) => {
    const {videoId} = req.params
    const {userId}=req.user
    if(!videoId || !isValidObjectId(videoId)){
        throw new apierror(400,"Video id not valid or not found")
    }
    if(!userId || !isValidObjectId(userId)){
        throw new apierror(400,"user id not valid or not found")
    }
    const existinglike=await like.findOne({videoId,userId})
    if(existinglike){
        await like.deleteOne({_id:existinglike._id})
        // or we can use await existinglike.delete();
        return res.status(200).json(new apiresponse(200,null,"Like removed"))
    }else{
        const newlike=await like.create({userId,videoId})
        return res.status(200).json(new apiresponse(200,newlike,"Like added"))
    }
})

const toggleCommentLike = asynchandler(async (req, res) => {
    const {commentId} = req.params
    if(!commentId || !isValidObjectId(commentId)){
        throw new apierror(400,"Comment id not valid")
    }
    const existinglike=await like.findOne({commentId})
    if(existinglike){
        await like.deleteOne({_id:existinglike._id})
        return res.status(200).json(new apiresponse(200,null,"Like removed from the comment"))
    }else{
        const newlike=await like.create({commentId})
        return res.status(200).json(new apiresponse(200,newlike," new Like added"))
    }
})

const toggleTweetLike = asynchandler(async (req, res) => {
    const {tweetId} = req.params
    if(!tweetId || !isValidObjectId(tweetId)){
        throw new apierror(400,"tweet id not valid")
    }
    const existinglike=await like.findOne({tweetId})
    if(existinglike){
        await like.deleteOne({_id:existinglike._id})
        return res.status(200).json(new apiresponse(200,null,"Like removed from the tweet"))
    }else{
        const newlike=await like.create({tweetId})
        return res.status(200).json(new apiresponse(200,newlike," new Like added"))
    }
})

const getLikedVideos = asynchandler(async (req, res) => {
    const {userId}=req.user
    if(!userId || !isValidObjectId(userId)){
        throw new apierror(400,"user id not valid or not found")
    }
    const likedVideos = await like.find({ userId, video: { $exists: true } }).populate('video');
    if (!likedVideos || likedVideos.length === 0) {
        throw new apierror(404, "No liked videos found");
    }
    const videos = likedVideos.map(like => like.video);
    return res.status(200).json(new apiresponse(200, videos, "Liked videos fetched successfully"));
})
export {toggleVideoLike,toggleCommentLike,toggleTweetLike,getLikedVideos}