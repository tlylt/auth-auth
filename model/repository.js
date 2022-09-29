import UserModel, { ROLE } from "./user-model.js"
import mongoose from "mongoose"
import logger from "../logger.js"
import { hashPassword } from "../auth/index.js"

const mongoDB = process.env.DB_LOCAL_URI

mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true })

const db = mongoose.connection
db.on("error", () => logger.error("MongoDB connection error:"))
db.on("connected", () => logger.info("Connected to MongoDB"))

export async function createUser(params) {
    return new UserModel(params)
}

export async function doesUserExist(username) {
    return UserModel.exists({ username: username })
}

export async function getUser(username) {
    return UserModel.findOne({ username: username })
}

export async function deleteUser(username) {
    return UserModel.deleteOne({ username: username })
}

export async function seedUsers() {
    const users = [
        { username: "basic", password: hashPassword("basic"), role: ROLE.BASIC },
        { username: "admin", password: hashPassword("admin"), role: ROLE.ADMIN },
    ]
    await UserModel.insertMany(users)
}