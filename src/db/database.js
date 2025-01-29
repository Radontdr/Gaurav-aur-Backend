import dotenv from "dotenv"
import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
dotenv.config({path:"../.env"});

//async function will return a object so be careful while handling the op 
const ConnectDB=async function(){
    try {
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
        console.log(`connection to the port ${process.env.Port} is successful`)
    } catch (error) {
        console.log("Error encountered",error)
        process.exit(1)
    }
};
export default ConnectDB;