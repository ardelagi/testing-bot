const { Events, ActivityType } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    async execute(client) {
        
        client.logs.info(`[ROTATING_STATUS] Setting rotating status...`);

        setInterval(() => {

            let activities = [
                { type: ActivityType.Playing, name: `MOTIONLIFE ROLEPLAY` },
                { type: ActivityType.Streaming, name: `COMING SOON` },
                { type: ActivityType.Listening, name: `JUNE 2025` }
            ];

            const status = activities[Math.floor(Math.random() * activities.length)];

            client.user.setPresence({
                activities: [{ name: status.name, type: status.type }]
            });

        }, 5000);
        
        client.logs.success(`[ROTATING_STATUS] Rotating status loaded successfully.`);
    }
}