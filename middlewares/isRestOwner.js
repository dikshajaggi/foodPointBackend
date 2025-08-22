const user = require("../models/user");

const isRestOwner = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const userExists = await user.findById(userId);

    if (!userExists) return res.status(404).json({ success: false, message: "User not found" });
    if (!userExists.isRestaurantOwner) return res.status(403).json({ success: false, message: "Only restaurant owners can perform this action" });

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = isRestOwner;
