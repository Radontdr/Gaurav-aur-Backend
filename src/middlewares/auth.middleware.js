import asynchandler from "../utils/asynchandlers.js"
import apierror from "../utils/apierror.js"
import jwt from "jsonwebtoken";
// here i have replaced res with "_" because it is not used anywhere
//next is here because we are using this as middleware once it completes it should forward to  other following function 
const verifyjwt=asynchandler(async(req,_,next)=>{
    try {
        const token=req.cookies?.AccessToken || req.header("Authorization")?.replace("Bearer ","");
        if(!token){
            throw new apierror(401,"Unauthorized request")
        }
    
        const validatedtoken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
        
        const user=await User.findById(validatedtoken?._id).select("-password","refreshtoken")
        if(!user){
            throw new apierror(401,"Invalid Acesstoken")
        }
        req.user=user;
        next()
    } catch (error) {
        throw new api(401,"Invalid Acesstoken")
    }
})
export {verifyjwt}