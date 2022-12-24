/**
 * @name BetterIcons
 * @description Changes the icons around discord
 * @version 1.0.0
 * @author wotanut
 * @authorId 705798778472366131
 * @website https://github.com/wotanut
 * @source https://raw.githubusercontent.com/wotanut/BetterDiscordStuff/main/plugins/BetterIcons/dist/BetterIcons.plugin.js
 * @donate https://ko-fi.com/wotanut
 * @invite 2w5KSXjhGe
 */
/*@cc_on
@if (@_jscript)
    
    // Offer to self-install for clueless users that try to run this directly.
    var shell = WScript.CreateObject("WScript.Shell");
    var fs = new ActiveXObject("Scripting.FileSystemObject");
    var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\\BetterDiscord\\plugins");
    var pathSelf = WScript.ScriptFullName;
    // Put the user at ease by addressing them in the first person
    shell.Popup("It looks like you've mistakenly tried to run me directly. \n(Don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
    if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
        shell.Popup("I'm in the correct folder already.", 0, "I'm already installed", 0x40);
    } else if (!fs.FolderExists(pathPlugins)) {
        shell.Popup("I can't find the BetterDiscord plugins folder.\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
    } else if (shell.Popup("Should I copy myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
        fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
        // Show the user where to put plugins in the future
        shell.Exec("explorer " + pathPlugins);
        shell.Popup("I'm installed!", 0, "Successfully installed", 0x40);
    }
    WScript.Quit();

@else@*/
const config = {
    info: {
        name: "BetterIcons",
        authors: [
            {
                name: "wotanut",
                discord_id: "705798778472366131",
                github_username: "wotanut",
                twitter_username: "wotanut1",
                authorLink: "https://github.com/wotanut"
            }
        ],
        version: "1.0.0",
        description: "Changes the icons around discord",
        website: "https://github.com/wotanut",
        github: "https://github.com/wotanut/BetterIcons",
        github_raw: "https://raw.githubusercontent.com/wotanut/BetterDiscordStuff/main/plugins/BetterIcons/dist/BetterIcons.plugin.js",
        donate: "https://ko-fi.com/wotanut",
        invite: "2w5KSXjhGe"
    },
    changelog: [
        {
            title: "New Stuff",
            items: [
                "The plugin is done :D"
            ]
        }
    ],
    defaultConfig: [],
    main: "index.js"
};
class Dummy {
    constructor() {this._config = config;}
    start() {}
    stop() {}
}
 
if (!global.ZeresPluginLibrary) {
    BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.name ?? config.info.name} is missing. Please click Download Now to install it.`, {
        confirmText: "Download Now",
        cancelText: "Cancel",
        onConfirm: () => {
            require("request").get("https://betterdiscord.app/gh-redirect?id=9", async (err, resp, body) => {
                if (err) return require("electron").shell.openExternal("https://betterdiscord.app/Download?id=9");
                if (resp.statusCode === 302) {
                    require("request").get(resp.headers.location, async (error, response, content) => {
                        if (error) return require("electron").shell.openExternal("https://betterdiscord.app/Download?id=9");
                        await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), content, r));
                    });
                }
                else {
                    await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));
                }
            });
        }
    });
}
 
module.exports = !global.ZeresPluginLibrary ? Dummy : (([Plugin, Api]) => {
     const plugin = (Plugin, Library) => {

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
     return plugin(Plugin, Api);
})(global.ZeresPluginLibrary.buildPlugin(config));
/*@end@*/