import express from 'express'
import dotenv from "dotenv"
import mongoose from 'mongoose'
import {DB_NAME} from "./constants.js"
import connectDB from './db/index.js'

dotenv.config({
    path: './.env'
})

const app = express();

app.get('/',(req,res) => {
    res.send('Server is ready');
});

const port = process.env.PORT || 3000;



connectDB()
.then(()=>{

  app.listen(process.env.PORT || 8000, ()=>{
    console.log(`Server is running at port: ${process.env.PORT}`);
    
  })
})
.catch((error)=>{
  console.log("MONGODB connection failed!!!",error);
  
})