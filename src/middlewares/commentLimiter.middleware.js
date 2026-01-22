import rateLimit from "express-rate-limit";

const commentLimiter = rateLimit({
    windowMs : 60 * 1000,
    max: 10,
    message: "Too many comments. Slow down."
})

export default commentLimiter
