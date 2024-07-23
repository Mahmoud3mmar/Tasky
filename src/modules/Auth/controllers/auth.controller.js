import bcrypt from 'bcrypt'


import { AppError, catchAsyncError } from "../../../utils/error.handler.js";
import UserModel from '../../User/Models/user.model.js';
import jwt from 'jsonwebtoken';
import { TokenBlacklistModel } from '../Models/TokenBlacklist.Model.js';
import UserProfileModel from '../../User/Models/userprofile.model.js';
import { validatePhoneNumber } from '../../../utils/PhoneNumber.js';
import { sendConfirmationSMS } from '../../../utils/Twilio.Handler.js';








const signin = catchAsyncError(async (req, res) => {

    const { phone, password } = req.body
    const existeduser = await UserModel.findOne({ phone })

    if (!existeduser || !bcrypt.compareSync(password, existeduser.password)) throw new AppError('Invalid credentials', 400)

    const { name, _id: id } = existeduser

    // Generate access token
    const token = jwt.sign({ name, id }, process.env.SECRET, { expiresIn: '1h' })

    // Generate refresh token
    const refreshToken = jwt.sign({ id }, process.env.REFRESH_SECRET, { expiresIn: '7d' });

    // Store refresh token in the database
    existeduser.refreshToken = refreshToken;
    await existeduser.save();
    // Set the new refresh token in an HTTP-only cookie
    res.cookie('jwt', refreshToken, {
        httpOnly: true,
        sameSite: 'None',
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({ token,refreshToken, message: 'Signed in successfully ..' })
})
const refreshToken = catchAsyncError(async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) throw new AppError('No token provided', 400);

    const refreshToken = cookies.jwt;

    let decoded;
    try {
        decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
    } catch (error) {
        throw new AppError('Invalid token', 401);
    }

    const user = await UserModel.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) throw new AppError('Invalid token', 401);

    // Generate new access token
    const newAccessToken = jwt.sign({ name: user.name, phone: user.phone, id: user._id }, process.env.SECRET, { expiresIn: '15m' });

    // Optionally, generate a new refresh token
    const newRefreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_SECRET, { expiresIn: '7d' });
    user.refreshToken = newRefreshToken;
    

    // Set the new refresh token in an HTTP-only cookie
    res.cookie('jwt', newRefreshToken, {
        httpOnly: true,
        sameSite: 'None',
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(200).json({ token: newAccessToken });
});

const signup = catchAsyncError(async (req, res) => {
    const { name, countryCode, phone, password } = req.body;

    // Validate that required fields are present
    if (!name || !countryCode || !phone || !password) {
        throw new AppError('Please provide all required fields', 400);
    }
    // Validate the phone number
    if (!validatePhoneNumber(phone, countryCode)) {
        throw new AppError('Invalid phone number for the specified country', 400);
    }
    // Check if the user already exists
    const existingUser = await UserModel.findOne({ phone });
    if (existingUser) {
        throw new AppError('User with this phone number already exists', 409);

    }

    // Send confirmation SMS
    const confirmationMessage = `Hello ${name}, thank you for signing up!`;
    await sendConfirmationSMS(phone, confirmationMessage);

    // Hash the password
    const hashedpassword = bcrypt.hashSync(password, Number(process.env.SALT));

    // Create the user
    const user = await UserModel.create({
        name,
        countryCode,
        phone,
        password: hashedpassword,
    });

    // Create the user profile
    const userProfile = await UserProfileModel.create({});

    // Update the user with the new profile ID
    await UserModel.findByIdAndUpdate(user._id, { $push: { profile: userProfile._id } });

    res.status(201).json({ message: 'Signed up successfully ..' });
});

const logout = catchAsyncError(async (req, res) => {
    const token = req.header('token')

    if (!token) {
        throw new AppError('No token provided', 400);
    }

    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.SECRET);

    // Log the decoded token to check its content
    console.log('Decoded token:', decoded);

    // Ensure the exp field is present and valid
    if (!decoded.exp) {
        throw new AppError('Invalid token, no expiration time', 400);
    }

    const expirationTime = new Date(decoded.exp * 1000);

    // Log the expiration time to check its value
    console.log('Expiration time:', expirationTime);

    if (isNaN(expirationTime)) {
        throw new AppError('Invalid expiration time', 400);
    }

    await TokenBlacklistModel.create({
        token,
        expiresAt: expirationTime
    });

    res.status(200).json({ message: 'Logged out successfully ..' });
});

export {
    signin,
    signup,
    logout,
    refreshToken
}