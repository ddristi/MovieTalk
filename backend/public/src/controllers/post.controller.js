
const createPost =  asyncHandler(async(req,res) =>{
    
    const{title, description, rating, image} = req.body;

    if([title,description,rating].some((fields) => fields?.trim()=== "")){
        throw new ApiError(400, "All fields are required")
    }
    
    const imageLocalPath = req.files?.image[0]?.path

    const movieImage = await uploadOnCloudinary(imageLocalPath)

    const post = Post.create({
        title,
        deescription,
        rating,
        movieImage
    })

    const createdPost = await Post.findById(post._id)

    if(!createdPost){
        throw new ApiError(400, "Something went wrong while posting")
    }

    return res
    .status(200)
    .json( new ApiResponse(200, "Posted successfully"))

})