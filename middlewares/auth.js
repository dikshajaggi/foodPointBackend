const jwt = require("jsonwebtoken")

const getToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ msg: "Unauthorized: Token missing" });
    }
    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = { userId: decoded.id };
        next();
    } catch (error) {
        res.status(401).json({ msg: "Unauthorized: Token invalid or expired" });
    }     
}

module.exports = getToken;
