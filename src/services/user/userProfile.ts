import database from "../mongodb/database.js";
import { IUser } from "../mongodb/ICollections.js";
import { User } from "discord.js";

export interface UserXPStat {
    xp: number;
    level: number;
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
        return { xp: userData.xp, level: calculateLevel(userData.xp) };
    };

    const getLastXPDate = async (): Promise<Date> => {
        const userData = await getOrCreateUser(author, guildId);
        return userData.lastXpAt;
    };

    const addXP = async (amount: number): Promise<void> => {
        const db = database.getDb();
        if (!db) throw new Error("Une erreur est survenue lors de la communication avec la base de données");

        await getOrCreateUser(author, guildId); // garantit que l'utilisateur existe avant l'update
        const id = `${guildId}-${author.id}`;

        await db.collection<IUser>("users").updateOne(
            { _id: id },
            { $inc: { xp: amount }, $currentDate: { updatedAt: true, lastXpAt: true } }
        );
        console.log(`Ajout de ${amount}xp à ${author.username}`);
    };

    return {
        getUserXP,
        getLastXPDate,
        dataFunction: { addXP },
    };
};

function calculateLevel(xp: number): number {
    return Math.floor((-60 + Math.sqrt(60 ** 2 + 4 * 30 * xp)) / (2 * 30));
}

export default userProfile;