import { rateLimit } from "express-rate-limit";

export const loginRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,

    standardHeaders: "draft-8",
    legacyHeaders: false,

    message: {
        message: "Muitas tentativas de login. Tente novamente mais tarde.",
    },
});

export const registerRateLimit = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 5,

    standardHeaders: "draft-8",
    legacyHeaders: false,

    message: {
        message: "Muitas tentativas de cadastro. Tente novamente mais tarde.",
    },
});
