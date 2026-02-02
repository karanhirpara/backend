import {uploadOnCloudinary} from "../../utils/cloudinary.js"
import mongoose from "mongoose";

import {Event} from "../../model/event.js"

export const createevent = async (req: any, res: any) => {
  const { title, description, date, time, venue,category} = req.body;
 console.log({
  date: req.body.date,
  time: req.body.time
});
  if (!req.file) {
    return res.status(400).json({ error: "Image not uploaded" });
  }

  const imagepath = req.file.path;
  console.log("imagepath",imagepath)  
  const uploadResult = await uploadOnCloudinary(imagepath);

  if (!uploadResult?.secure_url) {
    return res.status(500).json({ error: "Image upload failed" });
  }

  const event = await Event.create({
    title,
    description,
    Date: date,
    Time:time,
    venue,
    category,
    image: uploadResult.secure_url ,// ✅ string
    host: req.user._id
  });

  res.status(201).json({ success: true, data: event });
};

export const getAllEvents = async (req: any, res: any) => {
  
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getEventById = async (req: any, res: any) => {
  
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong 2" });
  }
};

export const getEventByHost = async (req: any, res: any) => {
  try {
    const hostId = req.user._id;

    const events = await Event.find({ host: hostId });

    res.status(200).json(events); // always array
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};
// controllers/event.controller.ts
export const deleteEventById = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    
    await Event.findByIdAndDelete(id);

    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete event' });
  }
};
