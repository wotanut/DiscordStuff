/**
 * @name clock
 * @description Adds a clock in the profile panel.
 * @version 1.0.0
 * @author Sambot
 * @authorId 705798778472366131
 * @website https://sblue.tech
 * @source https://raw.githubusercontent.com/wotanut/DiscordStuff/main/plugins/dist/removeTrackingURL.plugin.js
 * @donate https://github.com/sponsors/wotanut
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
        name: "clock",
        authors: [
            {
                name: "Sambot",
                discord_id: "705798778472366131",
                github_username: "wotanut",
                twitter_username: "wotanut1",
                authorLink: "https://github.com/wotanut"
            }
        ],
        version: "1.0.0",
        description: "Adds a clock in the profile panel.",
        website: "https://sblue.tech",
        github: "https://github.com/wotanut/betterdiscordstuff",
        github_raw: "https://raw.githubusercontent.com/wotanut/DiscordStuff/main/plugins/dist/removeTrackingURL.plugin.js",
        donate: "https://github.com/sponsors/wotanut",
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
                "Fixed a bug where plugin would send http,www after removing trackers."
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

    const {Logger} = Library;
    const {DiscordSelectors, PluginUtilities, DOMtools} = Api;
    const css = `#clock {
    position: absolute;
    top: 0;
    right: 0;
    padding: 0 10px;
    font-size: 1.5em;
    font-weight: bold;
    color: #fff;
    background: #000;
    opacity: 0.5;
    -webkit-transition: opacity 0.5s;
    -moz-transition: opacity 0.5s;
    -o-transition: opacity 0.5s;
    transition: opacity 0.5s;
}`

    return class extends Plugin {

        // fix the config.json

        onStart() {
            Logger.info("Clock enabled!");

            setInterval(() => {
                Logger.info(new Date().toTimeString());
            }, 1000);

            // const clock = DOMtools.addStyle("clock", css)

            // // const clock = DOMtools.createElement(`<div class="clock">00:00:00</div>`);
            // document.querySelector(DiscordSelectors.AppMount).appendChild(clock);

            const clock = DOMtools.createElement($`<div class="clock">${new Date().toTimeString()}</div>`);
            document.querySelector(DiscordSelectors.AppMount).appendChild(clock);
            


        }

        onStop() {
            Logger.info("Clock disabled!");
        }
    };

};
     return plugin(Plugin, Api);
})(global.ZeresPluginLibrary.buildPlugin(config));
/*@end@*/