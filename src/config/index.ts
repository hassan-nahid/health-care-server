import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
    node_env: process.env.NODE_ENV,
    port: process.env.PORT,
    database_url: process.env.DATABASE_URL,
    salt_round: process.env.SALT_ROUND,
    cloud_name: process.env.Cloud_name,
    api_key: process.env.Api_key,
    api_secret: process.env.Api_secret
}