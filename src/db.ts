import mongoose , {model, Schema} from "mongoose"
import { JWT_PASS } from "./config.js";

mongoose.connect("mongodb://localhost:27017/Brainly")
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ Connection error:", err));

const UserSchema = new Schema({
    username : {type: String, unique: true},
    password: String
})

export const UserModel = model("Users", UserSchema);

const ContentModelSchema = new Schema({
    title: String,
    link: String,
    type: String,
    tags : [{type: mongoose.Types.ObjectId, ref:'Tag'}],
    userId: {type: mongoose.Types.ObjectId,ref:"Users",required: true}
})

export const ContentModel = model("content", ContentModelSchema);
{}
const LinkSchema = new Schema({
  hash: String,
  userId : {
    type: mongoose.Types.ObjectId,
    ref:"Users",
    required: true
  }
})

export const LinkModel = model("Link" , LinkSchema);



