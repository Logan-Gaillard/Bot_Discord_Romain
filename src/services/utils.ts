export const calculateLevel = (xp: number): number => {
    return Math.floor((-60 + Math.sqrt(60 ** 2 + 4 * 30 * xp)) / (2 * 30));
}
