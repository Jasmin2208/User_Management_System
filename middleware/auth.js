const jwt = require("jsonwebtoken")
const Registration = require("../src/model/registration")

const auth = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        const verifyUser = jwt.verify(token, process.env.SECRET_KEY)
        // console.log(verifyUser);
        const user = await Registration.findOne({ _id: verifyUser._id })
        // console.log(user);
        // console.log(`auth token ${token}`);
        req.token = token;
        req.user = user;
        // console.log("    auth---->"+req.user)
        next();
    } catch (error) {
        res.render("login",{note:'Please login to access this page'})
    }
}

module.exports = auth;