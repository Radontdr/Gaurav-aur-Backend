import asynchandler from "../utils/asynchandlers.js"

const userRegister=asynchandler(async(req,res)=>{
    res.status(200).json({
        message:"OK"
    })
})

export default asynchandler
