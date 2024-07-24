/* global Module Log moment config */

/* Magic Mirror
 * Module: MMM-OLYMPIC-MEDALS
 *
 * By taylornoss https://github.com/taylornoss/MMM-OLYMPIC-MEDALS
 * MIT Licensed.
 */


Module.register('MMM-OLYMPIC-MEDALS', {

    defaults: {
        season: 'summer', //summer or winter
        year: '2024', //muse be valid for the season (e.g. summer divisible by 4, winter even but not divisible by 4)
        reloadInterval: 60 * 60 * 1000, // every hour
        tableSize: 'xsmall',
        numOfRows: 10,
        useAbbreviations: false
    },

    getTranslations() {
        return {
            en: 'translations/en.json',
        };
    },

    getStyles() {
        return ['font-awesome.css', 'MMM-OLYMPIC-MEDALS.css'];
    },

    getTemplate() {
        return `templates/${this.name}.njk`;
    },

    getTemplateData() {
        return {
            loaded: this.loaded,
            rows: this.rows,
            config: this.config,
            noData: this.noData,
            configError: this.configError,
            fns: { translate: this.translate.bind(this) }
        };
    },

    start() {
        Log.info(`Starting module: ${this.name}`);
        this.loaded = false;
        this.config.season = this.config.season.toLowerCase();
        this.getData();
        setInterval(() => {
            console.log("Refreshing Olympics data...");
            this.getData();
        }, this.config.reloadInterval);
    },

    suspend() { },

    resume() { },

    getData() {
        var sendData = {
            id: this.identifier,
            config: this.config
        }
        this.sendSocketNotification('GET-Olympic-Data', sendData);
    },


    socketNotificationReceived(notification, payload) {
        if (notification === 'OLYMPIC-DATA' && payload.identifier === this.identifier) {
            this.rows = payload.rows;
            this.noData = (payload.header === "No Medals Data")
            this.loaded = true;
            this.configError = false;
            this.updateDom();
        }
        else if (notification === 'OLYMPIC-CONFIG-ERROR' && payload === this.identifier) {
            this.configError = true;
            this.updateDom();
        }
    },
});
