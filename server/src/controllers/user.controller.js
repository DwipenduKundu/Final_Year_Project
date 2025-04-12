import asyncHandler from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import { User } from "../models/user.models.js";
import {accessTokenOptions, refreshTokenOptions} from "../constants.js"
import { sendOtpMail } from "../utils/mailsender.js";
import { OtpSchema } from "../models/otp.model.js";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while generating access and refresh token" + error
        );
    }
};


const registerUser = asyncHandler(async (req, res) => {
    const { email, name, password } = req.body;
    console.log(req.body)
    console.log(email,name,password)
    if (!email  || !password  || !name) {
        throw new ApiError(404, "Missing Credentials");
    }
    const emailExist = await User.findOne({ email });
    if (emailExist) {
        throw new ApiError(403, "Email already registered with other user");
    }
    
    const user = await User.create({
        name,
        email,
        password,
    });

    if (!user) {
        throw new ApiError(500, "Error occurred while Registering user user");
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
    const finalUser = await User.findById(user._id)
        .select("email")



    // res.send(201).json(new ApiResponse(201,{},"Otp Sent"))
    const otp = Math.floor(100000 + Math.random() * 900000);
    sendOtpMail(email,otp);

    const otpData = await OtpSchema.create({
        email,
        otp:String(otp),
    })

    if(!otpData){
        throw new ApiError(300,"Error creation of otp")
    }
    


    
    return res
        .status(201)
        .cookie("accessToken", accessToken, accessTokenOptions)
        .cookie("refreshToken", refreshToken, refreshTokenOptions)
        .json(new ApiResponse(201, finalUser, "User creation Success"));
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new ApiError(404, "Missing Credentials");
    }

    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(404, "User not Found");
    }
    const isPasswordValid = await user.isPasswordCorrect(password);
    
    if (!isPasswordValid) {
        throw new ApiError(403, "Invalid credentials");
    }
    let finalUser = await User.findById(user._id)
        .select("-password -refreshToken")
    
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
    return res
        .status(200)
        .cookie("accessToken", accessToken, accessTokenOptions)
        .cookie("refreshToken", refreshToken, refreshTokenOptions)
        .json(new ApiResponse(200, finalUser, "User Login Success"));
});


const registerWithGoogle = asyncHandler(async(req,res)=>{

    const {name, email, avatar,password} = req.body;

    if (!email || !password || !name || !password) {
        throw new ApiError(404, "Missing Credentials");
    }
    const emailExist = await User.findOne({ email });
    if (emailExist) {
        throw new ApiError(403, "Email already registered with other user");
    }
    
    const user = await User.create({
        name,
        email,
        password,
        avatar,
        isEmailVerified:true

    });
    if (!user) {
        throw new ApiError(500, "Error occurred while Registering user user");
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
    const finalUser = await User.findById(user._id)
        .select("-password -refreshToken")

    return res
        .status(201)
        .cookie("accessToken", accessToken, accessTokenOptions)
        .cookie("refreshToken", refreshToken, refreshTokenOptions)
        .json(new ApiResponse(201, finalUser, "User creation Success"));


})

const loginWithGoogle = asyncHandler(async(req,res)=>{

    const {email} = req.body;
    console.log(email)

    const user = await User.findOne({email});

    if(!user){
        throw new ApiError(404, "User not found")
    }

    let finalUser = await User.findById(user._id)
        .select("-password -refreshToken")
    
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
    return res
        .status(200)
        .cookie("accessToken", accessToken, accessTokenOptions)
        .cookie("refreshToken", refreshToken, refreshTokenOptions)
        .json(new ApiResponse(200, finalUser, "User Login Success"));


})


const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1,
            },
        },
        {
            new: true,
        }
    );

    return res
        .status(202)
        .clearCookie("accessToken")
        .clearCookie("refreshToken")
        .json(new ApiResponse(202, {}, "User logged out"));
});

const changeUserPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword, confirmPassword } = req.data;
    if (!oldPassword || !newPassword || !confirmPassword) {
        throw new ApiError(404, "Missing Credentials");
    }
    if (newPassword !== confirmPassword) {
        throw new ApiError(406, "password didn't matched");
    }
    const user = await User.findById(req.user._id);
    const isCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isCorrect) {
        throw new ApiError(401, "Password Incorrect");
    }
    user.password = newPassword;
    user.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(201, {}, "Password updated"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
    let user = await User.findById(req.user._id)
        .select('-password -refreshToken')
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    let finalUser = await User.findById(user._id)
        .select("-password -refreshToken")

    return res
        .status(200)
        .json(
        new ApiResponse(200,finalUser,"Success")
    )
});



const updateAvatar = asyncHandler(async (req, res) => {
    const user = User.findById(req.user_id)
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    let avatar = user.avatar;
    if (!req.file) {
        throw new ApiError(404, "Avatar file not found")
    }

    const avatarBuffer = req.file.buffer.toString("base64")
    const uploadResponse = await uploadOnCloudinary(avatarBuffer)

    if (!uploadResponse?.secure_url) {
        throw new ApiError(404, "Error uploading avatar to cloudinary")
    }
    avatar = uploadResponse.secure_url

    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                avatar,
            },
        },
        {
            new: true,
        }
    )
        .select("-password -refreshToken")

    if (!updatedUser) {
        throw new ApiError(500, "Error occurred while updating avatar")
    
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedUser, "Avatar details updated"));
})


const verifyOtp = asyncHandler(async(req,res)=>{
    // console.log(req.body)
    const {email,otp} = req.body;
    // console.log(req.body)
    if(!email){
        throw new ApiError(404,"Missing Credentials")
    }

    const emailExist = await OtpSchema.findOne({email});
    if(!emailExist){
        throw new ApiError(401,"Wrong credentials");
    }

    if(!(otp===emailExist.otp)){
        throw new ApiError(401,"Wrong OTP");
    }
    const user  = await User.findOne({email}).select('-passowrd -refreshToken');
    await OtpSchema.findOneAndDelete(email);
    if(!user){
        throw new ApiError(404,"Something went wrong")
    }
    return res.status(200).json(new ApiResponse(200,user,"Verified Success"));


})



export default {
    registerUser,
    registerWithGoogle,
    loginUser,
    loginWithGoogle,
    logoutUser,
    changeUserPassword,
    getCurrentUser,
    updateAvatar,
    verifyOtp
}