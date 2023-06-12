require('dotenv').config()
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const employeeSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: Number,
        required: true,
        unique: true
    },role:{
        type:String,
        required:true
    },
    password: {
        type: String,
        required: true
    },
    confirmpassword: {
        type: String,
        required: true
    },
    status:{
        type:String,
        default:"active"
    },
    createdOn: {
        type: Date,
        default: Date.now
      },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    passwordToken:{
        type:String,
        default:""
    }
});

employeeSchema.methods.generateAatuToken = async function () {
    try {
        // console.log("id:"+this._id);
        const token = jwt.sign({ _id: this._id.toString() }, process.env.SECRET_KEY)
        // console.log("token:"+token);
        this.tokens = this.tokens.concat({token:token})
        await this.save()
        return token;
    

    } catch (error) {
        res.send("the errror part" + error)
        console.log("the errror part" + error);
    }
}

employeeSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        // console.log(`the current pass ${this.password}`);
        this.password = await bcrypt.hash(this.password, 10);
        // console.log(`the current pass ${this.password}`);
        this.confirmpassword = await bcrypt.hash(this.password, 10);
    }
    next();
})


const Registration = new mongoose.model("Registration", employeeSchema);


module.exports = Registration