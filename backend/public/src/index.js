import express from 'express'
import dotenv from "dotenv"
import mongoose from 'mongoose'
import {DB_NAME} from "./constants.js"
import connectDB from './db/index.js'
import {app} from "./app.js"
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, '../../../frontend')));

dotenv.config({
  path: "./.env"
})


app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, '../../../frontend/index.html'));
});


const port = process.env.PORT || 8000;



connectDB()
.then(()=>{

  app.listen(port, ()=>{
    console.log(`Server is running at port: ${process.env.PORT}`);
    console.log(`http://localhost:${process.env.PORT}`);
    
    
  })
})
.catch((error)=>{
  console.log("MONGODB connection failed!!!",error);
})