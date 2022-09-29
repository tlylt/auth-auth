import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import morgan from "morgan"
import helmet from "helmet"
import compression from "compression"
import redis from "redis"
import "dotenv/config"

import {
    createUser,
    deleteUser,
    deleteUserViaPassword,
    getUser,
    login,
    logout,
    token,
    updateUser,
} from "./controller/user-controller.js"
import { authenticateToken, authenticateWithAuthorize } from './middleware.js'
import logger from './logger.js'
import { seedUsers } from "./model/repository.js"
import { ROLE } from "./model/user-model.js"

const API_PREFIX = "/api/v1/auth"

const app = express()
const router = express.Router()

let redisClient

(async () => {
    redisClient = redis.createClient({ url: `redis://${process.env.REDIS_HOST}:6379` });
    redisClient.on("error", (error) => logger.error(`${error}`))
    redisClient.on("connect", () => logger.info("Connected to Redis"))
    await redisClient.connect()
})()

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors({
    origin: `http://localhost:${process.env.PORT || 3000}`,
    credentials: true
}))
app.use(cookieParser())
app.use(morgan("dev"))
app.use(helmet())
app.use(compression())

app.use(API_PREFIX, router).all((_, res) => {
    res.setHeader("content-type", "application/json")
    res.setHeader("Access-Control-Allow-Origin", "*")
})

// CHECK SERVER ALIVE
router.get("/status", (_, res) => {
    res.status(200).send({ message: "Hello World from auth-auth" })
})

// CREATE USER
router.post("/", createUser)
// LOGIN
router.post("/login", login)
// REFRESH TOKEN
router.post('/token', token)
// GET USER
router.get("/", authenticateToken, getUser)
// UPDATE USER
router.put("/", authenticateToken, updateUser)
// DELETE USER
router.delete("/", authenticateToken, deleteUser)
// LOGOUT
router.post('/logout', authenticateToken, logout)
// DELETE USER
router.delete("/delete", deleteUserViaPassword)

// AUTHENTICATED
router.get("/authenticated", authenticateToken, (_, res) => {
    res.status(200).send("Hi authenticated user")
})

// BASIC AND ABOVE
router.get("/basic", authenticateWithAuthorize(ROLE.BASIC), (_, res) => {
    res.status(200).send("Hi user with basic and above permission")
})

// ADMIN ONLY
router.get("/admin", authenticateWithAuthorize(ROLE.ADMIN), (_, res) => {
    res.status(200).send("Hi user with admin permission")
})

// Error handling
app.use((err, _, res, next) => {
    logger.error(err)
    res.status(500).send({ message: "Server error" })
    next(err);
})

app.listen(8000, async () => {
    try {
        await seedUsers()
    } catch {
        logger.info("Seeded in the past")
    }
    logger.info("auth-auth listening on port 8000")
})

export { redisClient, app }