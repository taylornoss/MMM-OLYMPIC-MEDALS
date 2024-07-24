/* Magic Mirror
 * Module: MMM-OLYMPIC-MEDALS
 *
 * By taylornoss https://github.com/taylornoss/MMM-OLYMPIC-MEDALS
 * MIT Licensed.
 */

const NodeHelper = require('node_helper');
const Log = require('logger');

const ESPN = require('./espn');

module.exports = NodeHelper.create({
    requiresVersion: '2.15.0',

    async socketNotificationReceived(notification, payload) {
        if (notification === 'GET-Olympic-Data') {
            const config = payload.config;
            const identifier = payload.id;
            if((config.season === "summer" && config.year % 4 != 0) || (config.season === "winter" && config.year % 4 != 2)){
                Log.error(this.name+": "+config.year + " is an invalid year for "+config.season+" olympics");
                this.sendSocketNotification('OLYMPIC-CONFIG-ERROR', identifier);
                return;
            }
            await this.getData(config.season, config.year, config.numOfRows, identifier);
        }
    },

    async getData(season, year, limit, identifier) {
        try {
            const id = identifier;
            var table = await ESPN.getMedalData(season, year,limit);
            Log.debug(JSON.stringify(table));
            var returnVal = {
                identifier: id,
                header: table.header,
                rows: table.rows
            }
            Log.info("Sending Olympics Notification!");
            this.sendSocketNotification('OLYMPIC-DATA', returnVal);

        } catch (error) {
            Log.error(`Error getting Olympic Data: ${error}`);
        }
    },
});
