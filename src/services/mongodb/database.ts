import { MongoClient, Db } from "mongodb";
import env from "../../config.js";

const url = `mongodb://${encodeURIComponent(env.MONGODB_USER!)}:${encodeURIComponent(env.MONGODB_PASSWORD!)}@${env.MONGODB_HOST}:${env.MONGODB_PORT}/?authSource=admin`;
const dbName = env.MONGODB_NAME;

if (!url || !dbName) {
    throw new Error("MONGODB_URL et MONGODB_NAME doivent être définis dans .env");
}

const client = new MongoClient(url);
let db: Db;

const MongoDBService = () => {

    const connect = async () => {
        if (db) return db;
        try {
            await client.connect();
            db = client.db(dbName);
            console.log("MongoDB: connecté");
            return db;
        } catch (err) {
            console.error("MongoDB: Connexion échoué:", err);
            throw err;
        }
    };

    const getDb = (): Db => {
        if (!db) throw new Error("MongoDB: Non connecté !");
        return db;
    };

    const disconnect = async () => {
        await client.close();
        console.log("MongoDB: Connexion interrompue");
    };

    return { connect, getDb, disconnect };
};

export default MongoDBService();