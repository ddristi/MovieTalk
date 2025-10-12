import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import User from "../models/user.model.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"
import asyncHandler from "../utils/asynchandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"

const generateAccessTokenAndRefreshToken = async(userId) =>{
    try {
        const user= await User.findById(userId)
        const accesstoken = user.generateAccessToken()
        const refreshtoken = user.generateRefreshToken()

        user.refreshToken = refreshtoken
        await user.save({validateBeforeSave:false})

        return {accesstoken, refreshtoken}
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens")
    }
}

const registerUser = asyncHandler(async(req,res) => {

    const {fullName, email, password, username} = req.body;

    if([fullName,email,password,username].some((fields) => fields?.trim ===() "")){
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or:[{username},{email}]
    })

    if(existedUser){
        throw new ApiError(409,"User with username or email already exists")
    }

    const profilePhotoLocalPath = req.files?.profilePhoto[0]?.path

    if(!profilePhotoLocalPath){
        throw new ApiError(400, "Profile photo is required")
    }

    const profilePhoto = await uploadOnCloudinary(profilePhotoLocalPath)

    const UploadedProfilePhoto ={
        url:profilePhoto.url,
        public_id:profilePhoto.public_id
    }

    const user = await User.create({
        username.toLowerCase(),
        fullName,
        profilePhoto: UploadedProfilePhoto,
        email,
        password
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

})


const loginUser = asyncHandler(async(req,res) =>{
    const {username,email, password} = req.body

    if(!(username || email){
        throw new ApiError(400, "username or email is required")
    })

    const user = await User.findOne({
        $or:[{username},{email}]
    })

    const isPasswordValid = await User.isPasswordCorrect(password)

    if (!isPasswordValid) {
    throw new ApiError(401, "Invalid Password")
    }

    const {accessToken, refreshToken} = await generateAccessTokenAndRefreshToken(user._id)
    const loggedinUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .cookie("accesstoken", accessToken, options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )
})

const logoutUser = asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset:{
                refreshToken: 1
            }
        },
        {
            new:true
        }
    )

    const options = {
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .clearCookie(accessToken,options)
    .clearCookie(refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {},
            "User logged out successfully"
        )
    )
})

const updatePassword = asyncHandler(async(req,res) =>{
    const {oldPassword,newPassword} = req.body
    
    const user = await User.findById(req.user?._id)
    const isCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isCorrect){
        throw new ApiError(400, "Wrong Password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave:false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))

})

const getUser = asyncHandler(async(req,res) =>{
    return res
    .status(200)
    .json{
        new ApiResponse(200, req.user, "User fetched Successfully")
    }
})

const updateProfile = asyncHandler(async(req, res) =>{
    const {fullName,email} = req.body

    if(!(fullName|| email)){
        throw new ApiError(400, "Atleast one fields are required")
    }
    
    
    const user = await User.findByIdAndUpdate(
        req.user?_id,
        {
            $set:{
                fullName: req.user?.fullName,
                email: email
            }
        },
        {
            new:true
        }
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"))
})

const updateProfilePhoto = asyncHandler(async(req,res) =>{

     const profilePhotoPath =req.file?.path;

     const user = await User.findById(req.user?._id)

     if(!user){
        throw new ApiError(404, "User not found")
     }

     if(user.profilePhoto?.public_id){
        try {
           await cloudinary.uploader.destroy(user.profilePhoto.public_id) 
        } catch (error) {
           throw new ApiError(400, "Error deleting old image") 
        }
     }
     
     if(!profilePhotoPath){
        throw new ApiError(400, "Upload the new Profile photo")
     }
     const updatedProfilePhoto = await uploadOnCloudinary(profilePhotoPath)

     const updatedUser = await User.findByIdAndUpdate(
        req.user?._id,
        {
         
         $set:{
            profilePhoto: {
                url:updatedProfilePhoto.url,
                public_id: updatedProfilePhoto.public_id

            }
        }
         
        },
        {
            new: true
        }
     ).select("-password")


     return res
     .status(200)
     .json(
        new ApiResponse(200, updatedUser, "Profile Photo updated successfully")
     )
})

const getPost = asyncHandler(async(req,res) => {
    const {username} = req.params

    if(!username?.trim()){
        throw new ApiError(400, "username is missing")
    }
    const post = await User.aggregate([

        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "posts",
                localField: "_id",
                foreignField: "postedBy",
                as: "posts"
            }
        },
        {
            $addFields:{
                postCount:{
                    $size: "$posts"
                }
            }
        },
        {
            $project:{
                fullName:1,
                username:1,
                postCount:1,
                profilePhoto:1,
                email:1,
                posts:1
            }
        }
    ])

    if(!post?.length){
        throw new ApiError(404, "User or Posts not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, post[0], "Posts fetched successfully")
    )
})

export {registerUser,
        loginUser,
        logoutUser,
        updatePassword,
        updateProfile,
        getUser,
        getPost,
        updateProfilePhoto
}

 

