/**
 * @name reviewDB
 * @description Review and see reviews of other users 
 * @version 1.0.4
 * @author Sambot
 * @authorId 705798778472366131
 * @website https://sblue.tech
 * @source https://raw.githubusercontent.com/wotanut/DiscordStuff/main/plugins/dist/reviewDB.plugin.js
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
        name: "reviewDB",
        authors: [
            {
                name: "Sambot",
                discord_id: "705798778472366131",
                github_username: "wotanut",
                twitter_username: "wotanut1",
                authorLink: "https://github.com/wotanut"
            }
        ],
        version: "1.0.4",
        description: "Review and see reviews of other users ",
        website: "https://sblue.tech",
        github: "https://github.com/wotanut/betterdiscordstuff",
        github_raw: "https://raw.githubusercontent.com/wotanut/DiscordStuff/main/plugins/dist/reviewDB.plugin.js",
        donate: "https://ko-fi.com/wotanut",
        invite: "2w5KSXjhGe"
    },
    changelog: [
        {
            title: "New Stuff",
            items: [
                "Added mirror settings",
                "Changed internals",
                "Moved file around"
            ]
        },
        {
            title: "Bug Fixes",
            type: "fixed",
            items: [
                "Fixed a bug where the plugin would not change reddit links",
                "Incorrect external links in settings panel"
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
     return plugin(Plugin, Api);
})(global.ZeresPluginLibrary.buildPlugin(config));
/*@end@*/