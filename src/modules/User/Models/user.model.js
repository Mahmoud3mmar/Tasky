import mongoose from "mongoose";


const UserSchema = new mongoose.Schema({


    name: {
        type: String,
        required: true


    },
    countryCode: {
        type: String,
        required: true


    },
    phone: {
        type: String,
        required: true,
        // validate: {
        //     Phonevalidator: function (value) {
        //         try {
        //             const phoneNumber = libphonenumber.parsePhoneNumber(value);
        //             return phoneNumber.isValid();
        //         } catch (e) {
        //             return false;
        //         }
        //     },
        //     message: props => `${props.value} is not a valid phone number!`
        // }

    },
    password: {
        type: String,
        required: true,



    },
    tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
    profile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserProfile'
    },
    refreshToken: { type: String }  // Add this line





})

const UserModel = mongoose.model('User', UserSchema)


export default UserModel