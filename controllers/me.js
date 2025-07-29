const user = require("../models/user");

const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.userId;

    const userExists = await user.findById(userId);
    if (!userExists) return res.status(404).json({ msg: "User not found" });

    const isMatch = await userExists.comparePasswords(oldPassword);
    if (!isMatch) return res.status(401).json({ msg: "Old password is incorrect" });

    userExists.password = newPassword;
    await userExists.save();

    return res.status(200).json({ msg: "Password changed successfully" });
  } catch (error) {
    next(error);
  }
};


const updateProfile = async (req, res, next) => {
    try {
        const {phoneNo, address, username} =  req.body
        const userId = req.user.userId;
        const userExists = await user.findById(userId)

        if (!userExists) {
            return res.status(404).json({ msg: "User not found" });
        } else {
            if (phoneNo) userExists.phoneNo = phoneNo;
            if (address) {
              const index = userExists.address.findIndex(item => item.label.toLowerCase() === address.label.toLowerCase())
              if (index !== -1) Object.assign(userExists.address[index], address)
              else userExists.address.push(address);
            }
            if (username) userExists.username = username;
            await userExists.save();
            return res.status(200).json({ msg: "Changes saved successfully" });
        }
    } catch (error) {
        next(error)
    }
}

const deleteSingleAddress = async(req, res, next) => {
  try {
    const {label} = req.body
    const userId = req.user.userId;
    const userExists = await user.findById(userId)

    if (!userExists) {
      return res.status(404).json({ msg: "User not found" });
    } else {
      const addressIndex = userExists.address.findIndex(
        addr => addr.label.toLowerCase() === label.toLowerCase()
      );
      if (addressIndex === -1) {
        return res.status(404).json({ msg: `Address with label '${label}' not found` });
      }
      if (userExists.address.length === 1) {
        return res.status(400).json({ msg: "Cannot delete the only saved address" });
      }

      userExists.address.filter(item => item.label.toLowerCase() !== label.toLowerCase())
      await userExists.save()
      return res.status(200).json({ msg: "Address deleted successfully" });
    }
  } catch (error) {
      next(error)
  }
}

const addAddress = async (req, res, next) => {
  try {
    const address = req.body
    const userId = req.user.userId;

    const userExists = await user.findById(userId)

    if (!userExists) {
      return res.status(404).json({ msg: "User not found" });
    } 

    const labels = userExists.address.map(item => item.label.toLowerCase())
    const newLabel = address.label.toLowerCase();

    if (labels.includes(newLabel)) {
      return res.status(409).json({ msg: `${address.label} address already exists, delete it to save another` });
    }
    userExists.address.push(address)
    await userExists.save()

    return res.status(201).json({ msg: "Address saved successfully" });
  } catch (error) {
    next(error)
  }
}

const getDetails = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const userData = await user.findById(userId).select("-password")

    if(!userData) return res.status(404).json({ msg: "User not found" });
    return res.status(200).json({ msg: "User details fetched", data: userData });

  } catch (error) {
    next(error)
  }
}

module.exports = {changePassword, updateProfile, deleteSingleAddress, addAddress, getDetails}