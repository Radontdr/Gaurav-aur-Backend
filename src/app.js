// we use app.use()  for config and middleware
// CORS_URL=8 in environment anyone can access my server 
import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
const app=express();

app.use(cors({
    origin:process.env.CORS_URL,
    credentials:true
}))
app.use(cookieParser());

// to handle data format recieved from the website front=end ,using middleware
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("Public")) 

import userroute from "./routes/users.route.js"
import videoRoute from"./routes/video.routes.js"
import commentRoute from "./routes/comments.route.js"
import likeRoute from "./routes/like.router.js"
import tweetRoute from "./routes/tweet.route.js"
import subscriptionRoute from "./routes/subscription.route.js"
import dashboardRoute from "./routes/dashboard.route.js"
import healthRoute from "./routes/healthcheck.router.js"
import playlistRoute from "./routes/playlist.router.js"
//since we have imported the route ,not written it here so we cannot directly use app.get ,we have use app.use 
app.use("/api/v1/users",userroute) // now control will go to register.router.js file
app.use("/api/v1/videos",videoRoute)
app.use("/api/v1/comments",commentRoute)
app.use("/api/v1/likes",likeRoute)
app.use("/api/v1/tweets",tweetRoute)
app.use("/api/v1/subscriptions",subscriptionRoute)
app.use("/api/v1/dasboard",dashboardRoute)
app.use("/api/v1/healthcheck",healthRoute)
app.use("/api/v1/playlist",playlistRoute)
// now  complete url will look like http//localhoast:8000/api/v1/users/register 
export default app;