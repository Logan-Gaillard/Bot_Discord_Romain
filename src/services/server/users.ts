import database from "../mongodb/database.js";
import { IUser } from "../mongodb/ICollections.js";

export const getAllGuildUsers = async (guildId: string): Promise<IUser[]> => {
    const db = database.getDb();
    if (!db) throw new Error("Erreur de connexion à la base de données");

    return await db.collection<IUser>("users").find({ guildId }).toArray();
};

export const getGuildLeaderboard = async (guildId: string, limit = 10): Promise<IUser[]> => {
    const db = database.getDb();
    if (!db) throw new Error("Erreur de connexion à la base de données");

    return await db
        .collection<IUser>("users")
        .find({ guildId })
        .sort({ xp: -1 })
        .limit(limit)
        .toArray();
};