import ConnectDB from "./db/database.js";
import app from "./app.js"
ConnectDB()
.then(()=>{
    app.listen(process.env.Port ||8000,()=>{
        console.log(`Server is running on port ${process.env.Port}`)
    });
})
.catch((error)=>{
    console.log(`Error!!! ${error}`)
});
