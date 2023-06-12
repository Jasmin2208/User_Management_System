const express = require("express");
const router = express.Router()
const auth = require("../middleware/auth")


const userController = require("../controllers/userController")




router.get("/index",auth, userController.getIndexFile)

router.get("/weather",auth, userController.weather)

router.get("/logout",auth, userController.logout)

router.get("/", userController.getLogin)

router.get("/registration", userController.getRegistration)

router.get("/admin",auth,userController.getAdmin)

router.get('/adduser',auth, userController.form); 

router.get('/viewuser/:id',auth, userController.viewuser);

router.get('/edituser/:id',auth, userController.getEditUser);

router.get("/profile",auth,userController.getProfile)

router.get("/database",auth,userController.database)

router.get('/register-dashboard', userController.registerDashboard);

router.get('/active-dashboard', userController.activeDashboard);

router.get('/inactive-dashboard', userController.inactiveDashboard);

router.get('/forgot-password', userController.getForgetPassword);

router.get('/update-password', userController.getUpdatePassword);

router.get("/editprofile/:id",auth,userController.getEditProfile)

router.post("/editprofile/:id",auth,userController.postEditProfile)

router.post('/forgot-password', userController.postForgetPassword);

router.post('/update-password', userController.updatePassword);//update password-->put

router.post('/edituser/:id',auth, userController.postEditUser);

router.post("/",userController.postlogin)

router.post("/registration", userController.postRegistration)

router.post("/adduser",auth, userController.createUser)

router.get('/:id',auth,userController.deleteUser);





module.exports=router;

