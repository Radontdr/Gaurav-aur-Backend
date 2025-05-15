import mongoose,{isValidObjectId} from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import apiresponse from "../utils/apiresponse.js";
import apierror from "../utils/apierror.js";
import asynchandler from "../utils/asynchandlers.js";
import { Video } from "../models/video.model.js";

const createPlaylist=asynchandler(async(req,res)=>{
    const {name,description}=req.body
    if(!name || !description){
        throw new Apierror(400,"Something is missing")
    }
    const existingPlaylist=await Playlist.findOne(name)
    if(existingPlaylist){
        throw new Apierror(409,"Playlist already exist")
    }
    const playlist=await Playlist.create({
        name,
        description,
        owner:req.user._id // use auth middleware to check whether im logged in  or not 
        // req.user will be accessible only after applying the auth middleware
    })
    const createdPlaylist=await Playlist.findById(playlist._id)
    if(!createPlaylist){
        throw new Apierror(400,"Playlist doesn't exists")
    }
    return res.status(200).json(new apiresponse(200,playlist,"Playlist Created Successfully"))
})

const getUserPlaylists = asynchandler(async (req, res) => {
    const {userId} = req.params
    if(!userId || !isValidObjectId(userId)){
        throw new Apierror(400,"Invalid User id")
    }
    const playlist=await Playlist.find({owner:userId})
    if(!playlist || playlist.length===0){
        throw new Apierror(400,"Playlist does not exist")
    }
    return res.status(200).json(new apiresponse(200,playlist,"User playlist fetched"))
})

const getPlaylistById = asynchandler(async (req, res) => {
    const {playlistId} = req.params
    if(!playlistId || !isValidObjectId(playlistId)){
        throw new Apierror(409,"Enter valid playlistId")
    }
    const playlist=await Playlist.findById(playlistId)
    if(!playlist){
        throw new Apierror(400,"Playlist not found")
    }
    return res.status(200).json(new apiresponse(200,playlist,"Playlist Found"))
})

const addVideoToPlaylist = asynchandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if(!videoId || !isValidObjectId(videoId)){
        throw new Apierror(400,"Invalid video id")
    }
    if(!playlistId || !isValidObjectId(playlistId)){
        throw new Apierror(400,"Invalid playlist id")
    }
    const playlist=await Playlist.findById(playlistId)
    if(!playlist){
        throw new Apierror(400,"Playlist doesn't exists")
    }
    const video=await Video.findById(videoId)
    if(!video){
        throw new Apierror(400,"Video doesn't exists")
    }

    if(!playlist.videos.includes(videoId)){
        playlist.videos.push(videoId)
        await playlist.save({validateBeforeSave:false})
    }
    else{
        throw new Apierror(400,"Video already in the playlist")
    }

    return res.status(200).json(new apiresponse(200,playlist,"Video added to playlist successfully"))

})

const removeVideoFromPlaylist = asynchandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if(!videoId || !isValidObjectId(videoId)){
        throw new Apierror(400,"Invalid video id")
    }
    if(!playlistId || !isValidObjectId(playlistId)){
        throw new Apierror(400,"Invalid playlist id")
    }
    const playlist=await Playlist.findById(playlistId)
    if(!playlist){
        throw new Apierror(404,"Playlist doesn't exists")
    }
    if(playlist.videos.includes(videoId)){
        playlist.videos.pull(videoId)
        await playlist.save({validateBeforeSave:false})
    }
    else{
        throw new Apierror(409,"Video does not exist in playlist")
    }
    return res.status(200).json(new apiresponse(200,playlist,"Video removed successfully"))
})

const deletePlaylist = asynchandler(async (req, res) => {
    const {playlistId} = req.params
    const playlist=await Playlist.findById(playlistId)
    if(!playlist){
        throw new Apierror(400,"Playlist not found")
    }
    await playlist.deleteone();
    return res.status(200).json(new apiresponse(200,message="playlist deleted successfully"))

})

const updatePlaylist = asynchandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    if(!playlistId || !isValidObjectId(playlistId)){
        throw new Apierror(400,"Playlist id not valid")
    }
    const playlist=await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set:{name,description}
        },
        {
            new:true
        }
    )
    if(!playlist){
        throw new Apierror(404,"Playlist does not exist")
    }
    return res.status(200).json(new apiresponse(200,playlist,"Playlist updated"))
})

export {createPlaylist,getUserPlaylists,getPlaylistById,addVideoToPlaylist,
    removeVideoFromPlaylist,deletePlaylist,updatePlaylist}