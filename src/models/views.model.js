import mongoose from "mongoose";
const viewsSchema=new mongoose.Schema({
    videoId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Video",
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",

    },
    viewedAt:{
        type:Date,
        default:Date.now,
        required:true,

    }
},{timestamps:true})
export const View=mongoose.model("View",viewsSchema)