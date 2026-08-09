export interface IUser {
    _id: string;
    guildId: string;
    userId: string;
    name: string;
    xp: number;
    coins: number;
    purchased_items: { itemId: string; quantity: number }[];
    lastXpAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}