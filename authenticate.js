module.exports.isauthenticate = async (req, res, next) => {
  try {
    // Assuming you're using a session or token for authentication
    const userId = req.session.userId || req.headers.authorization; // Adjust as per your implementation
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    const user = await User.findById(userId); // Fetch user details from the database
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user; // Attach the user object to the request
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({ message: "Failed to authenticate user" });
  }
};
