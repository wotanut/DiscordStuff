/**
 * 
 * @param {import("zerespluginlibrary").Plugin} Plugin 
 * @param {import("zerespluginlibrary").BoundAPI} Library 
 * @returns 
 */
module.exports = (Plugin, Library) => {

    const { DiscordModules, Logger, Patcher, Settings, Toasts } = Library;
    const { Dispatcher } = DiscordModules;

    const REGEX = {
        "twitter": /(https:\/\/twitter.com\/\w+\/status\/\d+\?*\S+)/g,
        "reddit": /((?:https|http)\:\/\/(?:www\.)?reddit\.com\/\S+)/g,
        "spotify": /(https:\/\/open\.spotify\.com\/(track|album|user|artist|playlist)\/\w+\?\S+)/g,
        "x": /(https:\/\/x.com\/\w+\/status\/\d+\?[a-zA-Z0-9=&]*)/g
    }

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

        sanitizeUrls(content, regex) {
            var trackers = content.match(regex)

            if (trackers == null) { return content; } // check if there's no trackers
                
            trackers.forEach( url =>
                content = content.replace(url, url.split('?')[0])
            );

            return content;
        }

        removeTracker(event, isFromSomeoneEsle = false) {
            if (isFromSomeoneEsle) {
                var msgcontent = event
            } else {
                var msgcontent = event[1].content
            }
            // twitter

            // example of a twitter link 
            // https://twitter.com/SoVeryBritish/status/1555115704839553024?s=20&t=a2A24ImVWWDElGic3hTwNg

            // if it includes the twitter or x url then it'll flow down here and appropriately remove the trackers and update the url.
            // note: for those of you who /care/ so much about speed you will get a very slight performance increase if you use VXtwitter.
            if (this.settings.twitter) {
                if (msgcontent.includes("https://twitter.com") || msgcontent.includes("https://x.com")) {

                    msgcontent = this.sanitizeUrls(msgcontent, REGEX.twitter);
                    msgcontent = this.sanitizeUrls(msgcontent, REGEX.x); // just in case it's a stupid X link

                    if (this.settings.VXtwitter) {
                        msgcontent = msgcontent.replace("https://twitter.com", "https://c.vxtwitter.com");
                        msgcontent = msgcontent.replace("https://x.com", "https://c.vxtwitter.com");
                    } else if (this.settings.FXtwitter) {
                        msgcontent = msgcontent.replace("https://twitter.com", "https://fxtwitter.com");
                        msgcontent = msgcontent.replace("https://x.com", "https://fxtwitter.com");
                    }

                    if (this.settings.showToasts && isFromSomeoneEsle == false) {
                        Toasts.success("Succesfully removed tracker from twitter link!");
                    }
                }
            }

            // reddit

            // example of a reddit link 
            //  https://www.reddit.com/r/GCSE/comments/kv1pny/leak_of_gcse_algorithm_to_find_grades/?utm_source=share&utm_medium=web2x&context=3

            if (this.settings.reddit) {
                if (msgcontent.includes("https://www.reddit.com")) {
                    msgcontent = this.sanitizeUrls(msgcontent, REGEX.reddit);

                    // NOTE: The .split is required becuase of this issue
                    // https://stackoverflow.com/questions/74923286/url-pathname-sending-the-pathname-followed-by-https-www

                    if (this.settings.showToasts && isFromSomeoneEsle == false) {
                        Toasts.success("Succesfully removed tracker from reddit link!");
                    }
                }
            }
             if (this.settings.spotify) {
                if (msgcontent.includes("https://open.spotify.com")) {
                    msgcontent = this.sanitizeUrls(msgcontent, REGEX.spotify);

                    if (this.settings.showToasts && isFromSomeoneEsle == false) {
                        Toasts.success("Succesfully removed tracker from Spotify link!");
        }
    }
}

            // Changes our new message back to the original message
            return msgcontent;
        }

        onStart() {
            Logger.info("Enabling removeTrackingURL!");

            // for removing trackers on sent messages

            Patcher.before(DiscordModules.MessageActions, "sendMessage", (t, a) => {
                a[1].content = this.removeTracker(a, false);
            });

            // for removing trackers on incoming messages (assuming you have the project setting enabled)

            Patcher.before(Dispatcher, "dispatch", (_, args) => {
                var event = args[0]

                // Logger.info(event.type);

                if (event.type === "MESSAGE_CREATE") {
                    if (this.settings.project) {
                        if (event.message.content.includes(".reddit.com") == false && event.message.content.includes(".twitter.com") == false) {
                            return;
                        }
                        if (event.message.author.id == DiscordModules.UserStore.getCurrentUser().id) {
                            return;
                        }
                        event.message.content = this.removeTracker(event.message.content, true);
                        Logger.info("Removed Message");
                    }
                }
            });

        }

        onStop() {
            Patcher.unpatchAll();
            Logger.info("Disabling removeTrackingURL!");
        }

        getSettingsPanel() {
            return Settings.SettingPanel.build(this.saveSettings.bind(this),
                new Settings.Switch("Twitter/X","Remove twitter and x tracking URL", this.settings.twitter, (i) => {this.settings.twitter = i;}),
                new Settings.Switch("Reddit", "Remove reddit tracking URL", this.settings.reddit, (i) => { this.settings.reddit = i; }),
                new Settings.Switch("Spotify", "Remove Spotify tracking URL", this.settings.spotify, (i) => { this.settings.spotify = i; }),
                new Settings.Switch("Show Toasts", "Show a toast when removing trackers", this.settings.showToasts, (i) => { this.settings.showToasts = i; }),
                new Settings.Switch("Project", "When recieving an incoming meesage, remove trackers from that too.", this.settings.project, (i) => { this.settings.project = i; }),

                new Settings.SettingGroup("Advanced").append(
                    new Settings.Switch("FXtwitter/FixUpX","Automatically convert twitter and x links to FXtwitter/FixupX links respectively", this.settings.FXtwitter, (i) => {this.settings.FXtwitter = i;}),
                    new Settings.Switch("VXtwitter","Automatically convert twitter and x links to VXtwitter links", this.settings.VXtwitter, (i) => {this.settings.VXtwitter = i;})
                ),
            );
        }
    };

};
