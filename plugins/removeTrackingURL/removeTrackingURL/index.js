/**
 * 
 * @param {import("zerespluginlibrary").Plugin} Plugin 
 * @param {import("zerespluginlibrary").BoundAPI} Library 
 * @returns 
 */
module.exports = (Plugin, Library) => {

    const {DiscordModules, Logger, Patcher, WebpackModules, Settings, Toasts} = Library;
    const {MessageStore, UserStore, ImageResolver, ChannelStore, Dispatcher, MessageActions} = DiscordModules;

    
    return class extends Plugin {
        constructor() {
            super();
            this.defaultSettings = {};
            this.defaultSettings.twitter = true;
            this.defaultSettings.reddit = true;

            this.defaultSettings.FXtwitter = false;
            this.defaultSettings.VXtwitter = false;
        }

        onStart() {
            Logger.info("Enabling removeTrackingURL!");

            Patcher.before(Dispatcher, "dispatch", (_, args) => {
                var event = args[0]

                // Logger.info(event.type);

                if (event.type === "MESSAGE_CREATE") {
                    const message = event.message;

                    if (message.author.id !== UserStore.getCurrentUser().id) return;

                    Logger.info(event)

                    // at this point we KNOW that the message is created by the current user and so we can edit it if it meets the requirements.

                    // twitter

                    // example of a twitter link 
                    // https://twitter.com/SoVeryBritish/status/1555115704839553024?s=20&t=a2A24ImVWWDElGic3hTwNg

                
                    if (this.settings.twitter) {
                        if (message.content.includes("https://twitter.com")) {

                            // if it includes the twitter url then it'll flow down here and appropriately remove the trackers and update the url.
                            // note: for those of you who /care/ so much about speed you will get a very slight performance increase if you use FXtwitter.

                            // regex for tweet urls (https:\/\/twitter.com\/\w+\/status\/\d+)

                            const tweet = /(https:\/\/twitter.com\/\w+\/status\/\d+)/g.exec(message.content)[0];
                            message.content = message.content.replace(/(https:\/\/twitter.com\/\w+\/status\/\d+\?[a-zA-Z0-9=&]*)/g, tweet);

                            if (this.settings.FXtwitter) {
                                event.message.content = message.content.replace("https://twitter.com", "https://fxtwitter.com");
                            }
                            else if(this.settings.VXtwitter) {
                                event.message.content = message.content.replace("https://twitter.com", "https://c.vxtwitter.com");
                            }

                            // locally edits messages, but we want to edit message server side
                            // MessageActions.editMessage("test");
                            Toasts.success("Succesfully removed tracker from twitter link!");
                        }
                    }

                    // reddit

                    // example of a reddit link 
                    //  https://www.reddit.com/r/GCSE/comments/kv1pny/leak_of_gcse_algorithm_to_find_grades/?utm_source=share&utm_medium=web2x&context=3

                    if (this.settings.reddit) {
                        if (message.content.includes("https://reddit.com")){
                            const post = /(https:\/\/reddit.com\/r\/\w+\/comments\/\w+\/\w+\/)/g.exec(message.content)[0];

                            message.content = message.content.replace(/(https:\/\/reddit.com\/r\/\w+\/comments\/\w+\/\w+\/\?[a-zA-Z0-9=&]*)/g, post);

                            Logger.info("Reddit link detected. Updating message from " + message + " to -> " + new_message);
                            Toasts.success("Succesfully removed tracker from reddit link!");
                        }
                    }
                }
            })
        }

        onStop() {
            Patcher.unpatchAll();
            Logger.info("Disabling removeTrackingURL!");
        }

        getSettingsPanel() {
            return Settings.SettingPanel.build(this.saveSettings.bind(this), 
                new Settings.Switch("Twitter","Remove twitter tracking URL", this.settings.twitter, (i) => {this.settings.twitter = i;}),
                new Settings.Switch("Reddit","Remove reddit tracking URL", this.settings.reddit, (i) => {this.settings.reddit = i;}),

                new Settings.SettingGroup("Advanced").append(
                    new Settings.Switch("FXtwitter","Automatically convert twitter links to FXtwitter links", this.settings.FXtwitter, (i) => {this.settings.FXtwitter = i;}),
                    new Settings.Switch("VXtwitter","Automatically convert twitter links to VXtwitter links", this.settings.VXtwitter, (i) => {this.settings.VXtwitter = i;})
                ),
            );
        }
    };

};