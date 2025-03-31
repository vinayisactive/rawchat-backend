import Redis from "ioredis"

export const redisPublisher = new Redis(process.env.REDIS_DB_URL!);
export const redisSubscriber = new Redis(process.env.REDIS_DB_URL!);

export default {
    redisPublisher,
    redisSubscriber
}; 

export const closeRedisConnections  = async() => {
    await redisPublisher.quit(); 
    await redisSubscriber.quit();
}