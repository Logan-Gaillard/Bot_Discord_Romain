import database from "../mongodb/database.js";
import { IUser } from "../mongodb/ICollections.js";
import { User } from "discord.js";
import { calculateLevel } from "../utils.js";

export interface UserXPStat {
    xp: number;
    level: number;
    coins: number;
}

const createUser = async ({ guildId, name, userId }: Pick<IUser, "guildId" | "name" | "userId">): Promise<IUser> => {
    const db = database.getDb();
    if (!db) {
        throw new Error("Une erreur est survenue lors de la communication avec la base de données, veuillez réessayer");
    }

    const id = `${guildId}-${userId}`;
    const newUser: IUser = {
        _id: id,
        userId,
        guildId,
        name,
        purchased_items: [],
        xp: 0,
        coins: 0,
        lastXpAt: new Date(0),
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    try {
        await db.collection<IUser>("users").insertOne(newUser);
        return newUser;
    } catch (err) {
        throw new Error("Une erreur est survenue lors de la création d'un utilisateur : " + err);
    }
};

const getOrCreateUser = async (author: User, guildId: string): Promise<IUser> => {
    const db = database.getDb();
    if (!db) {
        throw new Error("Une erreur est survenue lors de la communication avec la base de données, veuillez réessayer");
    }

    const id = `${guildId}-${author.id}`;
    const userData = await db.collection<IUser>("users").findOne({ _id: id });

    if (userData) return userData;

    console.log("Création d'un nouvel utilisateur dans la base de données !");
    return createUser({ userId: author.id, guildId, name: author.username });
};

const userProfile = (author: User, guildId: string) => {
    const getUserXP = async (): Promise<UserXPStat> => {
        const userData = await getOrCreateUser(author, guildId);
        return { xp: userData.xp, level: calculateLevel(userData.xp), coins: userData.coins};
    };

    const getLastXPDate = async (): Promise<Date> => {
        const userData = await getOrCreateUser(author, guildId);
        return userData.lastXpAt;
    };

    const addCoins = async (amount: number, reason?: string): Promise<void> => {
        const db = database.getDb();
        if (!db) return;
        
        await db.collection<IUser>("users").updateOne(
            { _id: `${guildId}-${author.id}` },
            { $inc: { coins: amount },$currentDate: { updatedAt: true } }
        );
        console.log(`Ajout de ${amount} coins à ${author.username} ${reason ? `(${reason})` : ""}`);
    };

    const addXP = async (amount: number, reason: string): Promise<void> => {
        const db = database.getDb();
        if (!db) throw new Error("Erreur DB");

        const userData = await getOrCreateUser(author, guildId);
        const currentLevel = calculateLevel(userData.xp);

        await db.collection<IUser>("users").updateOne(
            { _id: `${guildId}-${author.id}` },
            { $inc: { xp: amount },$currentDate: { updatedAt: true, lastXpAt: true } }
        );
        console.log(`Ajout de ${amount}xp à ${author.username} pour ${reason}`);

        const newLevel = calculateLevel(userData.xp + amount);
        if (newLevel > currentLevel) {
            let coinsToGive = 0;

            for (let lvl = currentLevel + 1; lvl <= newLevel; lvl++) {
                coinsToGive += 5; // 5 coins par niveau
                if (lvl % 5 === 0) coinsToGive += 15; // Bonus tous les 5 niveaux
            }

            if (coinsToGive > 0) {
                await addCoins(coinsToGive, `Passage du niveau ${currentLevel} à ${newLevel}`);
            }
        }
    };

    return {
        getUserXP,
        getLastXPDate,
        dataFunction: { addXP, addCoins },
    };
};

export default userProfile;