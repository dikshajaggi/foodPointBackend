const user = require("../models/user")

const register = async (req, res, next) => {
    try {
        const {username, email, password, phoneNo, address} = req.body

        if (!email || !password || !username) {
            return res.status(400).json({ msg: "Missing required fields" });
        }

        const userExists = await user.findOne({email}) 

        // Ensure address has label, else default to 'home'
        const userAddress = address
        ? [{ ...address, label: address.label || "home" }]
        : [];

        if (userExists) {
            res.status(409).json({msg: "user with this email is already registered"})
        } else {
            const newUser = await user.create({username, email, password, phoneNo, address: userAddress})
            const safeUser = newUser.toObject();
            delete safeUser.password;
            res.status(201).json({msg: "registration successful", data: safeUser, token: await newUser.generateToken()})
        }
    } catch (error) {
        res.status(500).json({ msg: "Server error during registration", error: error });
        next(error)
    }
}


const login = async (req, res, next) => {
    try {
        const {email, password} = req.body

        if (!email || !password) {
            return res.status(400).json({ msg: "Email and password are required" });
        }

        const userExists = await user.findOne({email})

        if (!userExists) {
            return res.status(404).json({ msg: "User not found" });
        }

        if(userExists) {
           const tokenMatched =  await userExists.comparePasswords(password)
           if (tokenMatched) {
                const userData = {
                    email,
                    token: await userExists.generateToken(),
                    userId: userExists._id.toString()
                }
            res.status(200).json({msg: "login successful", data: userData})
           } else {
            return res.status(401).json({ msg: "Invalid email or password" });
            }
        } 
    } catch (error) {
       res.status(500).json({ msg: "Server error during login" });
       next(error)
    }
}

module.exports = {login, register}