import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {Post} from "../models/post.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asynchandler.js"
import mongoose, {isValidObjectId} from "mongoose"
import jwt from "jsonwebtoken"
import {v2 as cloudinary} from "cloudinary"


const createPost =  asyncHandler(async(req,res) =>{
    
    const{title, description, rating, image} = req.body;

    if([title,description,rating].some((fields) => fields?.trim()=== "")){
        throw new ApiError(400, "All fields are required")
    }
    
    if(!req.file){
        throw new ApiError(400, "Movie image is required")
    }
    const imageLocalPath = req.file?.path

    const movieImagePath = await uploadOnCloudinary(imageLocalPath)

    const movieImage = {
        url:movieImagePath.secure_url,
        public_id: movieImagePath.public_id
    }

    const post = await Post.create({
        title,
        description,
        rating: Number(rating),
        movieImage : movieImage,
        postedBy:req.user?._id
    })

    const createdPost = await Post.findById(post._id)

    if(!createdPost){
        throw new ApiError(400, "Something went wrong while posting")
    }

    return res
    .status(200)
    .json( new ApiResponse(200,createdPost, "Posted successfully"))

})

const updatePost = asyncHandler(async(req,res) =>{
    const {description} = req.body;

    if(!description) {
      throw new ApiError(400, "No description found")
    }
    const postId = req.params.id

    const post = await Post.findById(postId)

    if(!post){
        throw new ApiError(403,"Post not found")
    }

    if(post.postedBy.toString() !== req.user._id.toString()){
        throw new ApiError(403, "Unauthorized Access")
    }
    const updatedPost = await Post.findByIdAndUpdate(
        postId,
        {
            $set:{description}
        },
        {
            new:true
        }
    )

    if(!updatedPost){
        throw new ApiError(400, "Something went wrong while updating the post")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, "Post updated successfully")
    )
})

const deletePost = asyncHandler(async(req,res) =>{


    const post = await Post.findById(req.params.id)
    
    
    if(post.postedBy.toString() !== req.user._id.toString()){
        throw new ApiError(403, "Unauthorized Access")
    }


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

const getAllPost = asyncHandler(async(req,res) =>{
   let { page = 1, limit = 10, query = "", sortBy = "createdAt", sortType = "desc", userId } = req.query
   
   page = parseInt(page)
   limit = parseInt(limit)

   const skip = (page-1) * limit;
   
   const filter = {}

   if(query){
    filter.$or =[
        {title: {$regex:query, $options:"i"}},
        { description: { $regex: query, $options: "i" } }
    ]
   }

   if(userId){
    filter.user=userId
   }

   const sort = {}
   sort[sortBy] = sortType === "asc"? 1: -1;

   const totalPosts = await Post.countDocuments(filter);

   if(skip >= totalPosts && totalPosts > 0){
    throw new ApiError(400, "No more posts")
   }

   const posts = await Post.find(filter)
                           .populate("postedBy", "username profilePhoto")
                           .sort(sort)
                           .skip(skip)
                           .limit(limit)

   return res
    .status(200)
    .json(
      new ApiResponse(200, 
        {
          total: totalPosts,
          page,
          limit,
          posts
        },
        "Posts fetched successfully"
      )
    )

})

const getPostbyId = asyncHandler(async(req,res) =>{

    const post = await Post.findById(req.params.id)

    if(!post){
        throw new ApiError(404, "Post not found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, {post}, "Post fetched successfully"))
})

const getMyPosts = asyncHandler(async (req, res) => {
    const userId = req.user?._id;

    if (!userId) {
        throw new ApiError(401, "User not authenticated");
    }

    const myPosts = await Post.find({ postedBy: userId }).sort({ createdAt: -1 });

    console.log("Current user:", req.user);
    console.log("Fetched posts:", myPosts);


    return res
        .status(200)
        .json(new ApiResponse(200, {posts: myPosts}, "User's posts fetched successfully"));
});


export {createPost,
        updatePost,
        deletePost,
        getAllPost,
        getPostbyId,
        getMyPosts
}