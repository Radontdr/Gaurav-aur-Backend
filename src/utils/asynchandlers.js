//higher order function ,means fn as an argument to the fn
const asynchandler=(func)=>{
    return (req,res,next)=>{
        Promise.resolve(func(req,res,next)).catch((error)=>{
            if(typeof next ==="function"){
                return next(error)
            }
        })
    }
}
export default asynchandler