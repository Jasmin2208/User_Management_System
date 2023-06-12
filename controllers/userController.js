require('dotenv').config({ path: "../.env" })
const express = require("express");
const bcrypt = require("bcrypt")
const Registration = require("../src/model/registration")
const jwt = require("jsonwebtoken")
const cookieParser = require('cookie-parser')
const nodemailer = require("nodemailer")
const randomstring = require("randomstring");
const BASE_URL = process.env.BASE_URL
const flash = require('connect-flash');






// <---------------------------------------------------------------LOGOUT------------------------------------------------------------------------>






// LOGOUT PAGE
const logout = async (req, res) => {
    try {
        // delete single token
        // let tokenObj=req.user.tokens
        // for(let i=0; i<=tokenObj.length; i++){
        //     if(tokenObj[i].token==req.token){
        //         tokenObj.splice(i,1)


        //     }
        // }
        const _id = req.user._id;
        const userData = await Registration.findByIdAndUpdate(_id, { status: 'Inactive' }, {
            new: true
        })
        console.log("userData------>" + userData);
        // delete multiple token
        req.user.tokens = [];


        // console.log(`req.user.tokens:${req.user.tokens}`);         
        res.clearCookie("jwt")
        console.log("logout successfully!!");
        await req.user.save();
        res.redirect("/")
    } catch (error) {
        res.status(500).send(error)
    }
}





// <---------------------------------------------------------------LOGIN------------------------------------------------------------------------>






//RENDER LOGIN PAGE
const getLogin = (req, res) => {
    const role = req.body.role
    res.render("login", { role, alert: req.flash('alert') })
}








//POST LOGIN PAGE
const postlogin = async (req, res) => {
    try {
        const email = req.body.email
        const password = req.body.password
        const role = req.body.role
        const employeeEmail = await Registration.findOne({ email: email })
        // const status = employeeEmail.updateOne({status:"active"})
        // console.log("employeeEmail----->"+employeeEmail.role);
        const passwordMatch = await bcrypt.compare(password, employeeEmail.password)
        const token = await employeeEmail.generateAatuToken();
        // conssole.log(`token part ${token}`);
        // console.log(passwordMatch);
        res.cookie("jwt", token, {//token store into the cookies
            expires: new Date(Date.now() + 6000000000), //expired token into 30s
            httpOnly: true //we can delete token manualy but not delete token with using javascript
        });
        // console.log("cookie for login"+ cookie);

        if (passwordMatch) {
            const _id = employeeEmail._id
            if (employeeEmail.role == role && role == "User") {

                const userData = await Registration.findByIdAndUpdate(_id, { status: 'active' }, {
                    new: true
                })
                // console.log("userData----->"+userData);
                res.redirect("/index")
            } else if (employeeEmail.role == role && role == "Admin") {
                const userData = await Registration.findByIdAndUpdate(_id, { status: 'active' }, {
                    new: true
                })
                // const rows = await Registration.find()
                res.redirect("/admin")
            } else {
                res.status(400).render("login", { alert: "Invalid Role" })
            }
        } else {
            res.status(400).render("login", { alert: "Invalid Password" })
        }
    } catch (error) {
        res.status(400).render("login", { alert: "Invalid Detail" })
    }
}






// <---------------------------------------------------------------REGISTRATION------------------------------------------------------------------------>






//GET REGISTRATION PAGE-->ONLY RENDER PAGE
const getRegistration = (req, res) => {
    res.render("registration")
}







//POST REGISTRATION PAGE-->LOGIC FOR STORE DATA INTO MONGODB
const postRegistration = async (req, res) => {
    try {
        console.log("BODY---------", req.body)

        const password = req.body.password
        const confirmpassword = req.body.confirmpassword
        if (password === confirmpassword) {
            const registerEmployee = new Registration({
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                email: req.body.email,
                phone: req.body.phone,
                role: req.body.role,
                password: password,
                confirmpassword: confirmpassword
            });
            console.log(`successfull ${registerEmployee.role}`);

            const token = await registerEmployee.generateAatuToken();

            res.cookie("jwt", token, {                          //token store into the cookies
                expires: new Date(Date.now() + 30000),          //expired token into 30s
                httpOnly: true                                  //we can delete token manualy but not delete token with using javascript
            });
            // console.log(cookie);

            console.log(`token part ${token}`);

            const result = await registerEmployee.save()
            // console.log(result);
            if (registerEmployee.role == "User") {
                res.status(200).redirect("/index")
            } else if (registerEmployee.role == "Admin") {
                const rows = await Registration.find()
                res.status(200).redirect("/admin")
            } else {
                res.status(400).render("registration", { alert: "Select Role" })
            }

        } else {
            res.status(400).render("registration", { alert: "Password does not matched" })
        }
    } catch (error) {
        res.status(400).render("registration", { alert: "Enter All Fields" })
    }
}






