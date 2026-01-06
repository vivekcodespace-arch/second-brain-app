import express from "express"
import jwt from "jsonwebtoken"
import { ContentModel, UserModel } from "./db.js";
import { JWT_PASS } from "./config.js";
import { useMiddleware } from "./middleware.js";
import mongoose from "mongoose";

const app = express();
app.use(express.json());


app.post("/api/v1/signup", async (req, res) => {
    const username = req.body.usernmae;
    const password = req.body.password;
    try {
        await UserModel.create({
            username: username,
            password: password
        })
        res.json({
            message: "User signed up"
        })
    } catch (e) {
        res.status(411).json({
            message: "User already exists."
        })
    }

});

app.post("/api/v1/signin", async (req, res) => {
    const username = req.body.usernmae;
    const password = req.body.password;

    const existingUser = await UserModel.findOne({
        username,
        password
    })
    if(existingUser){
        const token = jwt.sign({
            id: existingUser._id
        },JWT_PASS)

        res.json({
            token
        })
    }else{
        res.status(403).json({
            message: "Invalid Credential"
        })
    }
})

app.post("/api/v1/content",useMiddleware,  async (req, res) => {
    const link = req.body.link;
    const title = req.body.title;
    if(!req.userId){
        return res.status(401).json({ message: "Unauthorized.."})
    }
    await ContentModel.create({
        title,
        link, 
        userId: new mongoose.Types.ObjectId(req.userId),
        tags: []
    })
    res.json({
        message: "Content added"
    })

})

app.get("/api/v1/content",useMiddleware, async (req, res) => {
    const userId = req.userId;
    // console.log(userId);
    
    const contentIds = await ContentModel
        .find({userId:new mongoose.Types.ObjectId(userId)})
        .distinct("_id");
        
    res.json({contentIds});
})

app.delete("/api/v1",useMiddleware, async (req, res) => {
    const _id = new mongoose.Types.ObjectId(req.body.contentId);
    const result = await ContentModel.deleteMany({
        _id,
        userId : new mongoose.Types.ObjectId(req.userId)
    })
    // console.log(content);
    if(result.deletedCount === 0){
        return res.status(404).json({message:"content not found or auth error"})
    }
    res.json({
        messag:"Deleted successfully!"  
    })
})

app.post("/api/v1/brain/share", (req, res) => {

})

app.get("/api/v1/brain/:shareLink", (req, res) => {

})

app.listen(3000, () => {
    console.log(`Server is running on port:3000`);
})