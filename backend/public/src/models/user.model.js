import mongoose,{Schema} from "mongoose"

const userSchema = new Schema(
{
    username:{
        type: String,
        unique:true,
        required:true,
        trim: true,
        index: true,
        lowercase:true
    },
    email:{
        type: String,
        unique:true,
        required:true,
        trim: true,
        lowercase:true
    },
    password:{
        type: String,
        required:[true, "Password is required"]
    },
    profilephoto:{
        type: String, // url
        required: true
    },
    fullName:{
        type:String,
        required:true,
        trim: true,
        index: true, 
    },
    posts: [
        {
            type: Schema.Types.ObjectId,
            ref: "Post"
        }
    ]
},{
    timestamps: true
}
)

export const User = mongoose.model("User", userSchema)