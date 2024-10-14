/**
 * 
 * @param {import("zerespluginlibrary").Plugin} Plugin 
 * @param {import("zerespluginlibrary").BoundAPI} Library 
 * @returns 
 */
module.exports = (Plugin, Library) => {

    const { DiscordModules, Logger, Patcher, Settings, Toasts } = Library;
    const { Dispatcher } = DiscordModules;

    class Site {
        constructor(name, on, domains, tracker_param_regex, regex, replace_domain) {
            this.name = name;
            this.on = on;
            this.domains = domains;
            this.tracker_param_regex = tracker_param_regex;
            this.regex = regex;
            this.replace_domain = replace_domain;
        }

        cleanTrackers(content) {
            return content.split('&').filter(
                variable => variable.split("=")[0].match(this.tracker_param_regex) == null
                ).join('&');
        }

        sanitizeUrls(content) {
            var trackers = content.match(this.regex)
            var changed = false

            if (trackers == null) { return [content, changed]; } // check if there's no trackers

            trackers.forEach( url => {
                    var split_content = url.split('?')
                    var cleaned = this.cleanTrackers(split_content[1])
                    if (cleaned != split_content[1]) {
                        changed = true
                        content = content.replace(
                            url,
                            [split_content[0], cleaned].join('?')
                        )
                    }
                }
            );

            return [content, changed];
        }

        checkFor(content, showToasts, isFromSomeoneElse) {
            if (!this.on) { return content; }

            if (this.domains.some(domain => content.includes(domain))) {
                var [new_content, changed] = this.sanitizeUrls(content);

                if (this.replace_domain != null && this.replace_domain != "") {
                    this.domains.forEach( domain =>
                        new_content = new_content.replace(domain, this.replace_domain))
                }

                if (showToasts && changed) {
                    if (isFromSomeoneElse) {
                        Toasts.success("Succesfully removed tracker from incoming " + this.name + " link!");
                    } else {
                        Toasts.success("Succesfully removed tracker from " + this.name + " link!");
                    }
                }

                return new_content;
            }

            return content;
        }
    }

    const DEFAULT_SITES = {
        "twitter": new Site("Twitter/X", true, ["twitter.com", "x.com"], /(.+)/g, /((https?:\/\/)?(www\.)?(twitter|x).com\/\w+\/status\/\d+\?\S+)/g, null),
        "reddit": new Site("Reddit", true, ["reddit.com"], /(.+)/g, /((https?:\/\/)?(www\.)?reddit\.com\/\S+)/g, null),
        "spotify": new Site("Spotify", true, ["open.spotify.com"], /(.+)/g, /((https?:\/\/)?(www\.)?open\.spotify\.com\/(track|album|user|artist|playlist)\/\w+\?\S+)/g, null),
        "youtube": new Site("Youtube", true, ["youtu.be"], /(si)/g, /((https?:\/\/)?(www\.)?youtu\.be\/[^\s\?]+\?\S+)/g, null),
        // I would be adding this, but I can't access AliExpress for some reason.  Oh no, how terrible...
        "aliexpress": new Site("AliExpress", true, ["aliexpress.us", "aliexpress.com"], /(.+)/g, /((https?:\/\/)?(www\.)?aliexpress.(us|com)\/\S+)/g, null)
    }

    // I'm hoping to add ability for custom sites to be added soon.
    // I am not going to be doing that.  The framework is mostly there, though.

    return class extends Plugin {
        constructor() {
            super();
            this.defaultSettings = {};
            this.defaultSettings.defaultSites = {};
            this.defaultSettings.showToasts = false;
            this.defaultSettings.project = true;
        }

        // this is really scuffed, pretty much like this because I don't know how BD persistence really works.
        updateSettings() {
            for (var name in DEFAULT_SITES) {
                // update defaultSites settings dict with if the site is on and if they're replacing the domain to a value
                this.settings.defaultSites[name] = [DEFAULT_SITES[name].on, DEFAULT_SITES[name].replace_domain]
            }
        }

        // see above for comment on scuffedness
        retrieveSettings() {
            // retrieve old settings from previous version (backwards compatibility is hard)
            for (var name in DEFAULT_SITES) {
                if (this.settings.hasOwnProperty(name)) {
                    DEFAULT_SITES[name].on = this.settings[name];
                    // this.settings.remove(name); // keep commented until certain everything works
                }
            }

            // * special cases *
            if (this.settings.hasOwnProperty("VXtwitter")) {
                DEFAULT_SITES.twitter.replace_domain = "c.vxtwitter.com";
                // this.settings.remove("VXtwitter"); // keep commented until certain everything works
            }
            if (this.settings.hasOwnProperty("FXtwitter")) {
                // this one was said to differentiate between twitter and x links.  Did at one point, not anymore.
                // https://github.com/wotanut/DiscordStuff/commit/daf88efa71631af5a8b0dadb1760153f1dad8997
                DEFAULT_SITES.twitter.replace_domain = "fxtwitter.com";
                // this.settings.remove("VXtwitter"); // keep commented until certain everything works
            }

            // update what is there in settings.defaultSites
            for (var name in this.settings.defaultSites) {
                [DEFAULT_SITES[name].on, DEFAULT_SITES[name].replace_domain] = this.settings.defaultSites[name]
            }
        }

        removeTracker(event, isFromSomeoneElse = false) {
            if (isFromSomeoneElse) {
                var msgcontent = event
            } else {
                var msgcontent = event[1].content
            }

            for (var name in DEFAULT_SITES) {
                msgcontent = DEFAULT_SITES[name].checkFor(msgcontent, this.settings.showToasts, isFromSomeoneElse);
            }

            // Changes our new message back to the original message
            return msgcontent;
        }

        onStart() {
            Logger.info("Enabling removeTrackingURL!");

            // make sure to load settings correctly
            this.retrieveSettings();
            // make sure settings are set up correctly (if on first launch, populates defaultSites dict, and also cleans up data from past versions)
            this.updateSettings();

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
                        if (event.message.author.id == DiscordModules.UserStore.getCurrentUser().id) {
                            return;
                        }
                        event.message.content = this.removeTracker(event.message.content, true);
                    }
                }
            });

        }

        onStop() {
            Patcher.unpatchAll();
            Logger.info("Disabling removeTrackingURL!");
        }

        makeButton(name, displayName){
            return new Settings.Switch(
                displayName,
                "Remove " + displayName + " tracking URLs",
                DEFAULT_SITES[name].on,
                (i) => { DEFAULT_SITES[name].on = i; this.updateSettings(); }
            );
        }

        getSettingsPanel() {

            const panel = new Settings.SettingPanel(this.saveSettings.bind(this));

            // names seem to be in order of how they're put into the mapping, so not bothering to sort them
            for (var name in DEFAULT_SITES) {
                panel.append(this.makeButton(name, DEFAULT_SITES[name].name));
            }

            panel.append(
                new Settings.Switch("Show Toasts", "Show a toast when removing trackers", this.settings.showToasts, (i) => { this.settings.showToasts = i; }),
                new Settings.Switch("Project", "When receiving an incoming message, remove trackers from that too.", this.settings.project, (i) => { this.settings.project = i; }),

                // I tried to make these mutually exclusive.  Can't make the react element update, though.
                // I also recommend against continuing to do this, because this is *not* the stated intent of the plugin.
                // Other plugins (like SocialMediaLinkConverter and TextReplacer) do this job better
                new Settings.SettingGroup("Advanced").append(
                    new Settings.Switch("FXtwitter","Automatically convert twitter and x links to FXtwitter links", DEFAULT_SITES.twitter.replace_domain == "fxtwitter.com", (i) => {
                        if (i) {
                            DEFAULT_SITES.twitter.replace_domain = "fxtwitter.com";
                        } else if (DEFAULT_SITES.twitter.replace_domain == "fxtwitter.com") {
                            DEFAULT_SITES.twitter.replace_domain = null;
                        }
                        this.updateSettings();
                    }),
                    new Settings.Switch("VXtwitter","Automatically convert twitter and x links to VXtwitter links", DEFAULT_SITES.twitter.replace_domain == "c.vxtwitter.com", (i) => {
                        if (i) {
                            DEFAULT_SITES.twitter.replace_domain = "c.vxtwitter.com";
                        } else if (DEFAULT_SITES.twitter.replace_domain == "c.vxtwitter.com") {
                            DEFAULT_SITES.twitter.replace_domain = null;
                        }
                        this.updateSettings();
                    })
                ),
            );

            return panel.GetElement();
        }
    };

};