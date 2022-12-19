/**
 * 
 * @param {import("zerespluginlibrary").Plugin} Plugin 
 * @param {import("zerespluginlibrary").BoundAPI} Library 
 * @returns 
 */
module.exports = (Plugin, Library) => {

    const {DiscordModules, Logger, Patcher, Settings, Toasts} = Library;
    const {MessageActions,} = DiscordModules;

    
    return class extends Plugin {
        constructor() {
            super();
            this.defaultSettings = {};
            this.defaultSettings.twitter = true;
            this.defaultSettings.reddit = true;
            this.defaultSettings.showToasts = false;
            this.defaultSettings.project = true;

            this.defaultSettings.FXtwitter = false;
            this.defaultSettings.VXtwitter = false;
        }

        onStart() {
            Logger.info("Enabling removeTrackingURL!");

            Patcher.before(DiscordModules.MessageActions, "sendMessage", (t,a) => {
                var msgcontent = a[1].content
                // twitter

                // example of a twitter link 
                // https://twitter.com/SoVeryBritish/status/1555115704839553024?s=20&t=a2A24ImVWWDElGic3hTwNg

            
                if (this.settings.twitter) {
                    if (msgcontent.includes("https://twitter.com")) {

                        // if it includes the twitter url then it'll flow down here and appropriately remove the trackers and update the url.
                        // note: for those of you who /care/ so much about speed you will get a very slight performance increase if you use FXtwitter.

                        const tweet = /(https:\/\/twitter.com\/\w+\/status\/\d+)/g.exec(msgcontent)[0];
                        msgcontent = msgcontent.replace(/(https:\/\/twitter.com\/\w+\/status\/\d+\?[a-zA-Z0-9=&]*)/g, tweet);

                        if (this.settings.FXtwitter) {
                            msgcontent = msgcontent.replace("https://twitter.com", "https://fxtwitter.com");
                        }
                        else if(this.settings.VXtwitter) {
                            msgcontent = msgcontent.replace("https://twitter.com", "https://c.vxtwitter.com");
                        }

                        if (this.settings.showToasts)
                        {
                            Toasts.success("Succesfully removed tracker from twitter link!");
                        }
                    }
                }

                // reddit

                // example of a reddit link 
                //  https://www.reddit.com/r/GCSE/comments/kv1pny/leak_of_gcse_algorithm_to_find_grades/?utm_source=share&utm_medium=web2x&context=3

                if (this.settings.reddit) {
                    if (msgcontent.includes("https://www.reddit.com")){
                        const post = /(https:\/\/www.reddit.com\/r\/\w+\/comments\/\w+\/\w+\/)/g.exec(msgcontent)[0];

                        Logger.info(post)
                        Logger.info(msgcontent)

                        msgcontent = msgcontent.replace(/(https:\/\/www.reddit.com\/r\/\w+\/comments\/\w+\/[_=&a-z1-9]*\/[?a-z_=&1-9]*)/g, post);

                        Logger.info(msgcontent)

                        if (this.settings.showToasts)
                        {
                            Toasts.success("Succesfully removed tracker from reddit link!");
                        }
                    }
                }

                // Changes our new message back to the original message
                a[1].content = msgcontent;

            });
        }

        onStop() {
            Patcher.unpatchAll();
            Logger.info("Disabling removeTrackingURL!");
        }

        getSettingsPanel() {
            return Settings.SettingPanel.build(this.saveSettings.bind(this), 
                new Settings.Switch("Twitter","Remove twitter tracking URL", this.settings.twitter, (i) => {this.settings.twitter = i;}),
                new Settings.Switch("Reddit","Remove reddit tracking URL", this.settings.reddit, (i) => {this.settings.reddit = i;}),
                new Settings.Switch("Show Toasts", "Show a toast when removing trackers", this.settings.showToasts, (i) => {this.settings.showToasts = i;}),
                new Settings.Switch("Project", "When recieving an incoming meesage, remove trackers from that too.", this.settings.project, (i) => {this.settings.project = i;}),

                new Settings.SettingGroup("Advanced").append(
                    new Settings.Switch("FXtwitter","Automatically convert twitter links to FXtwitter links", this.settings.FXtwitter, (i) => {this.settings.FXtwitter = i;}),
                    new Settings.Switch("VXtwitter","Automatically convert twitter links to VXtwitter links", this.settings.VXtwitter, (i) => {this.settings.VXtwitter = i;})
                ),
            );
        }
    };

};