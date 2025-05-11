import { createClient } from "redis"

const redis = createClient()

redis.on("Error", (e) => console.error("Redis Error: ", e))

await redis.connect()

export default redis