import express from 'express'
import 'dotenv/config';
import {connectDB} from './conectdb/dbconect.js'

import {Event} from './model/event.js'
import{createevent} from './compo/eventhandling/event.js'
import {verifyuser} from './middleware/auth.js'

import cookieParser from 'cookie-parser';
import cors from 'cors';
import userregistration from './compo/user/registration.controllers.js'
import userlogin from './compo/user/login.js'
import main from "./conectdb/dbconect.js";
import { upload } from './middleware/multer.js';
import{getAllEvents,getEventById,getEventByHost, deleteEventById} from './compo/eventhandling/event.js'
import {registerForEvent,checkRegistration,cancelRegistration,getAllRegistrations} from './compo/registration/registration.js'
const port = Number(process.env.PORT) || 3000
const app = express()
app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded());
app.use(express.static("public"));
app.use(cookieParser());
app.use(cors({ origin:[ "http://localhost:8080", 
      "https://frontend-eight-vert-tgiv7r192a.vercel.app"],// your frontend URL
  credentials: true,    }));
import http from 'http';
const server = http.createServer(app);
console.log("port",port)
await connectDB();


// app.post('/fun',async(req,res)=>{
//   try {
//     await test();
//     res.json({
//       data:2
//   })
//   } catch (error) {
//     console.error('Error fetching problems:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching problems'
//     });
//   }
// })

app.post('/event/create',verifyuser,
   upload.single("image"),
       createevent
    );
app.get("/events", getAllEvents);
app.get("/event/:id", getEventById);
app.post('/user/registration',userregistration);
app.post('/user/login',userlogin);
app.get('/events/host', verifyuser,getEventByHost);
app.delete('/eventdelete/:id', deleteEventById);

app.post('/eventregistion',verifyuser,registerForEvent);
app.get('/registrationcheck/:id',verifyuser,checkRegistration)
app.delete('/registrationcancel/:id',verifyuser,cancelRegistration)
app.get("/allregistration",verifyuser,getAllRegistrations)

server.listen(port,()=>console.log("port 3000"));
