import mongoose from "mongoose"

export const ROLE = {
    UNKNOWN: 0,
    BASIC: 1,
    ADMIN: 2
};

var Schema = mongoose.Schema
const UserModelSchema = new Schema({
    username: {
        type: String,
        required: true,
        minLength: 1,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: Number,
        default: ROLE.BASIC,
    },
    refreshToken: {
        type: String,
    },
    createdAt: {
        type: Date,
        immutable: true,
        default: () => Date.now(),
    },
    updatedAt: {
        type: Date,
        default: () => Date.now(),
    },
})

UserModelSchema.pre("save", function (next) {
    this.updatedAt = Date.now()
    next()
})

export default mongoose.model("UserModel", UserModelSchema)
