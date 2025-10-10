import mongoose, {Schema} from "mongoose"

const postSchema = new Schema(
    {
        title:{
           type: String,
           required: true,
           trim: true
        },
        movieImage:{
           type: String,
           required: true,
        },
        description:{
           type: String,
           required: true,
           trim: true
        },
        rating:{
           type: Number,
           required: true,
           min: 1,
           max: 5
        },
        postedBy:{
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: true
    }
)

export const Post = mongoose.model("Post", postSchema)