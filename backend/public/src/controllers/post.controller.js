import {uploadOnCloudinary} from "../utils/cloudinary.js"
import Post from "../models/post.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asynchandler.js"
import mongoose from "mongoose"
import jwt from "jsonwebtoken"


const createPost =  asyncHandler(async(req,res) =>{
    
    const{title, description, rating, image} = req.body;

    if([title,description,rating].some((fields) => fields?.trim()=== "")){
        throw new ApiError(400, "All fields are required")
    }
    
    const imageLocalPath = req.files?.image[0]?.path

    const movieImagePath = await uploadOnCloudinary(imageLocalPath)

    const movieImage = {
        url:movieImagePath.url,
        public_id: movieImagePath.public_id
    }

    const post = Post.create({
        title,
        deescription,
        rating,
        movieImage : movieImage
    })

    const createdPost = await Post.findById(post._id)

    if(!createdPost){
        throw new ApiError(400, "Something went wrong while posting")
    }

    return res
    .status(200)
    .json( new ApiResponse(200, "Posted successfully"))

})

const updatePost = asyncHandler(async(req,res) =>{
    const {description} = req.body;

    if(!description) {
      throw new ApiError(400, "No change in description")
    }

    const post = await Post.findByIdAndUpdate({
        req.post?._id,
        {
            $set:{description}
        },
        {
            new:true
        }
    })

    return res
    .status(200)
    .json(
        new ApiResponse(200, "Post updated successfully")
    )
})

const deletePost = asyncHandler(async(req,res) =>{
    const post = await Post.findById(req.params._id)

    if(!post){
        throw new ApiError(404, "Post not found")
    }

    if(post.movieImage?.public_id){
      try {
           await cloudinary.uploader.destroy(post.movieImage.public_id) 
        } catch (error) {
           throw new ApiError(400, "Error deleting old image") 
      }
    }

    const deletedPost =await Post.findByIdAndDelete(post._id)

    if(!deletedPost){
        throw new ApiError(400, "Something went wrong while deleting")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, "Post deleted successfully")
    )
})