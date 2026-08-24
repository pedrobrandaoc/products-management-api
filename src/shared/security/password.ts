import argon2 from "argon2";

export async function hashPassword(password: string) {
    return argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 19456,
        timeCost: 2,
        parallelism: 1,
    });
};

export async function verifyPassword(
    passwordHash: string,
    password: string
) {
    return argon2.verify(passwordHash, password);
};

export const DUMMY_PASSWORD_HASH ="$argon2id$v=19$m=19456,p=1,t=2$vd3H5Et7NMg43C1bgzednQ$h1IGzqBDq/7crhyXIo9fylUH6j/pPDWAeQ7NXekjdHE";
