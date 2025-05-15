import mongoose,{isValidObjectId} from "mongoose"
import {Comment} from "../models/comment.model.js"
import apierror from "../utils/apierror.js"
import apiresponse from "../utils/apiresponse.js"
import asynchandler from "../utils/asynchandlers.js"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const getVideoComments = asynchandler(async (req, res) => {
    const {page = 1, limit = 10,sortSeq="asc",videoId} = req.query
    if(!videoId || !isValidObjectId(videoId)){
        throw new apierror(400,"Video id invalid")
    }
    const pagenum=parseInt(page)
    const limitnum=parseInt(limit) 
    const sortOrder=sortSeq==="asc"? 1:-1
    const commentAggregate=Comment.aggregate([
        {
            $match:{video:new mongoose.Types.ObjectId(videoId)}
        },
        {
            $sort:{
                createdAt:sortOrder
            }
        }
    ])
    const options={page:pagenum,limit:limitnum}
    const comment=await Comment.aggregatePaginate(commentAggregate,options)
    console.log(comment)
    return res.status(200).json(new apiresponse(200,comment,"Fetched all comments of the video"))

})

const addComment = asynchandler(async (req, res) => {
    const { videoId } = req.params;
    const { content } = req.body;
    const userId = req.user._id; // Assuming you have user information in req.user

    if (!videoId || !isValidObjectId(videoId)) {
        throw new apierror(400, "Video ID is invalid");
    }
    if (!content || content.trim() === "") {
        throw new apierror(400, "Content is required");
    }
    const newComment = await Comment.create({
        video:videoId,
        owner:userId,
        content:content
    });
    return res.status(201).json(new apiresponse(201, newComment, "Comment added successfully"));
})

const updateComment = asynchandler(async (req, res) => {
    // TODO: update a comment
    const {content}=req.body
    const {commentId}=req.params
    if(!commentId || !isValidObjectId(commentId)){
        throw new apierror(400,"Invalid comment id")
    }
    const comment=await Comment.findByIdAndUpdate(
        commentId,
        {
            $set:{
                content:content
            }
        },
        {
            new:true
        }
    )
    if(!comment){
        throw new apierror(409,"Comment does not exists")
    }
    return res.status(200).json(new apiresponse(200,comment,"Comment updated scuccessfully"))
})

const deleteComment = asynchandler(async (req, res) => {
    const {commentId}=req.params
    if(!commentId || !isValidObjectId(commentId)){
        throw new apierror(400,"Invalid comment id")
    }
    const comment=await Comment.findById(commentId)
    if(!comment){
        throw new apierror(409,"Comment does not exists")
    }
    //comment.remove();  works on the instance and deletes data from database
    //while deleteone is used on actual model
    await Comment.deleteOne({_id:new mongoose.Types.ObjectId(commentId)})
    return res.status(200).json(new apiresponse(200,null,"Comment deleted"))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }