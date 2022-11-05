/**
 * 
 * @param {import("zerespluginlibrary").Plugin} Plugin 
 * @param {import("zerespluginlibrary").BoundAPI} Library 
 * @returns 
 */
module.exports = (Plugin, Library) => {

    const {DiscordModules, Logger, Patcher, WebpackModules, Settings, Toasts} = Library;
    const {MessageStore, UserStore, ImageResolver, ChannelStore, Dispatcher} = DiscordModules;

    
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
                const event = args[0]

                if (event.type === "MESSAGE_CREATE") {
                    const message = event.message;
                    const user = UserStore.getUser(message.author.id);

                    if (user !== UserStore.getCurrentUser()) return;

                    // at this point we KNOW that the message is created by the current user and so we can edit it if it meets the requirements.

                    // example of a twitter link 
                    // https://twitter.com/SoVeryBritish/status/1555115704839553024?s=20&t=a2A24ImVWWDElGic3hTwNg

                    // twitter
                    if (this.settings.twitter) {
                        if (message.content.includes("https://twitter.com")) {

                            var new_message = message.content.replace(/(https:\/\/twitter.com\/\w+\/status\/\d+)(\?s=\d+&t=\w+)/g, "$1");

                            message.content = message.content.split("?")[0];
                            // MessageStore._sendMessage(message.content)
                            Logger.info("Twitter link detected. Updating message from " + message.content + " to -> " + new_message);
                            // MessageStore.updateMessage(channel, message);
                            Toasts.success("Succesfully removed tracker from twitter link!");
                        }
                    }

                    // reddit

                    return;

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