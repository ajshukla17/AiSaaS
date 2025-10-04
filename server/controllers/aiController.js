import OpenAI from "openai";
import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";
import axios from "axios";
import { v2 as cloudinary } from 'cloudinary';
import FormData from "form-data";
import fs from 'fs'
import { PDFDocument } from "pdf-lib";
import multer from "multer";



const AI = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});


export const generateArticle = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { prompt, length } = req.body;
        const plan = req.plan
        const free_usage = req.free_usage

        if (plan !== 'premium' && free_usage >= 10) {
            return res.json({ success: false, message: 'Limit reached. Upgrade to continue.' });
        }

        const response = await AI.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: length,
        });

        const content = response.choices[0].message.content;

        await sql`insert into creations (user_id, prompt, content, type) values (${userId}, ${prompt}, ${content}, 'article')`;

        if (plan !== 'premium') {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: { free_usage: free_usage + 1 }
            });
        }

        res.json({ success: true, content });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export const generateBlogTitle = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { prompt } = req.body;
        const plan = req.plan
        const free_usage = req.free_usage

        if (plan !== 'premium' && free_usage >= 10) {
            return res.json({ success: false, message: 'Limit reached. Upgrade to continue.' });
        }

        const response = await AI.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 100,
        });

        const content = response.choices[0].message.content;

        await sql`insert into creations (user_id, prompt, content, type) values (${userId}, ${prompt}, ${content}, 'blog-title')`;

        if (plan !== 'premium') {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: { free_usage: free_usage + 1 }
            });
        }

        res.json({ success: true, content });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};


export const generateImage = async (req, res) => {
    try {

        const {userId} =req.auth();
        const {prompt , publish} =req.body    
        const plan = req.plan;


        if (plan !== 'premium') {
            return res.json({ 
                success: false, 
                message: 'This feature is only available for premium subscriptions' 
            });
        }

       

        // Create form data for ClipDrop API
        const formData = new FormData();
        formData.append('prompt', prompt);

     

        // Call ClipDrop API
        const { data } = await axios.post(
            'https://clipdrop-api.co/text-to-image/v1', 
            formData, 
            {
                headers: { 
                    'x-api-key': process.env.CLIPDROP_API_KEY,  
                },
                responseType: "arraybuffer"
            }
        );

        console.log('Image generated from ClipDrop');

        // Convert to base64
        const base64Image = `data:image/png;base64,${Buffer.from(data, 'binary').toString('base64')}`;

        

        // Upload to Cloudinary
        const { secure_url } = await cloudinary.uploader.upload(base64Image, {
            folder: 'ai-generated-images',
            resource_type: 'image'
        });

        console.log('Uploaded to Cloudinary:', secure_url);

        // Save to database
        await sql`
            insert into creations (user_id, prompt, content, type, publish) 
            values (${userId}, ${prompt}, ${secure_url}, 'image', ${publish ?? false})
        `;

        console.log('Saved to database');

        res.json({ success: true, content: secure_url });

    } catch (error) {
        console.log(error.message);
        res.json({succes: false, message:error.message})
    }   
}; 

export const removeImageBackground = async (req, res) => {
    try {

        const {userId} =req.auth();
        const image  =req.file;    
        const plan = req.plan;


        if (plan !== 'premium') {
            return res.json({ 
                success: false, 
                message: 'This feature is only available for premium subscriptions' 
            });
        }

        const { secure_url } = await cloudinary.uploader.upload(image.path ,{
            transformation: [
                {
                    effect:'background_removal',
                    background_removal: "remove_the_background"
                }
            ]
        });

        // Save to database
        await sql`
            insert into creations (user_id, prompt, content, type) 
            values (${userId}, 'Remove background from image', ${secure_url}, 'image')
        `;


        res.json({ success: true, content: secure_url });

    } catch (error) {
        console.log(error.message);
        res.json({succes: false, message:error.message})
    }   
};

export const removeImageObject = async (req, res) => {
    try {

        const {userId} =req.auth();
        const {object} =req.body;
        const image =req.file;    
        const plan = req.plan;


        if (plan !== 'premium') {
            return res.json({ 
                success: false, 
                message: 'This feature is only available for premium subscriptions' 
            });
        }

    

        

       
        const { public_id} = await cloudinary.uploader.upload(image.path);

        const imageurl =cloudinary.url(public_id, {
            transformation: [{effect: `gen_remove:${object}`}],
            resource_type: 'image'
        })

        // Save to database
        await sql`
            insert into creations (user_id, prompt, content, type) 
            values (${userId}, ${`Removed ${object} from image`}, ${imageurl}, 'image')
        `;


        res.json({ success: true, content: imageurl });

    } catch (error) {
        console.log(error.message);
        res.json({succes: false, message:error.message})
    }   
};

export const reviewResume = async (req, res) => {
    try {

        const {userId} =req.auth();
        const resume  =req.file;    
        const plan = req.plan;

       console.log(req.file);
        if (plan !== 'premium') {
            return res.json({ 
                success: false, 
                message: 'This feature is only available for premium subscriptions' 
            });
        }

       if(resume.size > 5 * 1024 * 1024){
        return res.json({success: false , message: "Resume file size exceeds allowed size (5MB)."})
       }

       const dataBuffer = fs.readFileSync(resume.path)
       const pdfData = await PDFDocument.load(dataBuffer)

       const prompt = `Review the following resume and provide constructive feedback on its strengths, weeknesses, and areas for improvement.Resume
       content:\n\n${pdfData.text}`

       const response = await AI.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 1000,
        });

        const content = response.choices[0].message.content;

        // Save to database
        await sql`
            insert into creations (user_id, prompt, content, type) 
            values (${userId}, 'Review the uploaded resume', ${content}, 'resume-review')
        `;


        res.json({ success: true, content });

    } catch (error) {
        console.log(error.message);
        res.json({succes: false, message:error.message})
    }   
};