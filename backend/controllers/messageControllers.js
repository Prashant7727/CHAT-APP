const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

//@description     Get all Messages
//@route           GET /api/Message/:chatId
//@access          Protected
const allMessages = async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat");
      res.json({
        status: 200,
        message: "success",
        data: messages,
      });
  } catch (error) {
    res.status(400).json({ error: "error" });
  }
};

//@description     Create New Message
//@route           POST /api/Message/
//@access          Protected
const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  var newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };

  try {
    var message = await Message.create(newMessage);
    message = await Message.findById(message._id)
      .populate("sender")
      .populate("chat")
      .populate({
        path: "chat.users",
        select: "name pic email",
      })
      .exec();
  
    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });
  
    res.status(200).json({status:"message sent successfully"});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while sending the message" });
  }
  
});

module.exports = { allMessages, sendMessage };
