import { appendFile } from 'fs';
import mongoose, { Document, Schema } from 'mongoose';
export interface Problem {
  id: string
}

export interface Event extends Document  {
  image: string
  id: string;
  title: string;
  description: string;
  Date: string; 
  Time: string;
  venue: string;
 category: string,
  host:mongoose.Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
const EventSchema = new Schema<Event>({

  image:{
    type: String,
    required: true,
    trim: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxLength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxLength: 5000
  },
  Date: {
    type: String,
    required: true
  },
 
  Time: {
    type: String,
    required: true
  },
  venue:{
    type: String,
    required: true
   },
   category: {
    type: String,
    required: true
   },
   
     host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});





 
export const Event = mongoose.model<Event>('Event', EventSchema);
// models/Contest.ts

