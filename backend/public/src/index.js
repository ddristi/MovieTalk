import express from 'express'
import dotenv from "dotenv"
import mongoose from 'mongoose'
import {DB_NAME} from "./constants.js"
import connectDB from './db/index.js'
import {app} from "./app.js"
import path from 'path';
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



// manually load the root .env
const envPath = path.resolve(__dirname, "]789**+../../.env");
const result = dotenv.config({ path: envPath, override: true });

if (result.error) {
    console.error("❌ Failed to load .env from", envPath, result.error);
} else {
    console.log("✅ Loaded .env from", envPath);
}

// quick debug
console.log("MONGODB_URI =", process.env.MONGODB_URI);

//dotenv.config()

console.log("✅ Loaded MONGODB_URI:", process.env.MONGODB_URI);


app.get('/',(req,res) => {
    res.send('Server is ready');
});

const port = process.env.PORT || 8000;



connectDB()
.then(()=>{

  app.listen(port, ()=>{
    console.log(`Server is running at port: ${process.env.PORT}`);
    
  })
})
.catch((error)=>{
  console.log("MONGODB connection failed!!!",error);
  
})