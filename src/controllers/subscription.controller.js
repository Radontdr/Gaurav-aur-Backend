import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import apierror from "../utils/apierror.js"
import apiresponse from "../utils/apiresponse.js"
import asynchandler from "../utils/asynchandlers.js"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"


const toggleSubscription = asynchandler(async (req, res) => {
    const {channelId} = req.params
    const {userId}=req.user
    // TODO: toggle subscription
    if(!channelId || !isValidObjectId(channelId)){
        throw new apierror(400,"Invalid channel id")
    }
    const existingSubcription=await Subscription.findOne({channeluser:channelId,subscriber:userId})
    if(!existingSubcription){
        const newSubscription=await Subscription.create({
            channeluser:channelId,
            subscriber:userId
        })
        const subscription=await Subscription.findById(newSubscription._id)
        if(!subscription){
            throw new apierror(400,"Subscription failed")
        }
    }else{
        await Subscription.deleteOne({channeluser:channelId,subscriber:userId})
    }
    return res.status(200).json(new apiresponse(200,null,"Subscription Toggled"))
})

const getUserChannelSubscribers = asynchandler(async (req, res) => {
    //const {channelId} = req.params
    const {page=1,limit=10,sortType="asc",channelId}=req.query
    const pagenum=parseInt(page)
    const limitnum=parseInt(limit)
    const sortOrder=sortType==="asc"? 1:-1
    if(!channelId || !isValidObjectId(channelId)){
        throw new apierror(400,"Invalid channel id")
    }
    const subscriberquery=Subscription.aggregate([
        {
            $match:{channeluser:new mongoose.Types.ObjectId(channelId)}
        },
        {
            $sort:{
                createdAt:sortOrder
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"subscriber",
                foreignField:"_id",
                as:"subscriberDetails"
            }
        },// we will get a array containing the all user/subscriber details as objects
        /*{
            $unwind:"subscriberDetails"
        },*///unwind deconstructs the array of objects and make each object seperate and convert them in a individual document
        {
            $project:{
                subscriber:1,
                channeluser:1,
                createdAt:1,
                updatedAt:1,
                subscriberDetails:{"username":1,"email":1,"_id":1}
            }
        }
    ])
    if(!subscriberquery || await subscriberquery.length===0){
        throw new apierror(400,"Subscriber query empty")
    }
    const options={page:pagenum,limit:limitnum}
    const subscribers = await Subscription.aggregatePaginate(
        Subscription.aggregate([
            {
                $match: { channeluser: new mongoose.Types.ObjectId(channelId) }
            },
            {
                $sort: {
                    createdAt: sortOrder
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "subscriber",
                    foreignField: "_id",
                    as: "subscriberDetails"
                }
            },
            {
                $project: {
                    subscriber: 1,
                    channeluser: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    subscriberDetails: { username: 1, email: 1, _id: 1 }
                }
            }
        ]),
        options
    );
    return res.status(200).json(new apiresponse(200,subscribers,"subscribers fetched properly"))
})

const getSubscribedChannels = asynchandler(async (req, res) => {
    const { subscriberId } = req.params
    if(!subscriberId || !isValidObjectId(subscriberId)){
        throw new apierror(400,"Invalid channel id")
    }
    const subscribedquery=await Subscription.aggregate([
        {
            $match:{subscriber:new mongoose.Types.ObjectId(subscriberId)}
        },
        {
            $lookup:{
                from:"users",
                localField:"channeluser",
                foreignField:"_id",
                as:"channelDetails"
            }
        },
        { 
            $unwind: { 
                path: "$channelDetails", 
                preserveNullAndEmptyArrays: false 
            } 
        }, // Flatten array & remove empty results
        {
            $project:{
                subscriber:1,
                channeluser:1,
                createdAt:1,
                updatedAt:1,
                channelDetails:{"username":1,"email":1,"_id":1}
               
            }
        }
    ])
    if(!subscribedquery || subscribedquery?.length===0){
        throw new apierror(400,"Subscribed channels not found")
    }
    return res.status(200).json(new apiresponse(200,subscribedquery,"Subscribed channel found"))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}