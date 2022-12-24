/**
 * 
 * @param {import("zerespluginlibrary").Plugin} Plugin 
 * @param {import("zerespluginlibrary").BoundAPI} Library 
 * @returns 
 */
module.exports = (Plugin, Library) => {

    const {DiscordModules, Logger, Patcher, Settings, Toasts} = Library;
    const {MessageActions,Dispatcher, ChannelStore} = DiscordModules;
    
    return class extends Plugin {
        constructor() {
            super();
            this.defaultSettings = {};
            this.defaultSettings.github = true;

            /* ADVANCED SETTINGS */

            this.defaultSettings.FXtwitter = false;
            this.defaultSettings.VXtwitter = false;
        }

        onStart() {
            Logger.info("BetterIcons enabled!");
            Patcher.before(DiscordModules.ChannelStore, "CHANNEL_SELECT", (_, args) => {
                const event = args[0]
                Logger.warn(event)
            });
        }

        onStop() {
            Patcher.unpatchAll();
            Logger.info("BetterIcons disabled!");
        }

        getSettingsPanel() {
            return Settings.SettingPanel.build(this.saveSettings.bind(this), 
                new Settings.SettingGroup("General").append(
                    new Settings.Switch("GitHub", "Enable GitHub icon", this.settings.github, (i) => {
                        this.settings.github = i;
                    })
                ),
                new Settings.SettingGroup("Advanced").append(
                    new Settings.Switch("Guild list", "Select which guilds to enable the plugin for", this.settings.FXtwitter, (i) => {
                        this.settings.FXtwitter = i;
                    })
                )
            );
        }
    };

};