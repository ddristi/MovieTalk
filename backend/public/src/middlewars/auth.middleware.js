import {ApiError} from "../utils/ApiError.js"
import {asyncHandler} from "../utils/asynchandler.js"
import {User} from "../models/user.model.js"
import jwt from "jsonwebtoken"

export const verifyJWT = asyncHandler(async(req, _, next) => {


    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        
        console.log("🚀 verifyJWT hit");

         console.log("Token:", token);
       
        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
         console.log("Decoded token:", decodedToken);
        const user = await User.findById(decodedToken?.id).select("-password -refreshToken")
    
        if (!user) {
            
            throw new ApiError(401, "Invalid Access Token")
        }
    
        req.user = user;
        next()
    } catch (error) {
          console.error("JWT verification error:", error.message);
        throw new ApiError(401, error?.message || "Invalid access token")
    }
    
})