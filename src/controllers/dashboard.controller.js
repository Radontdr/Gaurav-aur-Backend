import mongoose, { mongo } from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {like} from "../models/like.model.js"
import apierror from "../utils/apierror.js"
import apiresponse from "../utils/apiresponse.js"
import asynchandler from "../utils/asynchandlers.js"

const getChannelStats = asynchandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    //here count can be used but since we do have to count no of views and likes with no of videos so we used $group ,
    //due to which we can do all in same query ,if we use count we would require different query for views and likes
    const {channelId}=req.params
    if(!channelId || !isValidObjectId(channelId)){
        throw new apierror(400,"Invalid channel id")
    }
    const channelVideoStats=await Video.aggregate([
        {
            $match:{owner:new mongoose.Types.ObjectId(channelId)}
        },
        {
            $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"video",
                as:"videoLikes"
            }
        },
        {
            $group:{
                _id:null,
                totalVideos:{$sum:1},
                totalViews:{$sum:"$views"},
                totalLikes:{$sum:{$size:"$videoLikes"}}
            }
        }
    ])
    const channelSubcriptionStats=await User.aggregate([
        {
            $match:{channeluser:new mongoose.Types.ObjectId(channelId)}
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"channeluser",
                as:"subscriber"
            }
        },
        {
            $addFields:{
                subscribersCount:{$size:"$subscriber"}
            }
        }
    ])
})

const getChannelVideos = asynchandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const {channelId}=req.params
    if(!channelId || !isValidObjectId(channelId)){
        throw new apierror(400,"Invalid channel id")
    }
    const videos=await Video.find({owner:channelId}).select("title","description",
        "videofile","createdAt","updatedAt");
    
    if(!videos || videos.length===0){
        throw new apierror(400,"Channel videos not found")
    }
    return res.status(200).json(new apiresponse(200,videos,"Videos found successfully"))
    
})

export {
    getChannelStats, 
    getChannelVideos
}