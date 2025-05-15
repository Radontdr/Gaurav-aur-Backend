import apierror from "../utils/apierror.js"
import apiresponse from "../utils/apiresponse.js"
import asynchandler from "../utils/asynchandlers.js"

const healthcheck = asynchandler(async (req, res) => {
    //TODO: build a healthcheck response that simply returns the OK status as json with a message
    return res.status(200).json({
        success:true,
        message:"Server is running fine",
        timestamp:new Date().toISOString(),
        uptime:process.uptime()
    })
})

export {
    healthcheck
}
