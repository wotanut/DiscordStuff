/**
 * 
 * @param {import("zerespluginlibrary").Plugin} Plugin 
 * @param {import("zerespluginlibrary").BoundAPI} Library 
 * @returns 
 */
module.exports = (Plugin, Library) => {

    const {Logger, Settings, Patcher, DiscordModules} = Library;

    const {PopoutStack} = DiscordModules;

    const BD_BADGE_URL = "";
    const SAMBOT_BADGE_URL = "";
    
    return class extends Plugin {
        constructor() {
            super();
            this.defaultSettings = {};
            this.defaultSettings.BD = true;
            this.defaultSettings.Sambot = true;
        }

        onStart() {
            Logger.info("Plugin enabled!");

            Patcher.after(DiscordModules.PopoutStack, "open", (_, args, ret) => {
                Logger.info("Opened user popout!");
            });

        }

        onStop() {
            Patcher.unpatchAll();
            Logger.info("Plugin disabled!");
        }

        getSettingsPanel() {
            return Settings.SettingPanel.build(this.saveSettings.bind(this), 
                new Settings.Switch("BetterDiscord developers", "Show Badges for BetterDiscord develoeprs and plugin/theme makers.", this.settings.BD, (i) => {
                        this.settings.BD = i;
                    }),
                new Settings.Switch("Show Sambot", "Show a badge for Sambot (the plugin developer).", this.settings.Sambot, (i) => {
                        this.settings.Sambot = i;
                    }),
            );
        }
    };

};