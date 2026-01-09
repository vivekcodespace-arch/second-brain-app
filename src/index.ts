import express from "express"
import jwt from "jsonwebtoken"
import { ContentModel, LinkModel, UserModel } from "./db.js";
import { JWT_PASS } from "./config.js";
import { useMiddleware } from "./middleware.js";
import mongoose from "mongoose";
import cors from "cors"


const app = express();


app.use(cors())
app.use(express.json());

app.post("/api/v1/signup", async (req, res) => {
    const username = req.body.username;
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

app.post("/api/v1/brain/share", useMiddleware,async (req, res) => {
    const share = req.body.share;

    if(share){
        const hashed_link = Math.random().toString(36).substring(2,12)
        try{ 
            const found = await LinkModel.findOne({
                userId : req.userId
            })
            if(found){
                await LinkModel.deleteOne({
                    userId : req.userId
                })
            }

            await LinkModel.create({
                hash : hashed_link,
                userId : req.userId
            })
        }catch(err){
            return res.status(411).json({message: "Can't generate link"})
        }
       
        return res.status(200).json({
            shareLink : `Your brain sharing link is /api/v1/brain/share/${hashed_link}`
        })
    }else{
        try{
          await LinkModel.deleteOne({
            userId : req.userId
        })    
        }catch(err){
            return res.status(411).json({
                message: "Can't remove the share link"
            })
        }
        
        return res.json("Sharing link disabled")
    }
})

app.get("/api/v1/brain/:shareLink", async (req, res) => {
    const shareLink = req.params.shareLink

    const linkInstance = await LinkModel.findOne({
        hash : shareLink
    })

    if(linkInstance){
        const user = await UserModel.findOne({
            _id : linkInstance.userId
        })
        if(user){
            const content = await ContentModel.find({
                userId : user._id
            })
            return res.json({
                user :  user.username,
                content
            })
        }
    }
    else{
        return res.json({message: "Link not found"})
    }
    res.json({
        message: "Something went wrong."
    })
})

app.listen(3000, () => {
    console.log(`Server is running on port:3000`);
})