//higher order function ,means fn as an argument to the fn
const asynchandler=(func)=>{
    (req,res,next)=>{
        Promise.resolve(func(req,res,next)).catch((error)=>next(error))
    }
}
export default asynchandler