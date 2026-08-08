import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const url = `mongodb://${encodeURIComponent(process.env.MONGODB_USER!)}:${encodeURIComponent(process.env.MONGODB_PASSWORD!)}@${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/?authSource=admin`;

const client = new MongoClient(url);

/**
 * Schéma de référence de la collection `users`.
 *
 * _id             : `${guildId}_${userId}` — clé composite (un doc par utilisateur PAR serveur)
 * guildId         : ID du serveur Discord
 * userId          : ID de l'utilisateur Discord
 * name            : pseudo, mis à jour à chaque message
 * xp              : XP total cumulé (ne redescend jamais) — le niveau se calcule à la volée, jamais stocké
 * coins           : monnaie du bot
 * purchased_items : inventaire ACTUEL (petit, borné) — l'historique complet vivra dans une collection `purchases` séparée
 * lastDropXpAt    : dernier gain d'XP, sert de base au cooldown anti-spam
 * createdAt       : date de création du document (posée par le serveur Mongo)
 * updatedAt       : date de dernière modification (posée par le serveur Mongo via $currentDate)
 */
const usersValidator = {
    $jsonSchema: {
        bsonType: "object",
        required: ["guildId", "userId", "name", "xp", "coins", "createdAt", "updatedAt"],
        properties: {
            _id: { bsonType: "string" },
            guildId: { bsonType: "string" },
            userId: { bsonType: "string" },
            name: { bsonType: "string" },
            xp: { bsonType: "number", minimum: 0 },
            coins: { bsonType: "number", minimum: 0 },
            purchased_items: {
                bsonType: "array",
                items: {
                    bsonType: "object",
                    required: ["itemId", "quantity"],
                    properties: {
                        itemId: { bsonType: "string" },
                        quantity: { bsonType: "number", minimum: 1 },
                    },
                },
            },
            lastDropXpAt: { bsonType: "date" },
            createdAt: { bsonType: "date" },
            updatedAt: { bsonType: "date" },
        },
    },
};

async function migrate() {
    await client.connect();
    const db = client.db(process.env.MONGODB_NAME);

    const existingCollections = await db.listCollections({ name: "users" }).toArray();

    if (existingCollections.length === 0) {
        console.log("Création de la collection 'users'...");
        await db.createCollection("users", {
            validator: usersValidator,
            validationLevel: "moderate", // valide les inserts/updates sans casser les docs existants non conformes
        });
    } else {
        console.log("Collection 'users' déjà existante — mise à jour du validateur...");
        await db.command({
            collMod: "users",
            validator: usersValidator,
            validationLevel: "moderate",
        });
    }

    console.log("Création des index...");
    // Leaderboard par serveur, trié par XP décroissant
    await db.collection("users").createIndex({ guildId: 1, xp: -1 });

    console.log("Migration 001 terminée avec succès.");
    await client.close();
}

migrate().catch((err) => {
    console.error("Échec de la migration :", err);
    process.exit(1);
});