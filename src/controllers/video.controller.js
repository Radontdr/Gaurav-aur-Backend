import mongoose,{isValidObjectId} from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import apierror from "../utils/apierror.js";
import apiresponse from "../utils/apiresponse.js";
import asynchandler from "../utils/asynchandlers.js";
import { cloudinaryfileupload } from "../utils/cloudinary.js";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import fs from "fs"
import Ffmpeg from "fluent-ffmpeg";
import path from "path"
import ffmpegPath from "ffmpeg-static";

const getVideoDuration = asynchandler(async (req, res, next) => {
    const Videopath = req.files?.video[0].path;
    
    if (!Videopath) {
        throw new apierror(400, "Path doesn't exist");
    }

    const Duration = await new Promise((resolve, reject) => {
        Ffmpeg.ffprobe(Videopath, (err, metadata) => {
            if (err) {
                return reject(new apierror(400, "Video path invalid"));
            }
            resolve(metadata.format.duration);
        });
    });

    return res.status(200).json(new apiresponse(200, { Duration }, "Duration of video fetched"));
    next()
});
const getallVidoes=asynchandler(async(req,res)=>{
    const{ page=1, limit=10, query, sortBy="CreatedAt", sortType="asc"}=req.query;
    const userId=req.user?._id;
    const pagenum=parseInt(page);
    const limitnum=parseInt(limit);
    const sortOrder=sortType==="asc" ? 1 : -1;

    const filter={};
    if(query){
        filter.$or=[
            {title:{$regex:query,$options:"i"}}, //options i means case insensitive
            {description:{$regex:query,$options:"i"}}
        ]
    }
    if(userId && isValidObjectId(userId)){
        filter.uploadedby=new mongoose.Types.ObjectId(userId);
    }
    const aggregatequery=Video.aggregate([
        {
            $match:filter
        },
        {
            $sort:{
                [sortBy]:sortOrder
            }
        }
    ])
    const result =await aggregatequery
    
    const options={page:pagenum , limit:limitnum};
    const AllVideos = await Video.aggregatePaginate(Video.aggregate([
        { $match: filter }, // ✅ Fix: Use a fresh aggregation pipeline
        { $sort: { [sortBy]: sortOrder } }
    ]), options);
    if (!AllVideos || AllVideos.docs.length === 0) {
        return res.status(200).json(new apiresponse(200, [], "No videos found"));
    }
    res.status(200).json(new apiresponse(200,AllVideos,"Succesfully got all the videos"))
})

const publishAVideo=asynchandler(async(req,res)=>{
    const {title,description}=req.body;
    const videopath=req.files?.video[0].path;
    const thumbnailpath=req.files?.thumbnail[0].path;
    if(!videopath || !thumbnailpath){
        throw new apierror(400,"Path doesn't exists")
    }
    const videoUpload=await cloudinaryfileupload(videopath);
    const thumbnailUpload=await cloudinaryfileupload(thumbnailpath);
    if(!videoUpload || !thumbnailUpload){
        throw new apierror(400,"Something went wrong")
    }
    try {
        await fs.promises.unlink(videopath);
        await fs.promises.unlink(thumbnailpath);
    } catch (error) {
        console.error("Error deleting files:", error);
    }
    const video=await Video.create({
        title,
        description,
        videofile:videoUpload.url,
        thumbnail:thumbnailUpload.url,

    })
    const uploadedVideo=await Video.findById(video._id);
    if(!uploadedVideo){
        throw new apierror(400,"Video not uploaded in db")
    }
    return res.status(200).json(new apiresponse(200,uploadedVideo,"Upload successfull"))
})

const getVideoById = asynchandler(async (req, res) => {
    const { videoId } = req.params;
    const video= await Video.aggregate([
        {
            $match:{_id:new  mongoose.Types.ObjectId(videoId)}
        },
        {
            $lookup:{
                from:"views",
                foreignField:"videoId",
                localField:"_id",
                as:"views"
            }
        },
        {
            $addFields:{
                viewCount:{$size:"$views"} //$ it is used with views to refer to the views array
            }
        },
        {
            $project:{
                views:0 // since we have counted the views so no need to display this array in result 
            }
        }
    ])
    if(!video || video.length===0){
        throw new apierror(404,"Video not found")
    }
    return res.status(200).json(new apiresponse(200,video,"Got the video successfully"))
})

const updateVideo=asynchandler(async(req,res)=>{
    const {videoId}=req.params;
    const {newTitle,newDescription}=req.body;
    const newThumbnailpath=req.file?.path;
    const newThumbnailUpload=await cloudinaryfileupload(newThumbnailpath);
    const newThumbnail=newThumbnailUpload?.url;
    const VideoID=new mongoose.Types.ObjectId(videoId)
    const video=await Video.findByIdAndUpdate(
        VideoID,
        {
            $set:{title:newTitle,description:newDescription,thumbnail:newThumbnail}
        },
        {
            new:true
        }
    )
    return res.status(200).json(new apiresponse(200,video,"Video Updated Successfully"))
})

const deleteVideo = asynchandler(async (req, res) => {
    const {videoId} = req.params
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new apierror(400, "Invalid video ID format");
    }
    const VideoID=new mongoose.Types.ObjectId(videoId)
    const video=await Video.findById(VideoID);
    if(!video){
        throw new apierror(500,"Video not found")
    }
    await video.deleteOne();
    return res.status(200).json(new apiresponse(200))
})

const togglePublishStatus = asynchandler(async (req, res) => {
    const { videoId } = req.params;
    const video=await Video.findById(videoId);
    if(!video){
        throw new apierror(404,"Video not found")
    }
    video.isPublished=!video.isPublished
    await video.save();
    return res.status(200).json(new apiresponse(200,video,"Toggled Publish Status"))
})

export {getallVidoes,publishAVideo,getVideoById,updateVideo,deleteVideo,togglePublishStatus,getVideoDuration}