// <---------------------------------------------------------------FORGOT PASSWORD------------------------------------------------------------------------>








//ONLY FUNCTION--->USE INTO FORGOT PASSWORD---->SEND E-MAIL TO USER MAIL INBOX
const resetPassword = async (firstname, email, token) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.HOST,
            port: 587,
            secure: false,
            auth: {
                user: process.env.USER,
                pass: process.env.PASS,
            },
        });
        const mailOption = {
            from: process.env.USER,
            to: email,
            subject: "For Reset Password",
            html: `<p>Hii ${firstname}, Please copy the link  and <a href="${BASE_URL}/update-password?token=${token}">reset your password</a></p>`,
        }
        await transporter.sendMail(mailOption, (info, error) => {
            if (error) {
                console.log(error)
            } else {
                console.log("Mail send successfully!!!", info);
            }
        });
        console.log("email sent sucessfully");
    } catch (error) {
        res.status(400).send({ status: false, message: error.message })
    }
}






//GET FORGOT PASSWORD PAGE
const getForgetPassword = async (req, res) => {
    res.render("forgotPassword")
}





//POST FORGOT PASSWORD PAGE
const postForgetPassword = async (req, res) => {
    try {
        const email = req.body.email;
        if (email) {
            const userData = await Registration.findOne({ email: email })
            // console.log("userData------>", userData);
            if (userData) {
                const randomString = randomstring.generate();
                const data = await Registration.updateOne({ email: email }, { $set: { passwordToken: randomString } })
                // console.log("data---->" + data)
                res.status(200).render("forgotPassword", { alert: "Please check youe email inbox" })
                resetPassword(userData.firstname, userData.email, randomString)
            } else {
                res.status(200).render("forgotPassword", { alert: "Email does not exist into database. Please Sign Up!!" })
            }
        } else {
            res.status(200).render("forgotPassword", { alert: "Please Enter Your Email " })
        }
    } catch (error) {
        res.status(500).render("forgotPassword", { alert: error.message })
    }
}






//GET UPDATE PASSWORD PAGE
const getUpdatePassword = (req, res) => {
    const token = req.query.token
    res.render("password", { token })
}





//POST UPDATE PASSWORD--->CHANGE PASSWORD LOGIC
const updatePassword = async (req, res) => {
    try {
        const token = req.query.token
        const tokenData = await Registration.findOne({ passwordToken: token })
        if (tokenData) {
            const password = req.body.password
            const confirmpassword = req.body.confirmpassword
            if (password == confirmpassword) {
                const securePassword = await bcrypt.hash(password, 10)
                const result = await Registration.findByIdAndUpdate({ _id: tokenData._id }, { $set: { password: securePassword, passwordToken: "" } }, { new: true })
                req.flash('alert', 'Password Updated Successfully!!.');
                res.redirect("/")
            } else {
                res.status(400).render("password", { alert: "Password does not match with Confirm-Password" })
            }
        } else {
            res.status(400).render("password", { alert: "Link was expired" })
        }
    } catch (error) {
        res.status(400).render("password", { alert: error.message })
    }
}




// <---------------------------------------------------------------USER------------------------------------------------------------------------>




//HOME PAGE--->Access by USER only
const getIndexFile = (req, res) => {
    // console.log("req.user----->"+req.user);
    const role = req.user.role
    res.render('index', { role })
}





//WEATHER PAGE-->Acess BY USER only
const weather = (req, res) => {
    console.log(`requisetes cookies : ${req.cookies.jwt}`);
    const role = req.user.role
    res.render("secret", { role })
}






//GET USER PROFILE--->ACCESS BY ONLY USER
const getProfile = async (req, res) => {
    try {
        const id = req.user.id
        const rows = await Registration.find({ _id: id })
        res.render('profile', { rows, alert: req.flash('alert') })
    } catch (error) {
        res.status(500).render('profile', { alert: error.message })
    }
}







// GET EDIT PROFILE ---> ACCESS BY ONLY USER
const getEditProfile = async (req, res) => {
    try {
        const id = req.params.id
        const rows = await Registration.find({ _id: id })
        res.render('editProfile', { rows })
    } catch (error) {
        res.status(500).render('profile', { alert: error.message })
    }
}




