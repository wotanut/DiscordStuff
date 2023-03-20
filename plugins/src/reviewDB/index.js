/**
 * 
 * @param {import("zerespluginlibrary").Plugin} Plugin 
 * @param {import("zerespluginlibrary").BoundAPI} Library 
 * @returns 
 */
module.exports = (Plugin, Library) => {

    const {Logger, Patcher, Settings, DiscordModules} = Library;

    const { UserNoteStore } = DiscordModules;
    
    return class extends Plugin {

        onStart() {
            Logger.info("Plugin reviewDB enabled!");

            Patcher.before(DiscordModules.UserNoteStore, "getNote", (t,a) => {
                // If discord is getting a note then either the user is opening a user popout or the user is in a dm, either way we need to render the reviewDB.
                Logger.info("Opened User Popout");
            });

        }

        onStop() {
            Patcher.unpatchAll();
            Logger.info("Plugin reviewDB disabled!");
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