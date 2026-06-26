import env from "../config.js";

export enum Channel {
    ANNONCES = "annonces",
    ARRIVANTS = "arrivants",
    RESEAUX = "reseaux",
    NOTIFICATIONS_LIVE = "notifications-live",
    NOTIFICATIONS_VIDEOS = "notifications-videos",

}

export const getChannels = (channel: Channel) => {
    const currentEnv = env.ENVIRONMENT || "development";

    const channels = {
        development: {
            [Channel.ANNONCES]: "1519948093465038858",
            [Channel.ARRIVANTS]: "1440075668611399893",
            [Channel.RESEAUX]: "1441839485502619830",
            [Channel.NOTIFICATIONS_LIVE]: "1519948314068385832",
            [Channel.NOTIFICATIONS_VIDEOS]: "1519948368980213931",
        },
        production: {
            [Channel.ANNONCES]: "1436417480254947530",
            [Channel.ARRIVANTS]: "1436396028449521765",
            [Channel.RESEAUX]: "1441432594653777950",
            [Channel.NOTIFICATIONS_LIVE]: "1436392484652449894",
            [Channel.NOTIFICATIONS_VIDEOS]: "1441865806752256050",
        },
    };

    return channels[currentEnv][channel];
}