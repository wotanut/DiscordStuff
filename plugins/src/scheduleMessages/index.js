/**
 * 
 * @param {import("zerespluginlibrary").Plugin} Plugin 
 * @param {import("zerespluginlibrary").BoundAPI} Library 
 * @returns 
 */
module.exports = (Plugin, Library) => {

    const css = require("styles.css");
    const buttonHTML = require("button.html");
    const {DiscordSelectors, DOMTools} = Api;

    const {DiscordModules, Logger, Patcher, Settings, Toasts, Modals, ContextMenu} = Library;


    return class extends Plugin {
        constructor() {
            super();
            
        }

        onStart() {
            Logger.info("Enabling scheduleMessages!");

            DOMTools.addStyle(this.getName(), css);
            if (document.querySelector("form")) this.addButton(document.querySelector("form"));

        }

        onStop() {
            const button = document.querySelector(".scheduleMessages-button");
            if (button) button.remove();
            DOMTools.removeStyle(this.getName());

            Logger.info("Disabling scheduleMessages!");
        }

        addButton(elem) {
            if (elem.querySelector(".scheduleMessages-button")) return;
            const button = DOMTools.createElement(buttonHTML);
            elem.querySelector(DiscordSelectors.Textarea.inner).append(button);

            DOMTools.on(button,"click", () => {
                Logger.info("Button Clicked");
                // show modal

                var menu = ContextMenu.buildMenuChildren([
                    {
                        type: "toggle",
                        label: "Toggle",
                        checked: false,
                        callback: () => {
                            Logger.info("Toggle Clicked");
                        }
                    },
                ])

                ContextMenu.openContextMenu({x: 0, y: 0}, ContextMenu.buildMenu(menu));


                Logger.info("Modal Shown");


                Modals.showModal("Schedule Message", "When would you like to schedule this message for?", {
                    danger: false,
                    confirmText: "Schedule",
                    cancelText: "Cancel",
                    onConfirm: () => {
                        Logger.info("Confirm Clicked");
                        // close the modal, store neccesary data and then wait
                    },
                })

                Modals.showModal("Schedule Message", "Are you sure you want to schedule this message?", {
                    danger: false,
                    confirmText: "Schedule",
                })

                
            });

            // button.on("click", () => {
            //     const textarea = button.siblings("textarea")[0];
            //     const press = new KeyboardEvent("keypress", {key: "Enter", code: "Enter", which: 13, keyCode: 13, bubbles: true});
            //     Object.defineProperties(press, {keyCode: {value: 13}, which: {value: 13}});
            //     textarea.dispatchEvent(press);
            // });
        }

        observer(e) {
            if (!e.addedNodes.length || !(e.addedNodes[0] instanceof Element)) return;
            if (e.addedNodes[0].querySelector(DiscordSelectors.Textarea.inner)) {
                this.addButton(e.addedNodes[0]);
            }
        }

    };

};