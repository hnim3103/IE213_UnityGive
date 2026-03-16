import Comment from "../models/Comment.js";

export const getAllComments = async (req, res) => {
  try {
    const filter = {};
    if (req.query.campaignId) filter.campaignId = req.query.campaignId;
    if (req.query.userId) filter.userId = req.query.userId;

    const comments = await Comment.find(filter).sort({ createdAt: -1 });
    res.status(200).json(comments);
  } catch (error) {
    console.error("Failed to execute getAllComments", error);
    res.status(500).json({ message: "An internal error occurred" });
  }
};

export const getCommentByID = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    res.status(200).json(comment);
  } catch (error) {
    console.error("Failed to execute getCommentByID", error);
    res.status(500).json({ message: "An internal error occurred" });
  }
};

export const createComment = async (req, res) => {
  try {
    const comment = new Comment(req.body);
    const newComment = await comment.save();
    res.status(201).json(newComment);
  } catch (error) {
    console.error("Failed to execute createComment", error);
    res.status(500).json({ message: "An internal error occurred" });
  }
};

export const updateComment = async (req, res) => {
  try {
    const comment = await Comment.findByIdAndUpdate(
      req.params.id,
      { content: req.body.content },
      { new: true, runValidators: true }
    );
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    res.status(200).json(comment);
  } catch (error) {
    console.error("Failed to execute updateComment", error);
    res.status(500).json({ message: "An internal error occurred" });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findByIdAndDelete(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Failed to execute deleteComment", error);
    res.status(500).json({ message: "An internal error occurred" });
  }
};
