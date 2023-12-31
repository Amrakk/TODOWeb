import { Redis } from "ioredis";

const url =
    process.env.ENV === "production"
        ? process.env.REDIS_IN_URL ?? ""
        : process.env.REDIS_EX_URL ?? "";
let redis: Redis;

const init = () => {
    return new Promise<void>((resolve, reject) => {
        redis = new Redis(url);
        redis.on("connect", () => {
            console.log("Cache connected");
            resolve();
        });
        redis.on("error", (err) => {
            console.log(err);
            reject(err);
        });
    });
};

const close = () => {
    return new Promise<void>((resolve, reject) => {
        redis = new Redis(url);
        redis.on("disconnect", () => {
            console.log("Cache disconnected");
            resolve();
        });
        redis.on("error", (err) => {
            console.log(err);
            reject(err);
        });
    });
};

const setOTP = async (email: string) => {
    const otp = Math.floor(100000 + Math.random() * 900000);
    if ((await redis.set(email, otp, "EX", 60 * 5)) === "OK") return otp;
    return null;
};

const getOTP = async (email: string) => {
    return await redis.get(email);
};

const verifyOTP = async (email: string, otp: string) => {
    if ((await getOTP(email)) === otp) {
        redis.del(email);
        return true;
    }
    return false;
};

const getRefToken = async (id: string) => {
    return await redis.get(id);
};

const setRefToken = async (id: string, token: string) => {
    if ((await redis.set(id, token, "EX", 60 * 60 * 24 * 7)) === "OK")
        return true;
    return false;
};

const verifyRefToken = async (id: string, token: string) => {
    if ((await getRefToken(id)) === token) return true;
    return false;
};

const deleteRefToken = async (id: string) => {
    if ((await redis.del(id)) === 1) return true;
    return false;
};

const cache = {
    init,
    close,
    setOTP,
    getOTP,
    verifyOTP,
    getRefToken,
    setRefToken,
    verifyRefToken,
    deleteRefToken,
};

export default cache;
