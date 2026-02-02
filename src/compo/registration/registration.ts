import Registration from "../../model/registration.js";
import mongoose from "mongoose";

export const registerForEvent = async (req: any, res: any) => {
  try {
    const userId = req.user._id;
    const { eventId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: "Invalid event id" });
    }

    // check duplicate registration
    const alreadyRegistered = await Registration.findOne({
      user: userId,
      event: eventId,
    });

    if (alreadyRegistered) {
      return res.status(409).json({ message: "User already registered" });
    }

    const registration = await Registration.create({
      user: userId,
      event: eventId,
    });

    return res.status(201).json({
      message: "Registration successful",
      registration,
    });

  } catch (error) {
    return res.status(500).json({
      message: "Registration failed",
    
    });
  }
};

export const checkRegistration = async (req: any, res: any) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    console.log(req.params);
    const registered = await Registration.exists({
      user: userId,
      event: id,
    });
     
    res.status(200).json({ registered: Boolean(registered) });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};


export const cancelRegistration = async (req: any, res: any) => {
  try {
    const userId = req.user._id;
    const {id} = req.params;

    
    const deleted =  await Registration.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        message: "Registration not found",
      });
    }

    return res.status(200).json({
      message: "Registration cancelled successfully",
    });

  } catch (error: any) {
    return res.status(500).json({
      message: "Failed to cancel registration",
      error: error.message,
    });
  }
};


export const getAllRegistrations = async (req: any, res: any) => {
  try {
    const userId = req.user._id;

    const registrations = await Registration.find({ user: userId })
    res.status(200).json({
      count: registrations.length,
      registrations,
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};
