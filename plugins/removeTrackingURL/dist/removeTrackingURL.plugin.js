/**
 * @name removeTrackingURL
 * @description Removes tracking URLS from certain websites
 * @version 1.0.0
 * @author wotanut
 * @authorId 705798778472366131
 * @website https://github.com/wotanut
 * @source https://raw.githubusercontent.com/wotanut/BetterDiscordStuff/main/plugins/removeTrackingURL/dist/removeTrackingURL.plugin.js?token=GHSAT0AAAAAABYFCAO3ZC3LX7WVQBVZVOR2Y3EJB7Q
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
        name: "removeTrackingURL",
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
        description: "Removes tracking URLS from certain websites",
        website: "https://github.com/wotanut",
        github: "https://github.com/wotanut/removeTrackingURL",
        github_raw: "https://raw.githubusercontent.com/wotanut/BetterDiscordStuff/main/plugins/removeTrackingURL/dist/removeTrackingURL.plugin.js?token=GHSAT0AAAAAABYFCAO3ZC3LX7WVQBVZVOR2Y3EJB7Q",
        donate: "https://ko-fi.com/wotanut",
        invite: "2w5KSXjhGe"
    },
    changelog: [
        {
            title: "New Stuff",
            items: [
                "Base plugin configuration.",
                "Added changelog."
            ]
        },
        {
            title: "On-going",
            type: "progress",
            items: [
                "Actual Development"
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
                    const channel = ChannelStore.getChannel(message.channel_id);
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
     return plugin(Plugin, Api);
})(global.ZeresPluginLibrary.buildPlugin(config));
/*@end@*/