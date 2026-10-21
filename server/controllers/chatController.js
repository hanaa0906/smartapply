const ChatMessage = require('../models/ChatMessage');
const { generateReply, isAiEnabled, DEFAULT_SUGGESTIONS } = require('../services/counsellorEngine');

const MAX_LENGTH = 600;

exports.getHistory = async (req, res, next) => {
  try {
    const recent = await ChatMessage.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(60);
    res.status(200).json({
      success: true,
      aiEnabled: isAiEnabled(),
      suggestions: DEFAULT_SUGGESTIONS,
      messages: recent.reverse()
    });
  } catch (error) {
    next(error);
  }
};

exports.sendMessage = async (req, res, next) => {
  try {
    const message = String(req.body.message || '').trim();
    if (!message) {
      return res.status(400).json({ success: false, message: 'Type a question first.' });
    }
    if (message.length > MAX_LENGTH) {
      return res.status(400).json({ success: false, message: `Please keep your question under ${MAX_LENGTH} characters.` });
    }

    const history = (await ChatMessage.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(10)).reverse();
    const userMessage = await ChatMessage.create({ userId: req.user.id, role: 'user', content: message, source: 'student' });

    const reply = await generateReply(req.user, message, history);
    const assistantMessage = await ChatMessage.create({
      userId: req.user.id,
      role: 'assistant',
      content: reply.text.slice(0, 4000),
      links: reply.links,
      suggestions: reply.suggestions,
      source: reply.source
    });

    res.status(201).json({ success: true, userMessage, reply: assistantMessage });
  } catch (error) {
    next(error);
  }
};

exports.clearHistory = async (req, res, next) => {
  try {
    await ChatMessage.deleteMany({ userId: req.user.id });
    res.status(200).json({ success: true, message: 'Conversation cleared.' });
  } catch (error) {
    next(error);
  }
};