//POST EDIT PROFILE PAGE-->EDIT USER DETAIL BY USER ONLY NOT ADMIN CAN ACCESS THIS PAGE
const postEditProfile = async (req, res) => {
    try {
        const _id = req.params.id
        const userData = await Registration.findByIdAndUpdate(_id, req.body, {
            new: true
        })
        const id = req.user.id
        const rows = await Registration.find({ _id: id })
        req.flash('alert', 'Your Profile Update Successfully!!');
        res.status(201).redirect('/profile')
    } catch (error) {
        res.status(500).render('editProfile', { alert: error.message })
    }
}


// <---------------------------------------------------------------ADMIN------------------------------------------------------------------------>


//ADMIN PAGE--->Access by ADMIN only
const getAdmin = async (req, res) => {
    const rows = await Registration.find()
    res.render("admin", { rows, role: "Admin" })
}







//DATABASE-DASEBOARD
const database = async (req, res) => {
    const rows = await Registration.find()
    res.render("database", { rows, alert: req.flash('alert') })
}






//REGISTER USER DASHBOARD
const registerDashboard = async (req, res) => {
    const rows = await Registration.find()
    res.render("register", { rows })
}




// ACTIVE USER DASHBOARD
const activeDashboard = async (req, res) => {
    const rows = await Registration.find({ status: "active" })
    res.render("active", { rows })
}




//INACTIVE USER DASHBOARD
const inactiveDashboard = async (req, res) => {
    const rows = await Registration.find({ status: "Inactive" })
    res.render("inactive", { rows })
}







//GET ADD USER PAGE--->ACCESS BY ONLY ADMIN
const form = (req, res) => {
    res.render("addUser")
}






//GET VIEW USER PAGE--->ACCESS BY ADMIN ONLY
const viewuser = async (req, res) => {
    const id = req.params.id;
    const rows = await Registration.find({ _id: id })
    res.status(200).render("viewUser", { rows, role: "Admin" })
}







//POST ADD USER PAGE-->ADD USER DETAIL BY ADMIN 
const createUser = async (req, res) => {
    try {
        console.log("BODY---------", req.body)

        const password = req.body.password
        const confirmpassword = req.body.confirmpassword
        if (password === confirmpassword) {
            const registerEmployee = new Registration({
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                email: req.body.email,
                phone: req.body.phone,
                role: req.body.role,
                password: password,
                confirmpassword: confirmpassword
            });
            console.log(`successfull ${registerEmployee.role}`);

            const token = await registerEmployee.generateAatuToken();

            res.cookie("jwt", token, {                          //token store into the cookies
                expires: new Date(Date.now() + 30000),          //expired token into 30s
                httpOnly: true                                  //we can delete token manualy but not delete token with using javascript
            });
            // console.log(cookie);

            console.log(`token part ${token}`);

            const result = await registerEmployee.save()
            // console.log(result);
            console.log("hello");
            req.flash('alert', 'User Recorde Added Successfully!!!.');
            res.redirect('/database');
        } else {
            res.status(400).render("addUser", { alert: "Password does not matched", role: "Admin" })
        }
    } catch (error) {
        res.status(400).render("addUser", { alert: "Enter All Fields", role: "Admin" })
    }
}






//GET EDIT USER DETAIL--->ACCESS ONLY ADMIN
const getEditUser = async (req, res) => {
    try {
        const id = req.params.id
        const rows = await Registration.find({ _id: id })
        res.render('editUser', { rows, role: 'Admin' })
    } catch (error) {
        res.status(500).send(error)
    }
}







//POST EDIT USER DETAIL--->EDIT USER DETAIL BY ADMIN
const postEditUser = async (req, res) => {
    try {
        const _id = req.params.id
        const userData = await Registration.findByIdAndUpdate(_id, req.body, {
            new: true
        })
        req.flash('alert', 'Recoard updated successfully!!.');
        res.redirect('/database');
    } catch (error) {
        res.status(500).send(error)
    }
}






//DELETE USER RECORD FROM DATABASE-->ONLY ADMIN CAN ACCESS
const deleteUser = async (req, res) => {
    try {
        const _id = req.params.id
        await Registration.findByIdAndDelete(_id)
        const rows = await Registration.find()
        req.flash('alert', 'User Recorde Delete Successfully!!!.');
        res.redirect('/database');
    } catch (error) {
        res.status(500).send(error)
    }
}













// , createUser, form, viewuser, getEditUser, deleteUser, postEditUser,database,registerDashboard,activeDashboard,inactiveDashboard 
module.exports = { getIndexFile, getLogin, getRegistration, postRegistration, postlogin, weather, logout, getAdmin, postForgetPassword, getForgetPassword, updatePassword, getUpdatePassword, getProfile, postEditProfile, getEditProfile, createUser, form, viewuser, getEditUser, deleteUser, postEditUser, database, registerDashboard, activeDashboard, inactiveDashboard }





