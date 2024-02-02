import { Novu, ChatProviderIdEnum } from "@novu/node";
import User from "../models/User.js";

const novu = new Novu(process.env.NOVU_API_KEY);
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

export const addSubscriber = async (req, res) => {
  try {
    const { name, email, uid } = req.decodedToken;
    
    // Create a subscriber
    await novu.subscribers.identify(uid, {
      email,
      firstName: name,
    });

    await novu.subscribers.setCredentials(uid, ChatProviderIdEnum.Discord, {
      webhookUrl: DISCORD_WEBHOOK_URL,
    });

    return res.status(201).json(req.body);
  }
  catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const deleteSubscriber = async (req, res) => {
  try {
    const { uid } = req.decodedToken;
    await novu.subscribers.delete(uid);
    return res.status(200).json({ message: "Subscriber deleted successfully" });
  }
  catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

export const createTopic = async (req, res) => {
  try {
    const { key, name } = req.body;
    const response = await novu.topics.create({
      key,
      name,
    });
    console.log(response);
    return res.status(201).json({ message: "Topic created successfully" });
  }
  catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

export const addSubscriberToTopic = async (req, res) => {
  try {
    const { uid } = req.decodedToken;
    const { topicKey } = req.body;
    const result = await novu.topics.get(topicKey);
    if (!result) {
      return res.status(404).json({ message: "Topic not found" });
    }
    const response = await novu.topics.addSubscribers(topicKey, {
      subscribers: [uid],
    });
    console.log(response);
    return res.status(201).json({ message: "Subscriber added to topic successfully" });
  }
  catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

export const removeSubscriberFromTopic = async (req, res) => {
  try {
    const { uid } = req.decodedToken;
    const { topicKey } = req.body;
    const result = await novu.topics.get(topicKey);
    if (!result) {
      return res.status(404).json({ message: "Topic not found" });
    }
    const response = await novu.topics.removeSubscribers(topicKey, {
      subscribers: [uid],
    });
    console.log(response);
    return res.status(200).json({ message: "Subscriber removed from topic successfully" });
  }
  catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
}


export const updateDeviceID = async (req, res) => {
  try {
    console.log("updateDeviceID");
    const userId = req.decodedToken.uid;
    const user = await User.findOne({ uid: userId });
    console.log("user", user);
    const { name, email } = user;

    const { deviceID } = req.body;
    // Create a subscriber
    await novu.subscribers.identify(userId, {
      email,
      firstName: name,
    });

    // Set FCM device token for the subscriber
    // await novu.subscribers.setCredentials(userId, PushProviderIdEnum.FCM, {
    //   deviceTokens: deviceID,
    // });
    await novu.subscribers.setCredentials(userId, ChatProviderIdEnum.Discord, {
      webhookUrl: "https://discord.com/api/webhooks/1202543150716162119/1cAqL2Vmd6H-k87TcD1LiBDNw5oCGBmrVJQgh9ULykdo96EMl7myo0ufXAnKqTVz4XHh",
    });

    return res.status(200).json(req.body);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
