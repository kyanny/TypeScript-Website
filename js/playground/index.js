define(["require", "exports", "./sidebar/showJS", "./createElements", "./sidebar/showDTS", "./sidebar/runtime", "./exporter", "./createUI", "./getExample", "./monaco/ExampleHighlight", "./createConfigDropdown", "./sidebar/showErrors", "./sidebar/options", "./pluginUtils"], function (require, exports, showJS_1, createElements_1, showDTS_1, runtime_1, exporter_1, createUI_1, getExample_1, ExampleHighlight_1, createConfigDropdown_1, showErrors_1, options_1, pluginUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const defaultPluginFactories = [showJS_1.compiledJSPlugin, showDTS_1.showDTSPlugin, showErrors_1.showErrors, runtime_1.runPlugin, options_1.optionsPlugin];
    exports.setupPlayground = (sandbox, monaco, config, i, react) => {
        const playgroundParent = sandbox.getDomNode().parentElement.parentElement.parentElement;
        const dragBar = createElements_1.createDragBar();
        playgroundParent.appendChild(dragBar);
        const sidebar = createElements_1.createSidebar();
        playgroundParent.appendChild(sidebar);
        const tabBar = createElements_1.createTabBar();
        sidebar.appendChild(tabBar);
        const container = createElements_1.createPluginContainer();
        sidebar.appendChild(container);
        const plugins = [];
        const tabs = [];
        const registerPlugin = (plugin) => {
            plugins.push(plugin);
            const tab = createElements_1.createTabForPlugin(plugin);
            tabs.push(tab);
            const tabClicked = e => {
                const previousPlugin = currentPlugin();
                const newTab = e.target;
                const newPlugin = plugins.find(p => p.displayName == newTab.textContent);
                createElements_1.activatePlugin(newPlugin, previousPlugin, sandbox, tabBar, container);
            };
            tabBar.appendChild(tab);
            tab.onclick = tabClicked;
        };
        const currentPlugin = () => {
            const selectedTab = tabs.find(t => t.classList.contains('active'));
            return plugins[tabs.indexOf(selectedTab)];
        };
        const initialPlugins = defaultPluginFactories.map(f => f(i));
        initialPlugins.forEach(p => registerPlugin(p));
        // Choose which should be selected
        const priorityPlugin = plugins.find(plugin => plugin.shouldBeSelected && plugin.shouldBeSelected());
        const selectedPlugin = priorityPlugin || plugins[0];
        const selectedTab = tabs[plugins.indexOf(selectedPlugin)];
        selectedTab.onclick({ target: selectedTab });
        let debouncingTimer = false;
        sandbox.editor.onDidChangeModelContent(_event => {
            const plugin = currentPlugin();
            if (plugin.modelChanged)
                plugin.modelChanged(sandbox, sandbox.getModel());
            // This needs to be last in the function
            if (debouncingTimer)
                return;
            debouncingTimer = true;
            setTimeout(() => {
                debouncingTimer = false;
                playgroundDebouncedMainFunction();
                // Only call the plugin function once every 0.3s
                if (plugin.modelChangedDebounce && plugin.displayName === currentPlugin().displayName) {
                    plugin.modelChangedDebounce(sandbox, sandbox.getModel());
                }
            }, 300);
        });
        // Sets the URL and storage of the sandbox string
        const playgroundDebouncedMainFunction = () => {
            const alwaysUpdateURL = !localStorage.getItem('disable-save-on-type');
            if (alwaysUpdateURL) {
                const newURL = sandbox.createURLQueryWithCompilerOptions(sandbox);
                window.history.replaceState({}, '', newURL);
            }
            localStorage.setItem('sandbox-history', sandbox.getText());
        };
        // When any compiler flags are changed, trigger a potential change to the URL
        sandbox.setDidUpdateCompilerSettings(() => {
            playgroundDebouncedMainFunction();
            // @ts-ignore
            window.appInsights.trackEvent({ name: 'Compiler Settings changed' });
            const model = sandbox.editor.getModel();
            const plugin = currentPlugin();
            if (model && plugin.modelChanged)
                plugin.modelChanged(sandbox, model);
            if (model && plugin.modelChangedDebounce)
                plugin.modelChangedDebounce(sandbox, model);
        });
        // Setup working with the existing UI, once it's loaded
        // Versions of TypeScript
        // Set up the label for the dropdown
        document.querySelectorAll('#versions > a').item(0).innerHTML = 'v' + sandbox.ts.version + " <span class='caret'/>";
        // Add the versions to the dropdown
        const versionsMenu = document.querySelectorAll('#versions > ul').item(0);
        const notWorkingInPlayground = ['3.1.6', '3.0.1', '2.8.1', '2.7.2', '2.4.1'];
        const allVersions = [
            '3.9.0-beta',
            ...sandbox.supportedVersions.filter(f => !notWorkingInPlayground.includes(f)),
            'Nightly'
        ];
        allVersions.forEach((v) => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.textContent = v;
            a.href = '#';
            if (v === "Nightly") {
                li.classList.add("nightly");
            }
            if (v.toLowerCase().includes("beta")) {
                li.classList.add("beta");
            }
            li.onclick = () => {
                const currentURL = sandbox.createURLQueryWithCompilerOptions(sandbox);
                const params = new URLSearchParams(currentURL.split('#')[0]);
                const version = v === 'Nightly' ? 'next' : v;
                params.set('ts', version);
                const hash = document.location.hash.length ? document.location.hash : '';
                const newURL = `${document.location.protocol}//${document.location.host}${document.location.pathname}?${params}${hash}`;
                // @ts-ignore - it is allowed
                document.location = newURL;
            };
            li.appendChild(a);
            versionsMenu.appendChild(li);
        });
        // Support dropdowns
        document.querySelectorAll('.navbar-sub li.dropdown > a').forEach(link => {
            const a = link;
            a.onclick = _e => {
                if (a.parentElement.classList.contains('open')) {
                    document.querySelectorAll('.navbar-sub li.open').forEach(i => i.classList.remove('open'));
                }
                else {
                    document.querySelectorAll('.navbar-sub li.open').forEach(i => i.classList.remove('open'));
                    a.parentElement.classList.toggle('open');
                    const exampleContainer = a
                        .closest('li')
                        .getElementsByTagName('ul')
                        .item(0);
                    // Set exact height and widths for the popovers for the main playground navigation
                    const isPlaygroundSubmenu = !!a.closest('nav');
                    if (isPlaygroundSubmenu) {
                        const playgroundContainer = document.getElementById('playground-container');
                        exampleContainer.style.height = `calc(${playgroundContainer.getBoundingClientRect().height + 26}px - 4rem)`;
                        const sideBarWidth = document.querySelector('.playground-sidebar').offsetWidth;
                        exampleContainer.style.width = `calc(100% - ${sideBarWidth}px - 71px)`;
                    }
                }
            };
        });
        // Set up some key commands
        sandbox.editor.addAction({
            id: 'copy-clipboard',
            label: 'Save to clipboard',
            keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S],
            contextMenuGroupId: 'run',
            contextMenuOrder: 1.5,
            run: function (ed) {
                window.navigator.clipboard.writeText(location.href.toString()).then(() => ui.flashInfo(i('play_export_clipboard')), (e) => alert(e));
            }
        });
        sandbox.editor.addAction({
            id: 'run-js',
            label: 'Run the evaluated JavaScript for your TypeScript file',
            keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
            contextMenuGroupId: 'run',
            contextMenuOrder: 1.5,
            run: function (ed) {
                const runButton = document.getElementById('run-button');
                runButton.onclick && runButton.onclick({});
            }
        });
        const runButton = document.getElementById('run-button');
        runButton.onclick = () => {
            const run = sandbox.getRunnableJS();
            const runPlugin = plugins.find(p => p.id === 'logs');
            createElements_1.activatePlugin(runPlugin, currentPlugin(), sandbox, tabBar, container);
            runtime_1.runWithCustomLogs(run, i);
            const isJS = sandbox.config.useJavaScript;
            ui.flashInfo(i(isJS ? 'play_run_js' : 'play_run_ts'));
        };
        // Handle the close buttons on the examples
        document.querySelectorAll('button.examples-close').forEach(b => {
            const button = b;
            button.onclick = (e) => {
                const button = e.target;
                const navLI = button.closest('li');
                navLI === null || navLI === void 0 ? void 0 : navLI.classList.remove('open');
            };
        });
        createElements_1.setupSidebarToggle();
        createConfigDropdown_1.createConfigDropdown(sandbox, monaco);
        createConfigDropdown_1.updateConfigDropdownForCompilerOptions(sandbox, monaco);
        // Support grabbing examples from the location hash
        if (location.hash.startsWith('#example')) {
            const exampleName = location.hash.replace('#example/', '').trim();
            sandbox.config.logger.log('Loading example:', exampleName);
            getExample_1.getExampleSourceCode(config.prefix, config.lang, exampleName).then(ex => {
                if (ex.example && ex.code) {
                    const { example, code } = ex;
                    // Update the localstorage showing that you've seen this page
                    if (localStorage) {
                        const seenText = localStorage.getItem('examples-seen') || '{}';
                        const seen = JSON.parse(seenText);
                        seen[example.id] = example.hash;
                        localStorage.setItem('examples-seen', JSON.stringify(seen));
                    }
                    // Set the menu to be the same section as this current example
                    // this happens behind the scene and isn't visible till you hover
                    // const sectionTitle = example.path[0]
                    // const allSectionTitles = document.getElementsByClassName('section-name')
                    // for (const title of allSectionTitles) {
                    //   if (title.textContent === sectionTitle) {
                    //     title.onclick({})
                    //   }
                    // }
                    const allLinks = document.querySelectorAll('example-link');
                    // @ts-ignore
                    for (const link of allLinks) {
                        if (link.textContent === example.title) {
                            link.classList.add('highlight');
                        }
                    }
                    document.title = 'TypeScript Playground - ' + example.title;
                    sandbox.setText(code);
                }
                else {
                    sandbox.setText('// There was an issue getting the example, bad URL? Check the console in the developer tools');
                }
            });
        }
        // Sets up a way to click between examples
        monaco.languages.registerLinkProvider(sandbox.language, new ExampleHighlight_1.ExampleHighlighter());
        const languageSelector = document.getElementById('language-selector');
        const params = new URLSearchParams(location.search);
        languageSelector.options.selectedIndex = params.get('useJavaScript') ? 1 : 0;
        languageSelector.onchange = () => {
            const useJavaScript = languageSelector.value === 'JavaScript';
            const query = sandbox.createURLQueryWithCompilerOptions(sandbox, { useJavaScript: useJavaScript ? true : undefined });
            const fullURL = `${document.location.protocol}//${document.location.host}${document.location.pathname}${query}`;
            // @ts-ignore
            document.location = fullURL;
        };
        const ui = createUI_1.createUI();
        const exporter = exporter_1.createExporter(sandbox, monaco, ui);
        const playground = {
            exporter,
            ui,
            registerPlugin,
        };
        window.ts = sandbox.ts;
        window.sandbox = sandbox;
        window.playground = playground;
        console.log(`Using TypeScript ${window.ts.version}`);
        console.log('Available globals:');
        console.log('\twindow.ts', window.ts);
        console.log('\twindow.sandbox', window.sandbox);
        console.log('\twindow.playground', window.playground);
        console.log('\twindow.react', window.react);
        console.log('\twindow.reactDOM', window.reactDOM);
        /** A plugin */
        const activateExternalPlugin = (plugin, autoActivate) => {
            let readyPlugin;
            // Can either be a factory, or object
            if (typeof plugin === 'function') {
                const utils = pluginUtils_1.createUtils(sandbox, react);
                readyPlugin = plugin(utils);
            }
            else {
                readyPlugin = plugin;
            }
            if (autoActivate) {
                console.log(readyPlugin);
            }
            playground.registerPlugin(readyPlugin);
            // Auto-select the dev plugin
            const pluginWantsFront = readyPlugin.shouldBeSelected && readyPlugin.shouldBeSelected();
            if (pluginWantsFront || autoActivate) {
                // Auto-select the dev plugin
                createElements_1.activatePlugin(readyPlugin, currentPlugin(), sandbox, tabBar, container);
            }
        };
        // Dev mode plugin
        if (options_1.allowConnectingToLocalhost()) {
            window.exports = {};
            console.log('Connecting to dev plugin');
            try {
                // @ts-ignore
                const re = window.require;
                re(['local/index'], (devPlugin) => {
                    console.log('Set up dev plugin from localhost:5000');
                    try {
                        activateExternalPlugin(devPlugin, true);
                    }
                    catch (error) {
                        console.error(error);
                        setTimeout(() => {
                            ui.flashInfo('Error: Could not load dev plugin from localhost:5000');
                        }, 700);
                    }
                });
            }
            catch (error) {
                console.error('Problem loading up the dev plugin');
                console.error(error);
            }
        }
        const downloadPlugin = (plugin, autoEnable) => {
            try {
                // @ts-ignore
                const re = window.require;
                re([`unpkg/${plugin}@latest/dist/index`], (devPlugin) => {
                    activateExternalPlugin(devPlugin, autoEnable);
                });
            }
            catch (error) {
                console.error('Problem loading up the plugin:', plugin);
                console.error(error);
            }
        };
        options_1.activePlugins().forEach(p => downloadPlugin(p.module, false));
        if (location.hash.startsWith('#show-examples')) {
            setTimeout(() => {
                var _a;
                (_a = document.getElementById('examples-button')) === null || _a === void 0 ? void 0 : _a.click();
            }, 100);
        }
        if (location.hash.startsWith('#show-whatisnew')) {
            setTimeout(() => {
                var _a;
                (_a = document.getElementById('whatisnew-button')) === null || _a === void 0 ? void 0 : _a.click();
            }, 100);
        }
        const pluginToInstall = params.get('install-plugin');
        if (pluginToInstall) {
            const alreadyInstalled = options_1.activePlugins().find(p => p.module === pluginToInstall);
            console.log(options_1.activePlugins(), alreadyInstalled);
            if (!alreadyInstalled) {
                const shouldDoIt = confirm('Would you like to install the third party plugin?\n\n' + pluginToInstall);
                if (shouldDoIt) {
                    options_1.addCustomPlugin(pluginToInstall);
                    downloadPlugin(pluginToInstall, true);
                }
            }
        }
        return playground;
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wbGF5Z3JvdW5kL3NyYy9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUE4REEsTUFBTSxzQkFBc0IsR0FBb0IsQ0FBQyx5QkFBZ0IsRUFBRSx1QkFBYSxFQUFFLHVCQUFVLEVBQUUsbUJBQVMsRUFBRSx1QkFBYSxDQUFDLENBQUE7SUFFMUcsUUFBQSxlQUFlLEdBQUcsQ0FDN0IsT0FBZ0IsRUFDaEIsTUFBYyxFQUNkLE1BQXdCLEVBQ3hCLENBQTBCLEVBQzFCLEtBQW1CLEVBQ25CLEVBQUU7UUFDRixNQUFNLGdCQUFnQixHQUFHLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxhQUFjLENBQUMsYUFBYyxDQUFDLGFBQWMsQ0FBQTtRQUMxRixNQUFNLE9BQU8sR0FBRyw4QkFBYSxFQUFFLENBQUE7UUFDL0IsZ0JBQWdCLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFBO1FBRXJDLE1BQU0sT0FBTyxHQUFHLDhCQUFhLEVBQUUsQ0FBQTtRQUMvQixnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUE7UUFFckMsTUFBTSxNQUFNLEdBQUcsNkJBQVksRUFBRSxDQUFBO1FBQzdCLE9BQU8sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUE7UUFFM0IsTUFBTSxTQUFTLEdBQUcsc0NBQXFCLEVBQUUsQ0FBQTtRQUN6QyxPQUFPLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFBO1FBRTlCLE1BQU0sT0FBTyxHQUFHLEVBQXdCLENBQUE7UUFDeEMsTUFBTSxJQUFJLEdBQUcsRUFBeUIsQ0FBQTtRQUV0QyxNQUFNLGNBQWMsR0FBRyxDQUFDLE1BQXdCLEVBQUUsRUFBRTtZQUNsRCxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFBO1lBRXBCLE1BQU0sR0FBRyxHQUFHLG1DQUFrQixDQUFDLE1BQU0sQ0FBQyxDQUFBO1lBQ3RDLElB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Z0JBQWdCLENBQUMsRUFBRTtZQUM5QyxVQUFVLENBQUMsR0FBRyxFQUFFOztnQkFDZCxNQUFBLFFBQVEsQ0FBQyxjQUFjLENBQUMsaUJBQWlCLENBQUMsMENBQUUsS0FBSyxHQUFFO1lBQ3JELENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQTtTQUNSO1FBRUQsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFO1lBQy9DLFVBQVUsQ0FBQyxHQUFHLEVBQUU7O2dCQUNkLE1BQUEsUUFBUSxDQUFDLGNBQWMsQ0FBQyxrQkFBa0IsQ0FBQywwQ0FBRSxLQUFLLEdBQUU7WUFDdEQsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFBO1NBQ1I7UUFFRCxNQUFNLGVBQWUsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLENBQUE7UUFDcEQsSUFBSSxlQUFlLEVBQUU7WUFDbkIsTUFBTSxnQkFBZ0IsR0FBRyx1QkFBYSxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sS0FBSyxlQUFlLENBQUMsQ0FBQTtZQUNoRixPQUFPLENBQUMsR0FBRyxDQUFDLHVCQUFhLEVBQUUsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFBO1lBQzlDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRTtnQkFDckIsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLHVEQUF1RCxHQUFHLGVBQWUsQ0FBQyxDQUFBO2dCQUNyRyxJQUFJLFVBQVUsRUFBRTtvQkFDZCx5QkFBZSxDQUFDLGVBQWUsQ0FBQyxDQUFBO29CQUNoQyxjQUFjLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxDQUFBO2lCQUN0QzthQUNGO1NBQ0Y7UUFFRCxPQUFPLFVBQVUsQ0FBQTtJQUNuQixDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJ0eXBlIFNhbmRib3ggPSBpbXBvcnQoJ3R5cGVzY3JpcHQtc2FuZGJveCcpLlNhbmRib3hcbnR5cGUgTW9uYWNvID0gdHlwZW9mIGltcG9ydCgnbW9uYWNvLWVkaXRvcicpXG5cbmRlY2xhcmUgY29uc3Qgd2luZG93OiBhbnlcblxuaW1wb3J0IHsgY29tcGlsZWRKU1BsdWdpbiB9IGZyb20gJy4vc2lkZWJhci9zaG93SlMnXG5pbXBvcnQge1xuICBjcmVhdGVTaWRlYmFyLFxuICBjcmVhdGVUYWJGb3JQbHVnaW4sXG4gIGNyZWF0ZVRhYkJhcixcbiAgY3JlYXRlUGx1Z2luQ29udGFpbmVyLFxuICBhY3RpdmF0ZVBsdWdpbixcbiAgY3JlYXRlRHJhZ0JhcixcbiAgc2V0dXBTaWRlYmFyVG9nZ2xlLFxufSBmcm9tICcuL2NyZWF0ZUVsZW1lbnRzJ1xuaW1wb3J0IHsgc2hvd0RUU1BsdWdpbiB9IGZyb20gJy4vc2lkZWJhci9zaG93RFRTJ1xuaW1wb3J0IHsgcnVuV2l0aEN1c3RvbUxvZ3MsIHJ1blBsdWdpbiB9IGZyb20gJy4vc2lkZWJhci9ydW50aW1lJ1xuaW1wb3J0IHsgY3JlYXRlRXhwb3J0ZXIgfSBmcm9tICcuL2V4cG9ydGVyJ1xuaW1wb3J0IHsgY3JlYXRlVUkgfSBmcm9tICcuL2NyZWF0ZVVJJ1xuaW1wb3J0IHsgZ2V0RXhhbXBsZVNvdXJjZUNvZGUgfSBmcm9tICcuL2dldEV4YW1wbGUnXG5pbXBvcnQgeyBFeGFtcGxlSGlnaGxpZ2h0ZXIgfSBmcm9tICcuL21vbmFjby9FeGFtcGxlSGlnaGxpZ2h0J1xuaW1wb3J0IHsgY3JlYXRlQ29uZmlnRHJvcGRvd24sIHVwZGF0ZUNvbmZpZ0Ryb3Bkb3duRm9yQ29tcGlsZXJPcHRpb25zIH0gZnJvbSAnLi9jcmVhdGVDb25maWdEcm9wZG93bidcbmltcG9ydCB7IHNob3dFcnJvcnMgfSBmcm9tICcuL3NpZGViYXIvc2hvd0Vycm9ycydcbmltcG9ydCB7IG9wdGlvbnNQbHVnaW4sIGFsbG93Q29ubmVjdGluZ1RvTG9jYWxob3N0LCBhY3RpdmVQbHVnaW5zLCBhZGRDdXN0b21QbHVnaW4gfSBmcm9tICcuL3NpZGViYXIvb3B0aW9ucydcbmltcG9ydCB7IGNyZWF0ZVV0aWxzLCBQbHVnaW5VdGlscyB9IGZyb20gJy4vcGx1Z2luVXRpbHMnXG5pbXBvcnQgdHlwZSBSZWFjdCBmcm9tICdyZWFjdCdcblxuZXhwb3J0IHsgUGx1Z2luVXRpbHMgfSBmcm9tICcuL3BsdWdpblV0aWxzJ1xuXG5leHBvcnQgdHlwZSBQbHVnaW5GYWN0b3J5ID0ge1xuICAoaTogKGtleTogc3RyaW5nLCBjb21wb25lbnRzPzogYW55KSA9PiBzdHJpbmcpOiBQbGF5Z3JvdW5kUGx1Z2luXG59XG5cbi8qKiBUaGUgaW50ZXJmYWNlIG9mIGFsbCBzaWRlYmFyIHBsdWdpbnMgKi9cbmV4cG9ydCBpbnRlcmZhY2UgUGxheWdyb3VuZFBsdWdpbiB7XG4gIC8qKiBOb3QgcHVibGljIGZhY2luZywgYnV0IHVzZWQgYnkgdGhlIHBsYXlncm91bmQgdG8gdW5pcXVlbHkgaWRlbnRpZnkgcGx1Z2lucyAqL1xuICBpZDogc3RyaW5nXG4gIC8qKiBUbyBzaG93IGluIHRoZSB0YWJzICovXG4gIGRpc3BsYXlOYW1lOiBzdHJpbmdcbiAgLyoqIFNob3VsZCB0aGlzIHBsdWdpbiBiZSBzZWxlY3RlZCB3aGVuIHRoZSBwbHVnaW4gaXMgZmlyc3QgbG9hZGVkPyBMZXQncyB5b3UgY2hlY2sgZm9yIHF1ZXJ5IHZhcnMgZXRjIHRvIGxvYWQgYSBwYXJ0aWN1bGFyIHBsdWdpbiAqL1xuICBzaG91bGRCZVNlbGVjdGVkPzogKCkgPT4gYm9vbGVhblxuICAvKiogQmVmb3JlIHdlIHNob3cgdGhlIHRhYiwgdXNlIHRoaXMgdG8gc2V0IHVwIHlvdXIgSFRNTCAtIGl0IHdpbGwgYWxsIGJlIHJlbW92ZWQgYnkgdGhlIHBsYXlncm91bmQgd2hlbiBzb21lb25lIG5hdmlnYXRlcyBvZmYgdGhlIHRhYiAqL1xuICB3aWxsTW91bnQ/OiAoc2FuZGJveDogU2FuZGJveCwgY29udGFpbmVyOiBIVE1MRGl2RWxlbWVudCkgPT4gdm9pZFxuICAvKiogQWZ0ZXIgd2Ugc2hvdyB0aGUgdGFiICovXG4gIGRpZE1vdW50PzogKHNhbmRib3g6IFNhbmRib3gsIGNvbnRhaW5lcjogSFRNTERpdkVsZW1lbnQpID0+IHZvaWRcbiAgLyoqIE1vZGVsIGNoYW5nZXMgd2hpbGUgdGhpcyBwbHVnaW4gaXMgYWN0aXZlbHkgc2VsZWN0ZWQgICovXG4gIG1vZGVsQ2hhbmdlZD86IChzYW5kYm94OiBTYW5kYm94LCBtb2RlbDogaW1wb3J0KCdtb25hY28tZWRpdG9yJykuZWRpdG9yLklUZXh0TW9kZWwpID0+IHZvaWRcbiAgLyoqIERlbGF5ZWQgbW9kZWwgY2hhbmdlcyB3aGlsZSB0aGlzIHBsdWdpbiBpcyBhY3RpdmVseSBzZWxlY3RlZCwgdXNlZnVsIHdoZW4geW91IGFyZSB3b3JraW5nIHdpdGggdGhlIFRTIEFQSSBiZWNhdXNlIGl0IHdvbid0IHJ1biBvbiBldmVyeSBrZXlwcmVzcyAqL1xuICBtb2RlbENoYW5nZWREZWJvdW5jZT86IChzYW5kYm94OiBTYW5kYm94LCBtb2RlbDogaW1wb3J0KCdtb25hY28tZWRpdG9yJykuZWRpdG9yLklUZXh0TW9kZWwpID0+IHZvaWRcbiAgLyoqIEJlZm9yZSB3ZSByZW1vdmUgdGhlIHRhYiAqL1xuICB3aWxsVW5tb3VudD86IChzYW5kYm94OiBTYW5kYm94LCBjb250YWluZXI6IEhUTUxEaXZFbGVtZW50KSA9PiB2b2lkXG4gIC8qKiBBZnRlciB3ZSByZW1vdmUgdGhlIHRhYiAqL1xuICBkaWRVbm1vdW50PzogKHNhbmRib3g6IFNhbmRib3gsIGNvbnRhaW5lcjogSFRNTERpdkVsZW1lbnQpID0+IHZvaWRcbiAgLyoqIEFuIG9iamVjdCB5b3UgY2FuIHVzZSB0byBrZWVwIGRhdGEgYXJvdW5kIGluIHRoZSBzY29wZSBvZiB5b3VyIHBsdWdpbiBvYmplY3QgKi9cbiAgZGF0YT86IGFueVxufVxuXG5pbnRlcmZhY2UgUGxheWdyb3VuZENvbmZpZyB7XG4gIGxhbmc6IHN0cmluZ1xuICBwcmVmaXg6IHN0cmluZ1xufVxuXG5jb25zdCBkZWZhdWx0UGx1Z2luRmFjdG9yaWVzOiBQbHVnaW5GYWN0b3J5W10gPSBbY29tcGlsZWRKU1BsdWdpbiwgc2hvd0RUU1BsdWdpbiwgc2hvd0Vycm9ycywgcnVuUGx1Z2luLCBvcHRpb25zUGx1Z2luXVxuXG5leHBvcnQgY29uc3Qgc2V0dXBQbGF5Z3JvdW5kID0gKFxuICBzYW5kYm94OiBTYW5kYm94LFxuICBtb25hY286IE1vbmFjbyxcbiAgY29uZmlnOiBQbGF5Z3JvdW5kQ29uZmlnLFxuICBpOiAoa2V5OiBzdHJpbmcpID0+IHN0cmluZyxcbiAgcmVhY3Q6IHR5cGVvZiBSZWFjdFxuKSA9PiB7XG4gIGNvbnN0IHBsYXlncm91bmRQYXJlbnQgPSBzYW5kYm94LmdldERvbU5vZGUoKS5wYXJlbnRFbGVtZW50IS5wYXJlbnRFbGVtZW50IS5wYXJlbnRFbGVtZW50IVxuICBjb25zdCBkcmFnQmFyID0gY3JlYXRlRHJhZ0JhcigpXG4gIHBsYXlncm91bmRQYXJlbnQuYXBwZW5kQ2hpbGQoZHJhZ0JhcilcblxuICBjb25zdCBzaWRlYmFyID0gY3JlYXRlU2lkZWJhcigpXG4gIHBsYXlncm91bmRQYXJlbnQuYXBwZW5kQ2hpbGQoc2lkZWJhcilcblxuICBjb25zdCB0YWJCYXIgPSBjcmVhdGVUYWJCYXIoKVxuICBzaWRlYmFyLmFwcGVuZENoaWxkKHRhYkJhcilcblxuICBjb25zdCBjb250YWluZXIgPSBjcmVhdGVQbHVnaW5Db250YWluZXIoKVxuICBzaWRlYmFyLmFwcGVuZENoaWxkKGNvbnRhaW5lcilcblxuICBjb25zdCBwbHVnaW5zID0gW10gYXMgUGxheWdyb3VuZFBsdWdpbltdXG4gIGNvbnN0IHRhYnMgPSBbXSBhcyBIVE1MQnV0dG9uRWxlbWVudFtdXG5cbiAgY29uc3QgcmVnaXN0ZXJQbHVnaW4gPSAocGx1Z2luOiBQbGF5Z3JvdW5kUGx1Z2luKSA9PiB7XG4gICAgcGx1Z2lucy5wdXNoKHBsdWdpbilcblxuICAgIGNvbnN0IHRhYiA9IGNyZWF0ZVRhYkZvclBsdWdpbihwbHVnaW4pXG4gICAgdGFicy5wdXNoKHRhYilcblxuICAgIGNvbnN0IHRhYkNsaWNrZWQ6IEhUTUxFbGVtZW50WydvbmNsaWNrJ10gPSBlID0+IHtcbiAgICAgIGNvbnN0IHByZXZpb3VzUGx1Z2luID0gY3VycmVudFBsdWdpbigpXG4gICAgICBjb25zdCBuZXdUYWIgPSBlLnRhcmdldCBhcyBIVE1MRWxlbWVudFxuICAgICAgY29uc3QgbmV3UGx1Z2luID0gcGx1Z2lucy5maW5kKHAgPT4gcC5kaXNwbGF5TmFtZSA9PSBuZXdUYWIudGV4dENvbnRlbnQpIVxuICAgICAgYWN0aXZhdGVQbHVnaW4obmV3UGx1Z2luLCBwcmV2aW91c1BsdWdpbiwgc2FuZGJveCwgdGFiQmFyLCBjb250YWluZXIpXG4gICAgfVxuXG4gICAgdGFiQmFyLmFwcGVuZENoaWxkKHRhYilcbiAgICB0YWIub25jbGljayA9IHRhYkNsaWNrZWRcbiAgfVxuXG4gIGNvbnN0IGN1cnJlbnRQbHVnaW4gPSAoKSA9PiB7XG4gICAgY29uc3Qgc2VsZWN0ZWRUYWIgPSB0YWJzLmZpbmQodCA9PiB0LmNsYXNzTGlzdC5jb250YWlucygnYWN0aXZlJykpIVxuICAgIHJldHVybiBwbHVnaW5zW3RhYnMuaW5kZXhPZihzZWxlY3RlZFRhYildXG4gIH1cblxuICBjb25zdCBpbml0aWFsUGx1Z2lucyA9IGRlZmF1bHRQbHVnaW5GYWN0b3JpZXMubWFwKGYgPT4gZihpKSlcbiAgaW5pdGlhbFBsdWdpbnMuZm9yRWFjaChwID0+IHJlZ2lzdGVyUGx1Z2luKHApKVxuXG4gIC8vIENob29zZSB3aGljaCBzaG91bGQgYmUgc2VsZWN0ZWRcbiAgY29uc3QgcHJpb3JpdHlQbHVnaW4gPSBwbHVnaW5zLmZpbmQocGx1Z2luID0+IHBsdWdpbi5zaG91bGRCZVNlbGVjdGVkICYmIHBsdWdpbi5zaG91bGRCZVNlbGVjdGVkKCkpXG4gIGNvbnN0IHNlbGVjdGVkUGx1Z2luID0gcHJpb3JpdHlQbHVnaW4gfHwgcGx1Z2luc1swXVxuICBjb25zdCBzZWxlY3RlZFRhYiA9IHRhYnNbcGx1Z2lucy5pbmRleE9mKHNlbGVjdGVkUGx1Z2luKV0hXG4gIHNlbGVjdGVkVGFiLm9uY2xpY2shKHsgdGFyZ2V0OiBzZWxlY3RlZFRhYiB9IGFzIGFueSlcblxuICBsZXQgZGVib3VuY2luZ1RpbWVyID0gZmFsc2VcbiAgc2FuZGJveC5lZGl0b3Iub25EaWRDaGFuZ2VNb2RlbENvbnRlbnQoX2V2ZW50ID0+IHtcbiAgICBjb25zdCBwbHVnaW4gPSBjdXJyZW50UGx1Z2luKClcbiAgICBpZiAocGx1Z2luLm1vZGVsQ2hhbmdlZCkgcGx1Z2luLm1vZGVsQ2hhbmdlZChzYW5kYm94LCBzYW5kYm94LmdldE1vZGVsKCkpXG5cbiAgICAvLyBUaGlzIG5lZWRzIHRvIGJlIGxhc3QgaW4gdGhlIGZ1bmN0aW9uXG4gICAgaWYgKGRlYm91bmNpbmdUaW1lcikgcmV0dXJuXG4gICAgZGVib3VuY2luZ1RpbWVyID0gdHJ1ZVxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgZGVib3VuY2luZ1RpbWVyID0gZmFsc2VcbiAgICAgIHBsYXlncm91bmREZWJvdW5jZWRNYWluRnVuY3Rpb24oKVxuXG4gICAgICAvLyBPbmx5IGNhbGwgdGhlIHBsdWdpbiBmdW5jdGlvbiBvbmNlIGV2ZXJ5IDAuM3NcbiAgICAgIGlmIChwbHVnaW4ubW9kZWxDaGFuZ2VkRGVib3VuY2UgJiYgcGx1Z2luLmRpc3BsYXlOYW1lID09PSBjdXJyZW50UGx1Z2luKCkuZGlzcGxheU5hbWUpIHtcbiAgICAgICAgcGx1Z2luLm1vZGVsQ2hhbmdlZERlYm91bmNlKHNhbmRib3gsIHNhbmRib3guZ2V0TW9kZWwoKSlcbiAgICAgIH1cbiAgICB9LCAzMDApXG4gIH0pXG5cbiAgLy8gU2V0cyB0aGUgVVJMIGFuZCBzdG9yYWdlIG9mIHRoZSBzYW5kYm94IHN0cmluZ1xuICBjb25zdCBwbGF5Z3JvdW5kRGVib3VuY2VkTWFpbkZ1bmN0aW9uID0gKCkgPT4ge1xuICAgIGNvbnN0IGFsd2F5c1VwZGF0ZVVSTCA9ICFsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnZGlzYWJsZS1zYXZlLW9uLXR5cGUnKVxuICAgIGlmIChhbHdheXNVcGRhdGVVUkwpIHtcbiAgICAgIGNvbnN0IG5ld1VSTCA9IHNhbmRib3guY3JlYXRlVVJMUXVlcnlXaXRoQ29tcGlsZXJPcHRpb25zKHNhbmRib3gpXG4gICAgICB3aW5kb3cuaGlzdG9yeS5yZXBsYWNlU3RhdGUoe30sICcnLCBuZXdVUkwpXG4gICAgfVxuXG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3NhbmRib3gtaGlzdG9yeScsIHNhbmRib3guZ2V0VGV4dCgpKVxuICB9XG5cbiAgLy8gV2hlbiBhbnkgY29tcGlsZXIgZmxhZ3MgYXJlIGNoYW5nZWQsIHRyaWdnZXIgYSBwb3RlbnRpYWwgY2hhbmdlIHRvIHRoZSBVUkxcbiAgc2FuZGJveC5zZXREaWRVcGRhdGVDb21waWxlclNldHRpbmdzKCgpID0+IHtcbiAgICBwbGF5Z3JvdW5kRGVib3VuY2VkTWFpbkZ1bmN0aW9uKClcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgd2luZG93LmFwcEluc2lnaHRzLnRyYWNrRXZlbnQoeyBuYW1lOiAnQ29tcGlsZXIgU2V0dGluZ3MgY2hhbmdlZCcgfSlcblxuICAgIGNvbnN0IG1vZGVsID0gc2FuZGJveC5lZGl0b3IuZ2V0TW9kZWwoKVxuICAgIGNvbnN0IHBsdWdpbiA9IGN1cnJlbnRQbHVnaW4oKVxuICAgIGlmIChtb2RlbCAmJiBwbHVnaW4ubW9kZWxDaGFuZ2VkKSBwbHVnaW4ubW9kZWxDaGFuZ2VkKHNhbmRib3gsIG1vZGVsKVxuICAgIGlmIChtb2RlbCAmJiBwbHVnaW4ubW9kZWxDaGFuZ2VkRGVib3VuY2UpIHBsdWdpbi5tb2RlbENoYW5nZWREZWJvdW5jZShzYW5kYm94LCBtb2RlbClcbiAgfSlcblxuICAvLyBTZXR1cCB3b3JraW5nIHdpdGggdGhlIGV4aXN0aW5nIFVJLCBvbmNlIGl0J3MgbG9hZGVkXG5cbiAgLy8gVmVyc2lvbnMgb2YgVHlwZVNjcmlwdFxuXG4gIC8vIFNldCB1cCB0aGUgbGFiZWwgZm9yIHRoZSBkcm9wZG93blxuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcjdmVyc2lvbnMgPiBhJykuaXRlbSgwKS5pbm5lckhUTUwgPSAndicgKyBzYW5kYm94LnRzLnZlcnNpb24gKyBcIiA8c3BhbiBjbGFzcz0nY2FyZXQnLz5cIlxuXG4gIC8vIEFkZCB0aGUgdmVyc2lvbnMgdG8gdGhlIGRyb3Bkb3duXG4gIGNvbnN0IHZlcnNpb25zTWVudSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJyN2ZXJzaW9ucyA+IHVsJykuaXRlbSgwKVxuXG4gIGNvbnN0IG5vdFdvcmtpbmdJblBsYXlncm91bmQgPSBbJzMuMS42JywgJzMuMC4xJywgJzIuOC4xJywgJzIuNy4yJywgJzIuNC4xJ11cbiAgXG4gIGNvbnN0IGFsbFZlcnNpb25zID0gW1xuICAgICczLjkuMC1iZXRhJyxcbiAgICAuLi5zYW5kYm94LnN1cHBvcnRlZFZlcnNpb25zLmZpbHRlcihmID0+ICFub3RXb3JraW5nSW5QbGF5Z3JvdW5kLmluY2x1ZGVzKGYpKSwgXG4gICAgJ05pZ2h0bHknXG4gIF1cblxuICBhbGxWZXJzaW9ucy5mb3JFYWNoKCh2OiBzdHJpbmcpID0+IHtcbiAgICBjb25zdCBsaSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJylcbiAgICBjb25zdCBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpXG4gICAgYS50ZXh0Q29udGVudCA9IHZcbiAgICBhLmhyZWYgPSAnIydcblxuICAgIGlmICh2ID09PSBcIk5pZ2h0bHlcIikge1xuICAgICAgbGkuY2xhc3NMaXN0LmFkZChcIm5pZ2h0bHlcIilcbiAgICB9XG5cbiAgICBpZiAodi50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKFwiYmV0YVwiKSkge1xuICAgICAgbGkuY2xhc3NMaXN0LmFkZChcImJldGFcIilcbiAgICB9XG5cbiAgICBsaS5vbmNsaWNrID0gKCkgPT4ge1xuICAgICAgY29uc3QgY3VycmVudFVSTCA9IHNhbmRib3guY3JlYXRlVVJMUXVlcnlXaXRoQ29tcGlsZXJPcHRpb25zKHNhbmRib3gpXG4gICAgICBjb25zdCBwYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKGN1cnJlbnRVUkwuc3BsaXQoJyMnKVswXSlcbiAgICAgIGNvbnN0IHZlcnNpb24gPSB2ID09PSAnTmlnaHRseScgPyAnbmV4dCcgOiB2XG4gICAgICBwYXJhbXMuc2V0KCd0cycsIHZlcnNpb24pXG5cbiAgICAgIGNvbnN0IGhhc2ggPSBkb2N1bWVudC5sb2NhdGlvbi5oYXNoLmxlbmd0aCA/IGRvY3VtZW50LmxvY2F0aW9uLmhhc2ggOiAnJ1xuICAgICAgY29uc3QgbmV3VVJMID0gYCR7ZG9jdW1lbnQubG9jYXRpb24ucHJvdG9jb2x9Ly8ke2RvY3VtZW50LmxvY2F0aW9uLmhvc3R9JHtkb2N1bWVudC5sb2NhdGlvbi5wYXRobmFtZX0/JHtwYXJhbXN9JHtoYXNofWBcblxuICAgICAgLy8gQHRzLWlnbm9yZSAtIGl0IGlzIGFsbG93ZWRcbiAgICAgIGRvY3VtZW50LmxvY2F0aW9uID0gbmV3VVJMXG4gICAgfVxuXG4gICAgbGkuYXBwZW5kQ2hpbGQoYSlcbiAgICB2ZXJzaW9uc01lbnUuYXBwZW5kQ2hpbGQobGkpXG4gIH0pXG5cbiAgLy8gU3VwcG9ydCBkcm9wZG93bnNcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLm5hdmJhci1zdWIgbGkuZHJvcGRvd24gPiBhJykuZm9yRWFjaChsaW5rID0+IHtcbiAgICBjb25zdCBhID0gbGluayBhcyBIVE1MQW5jaG9yRWxlbWVudFxuICAgIGEub25jbGljayA9IF9lID0+IHtcbiAgICAgIGlmIChhLnBhcmVudEVsZW1lbnQhLmNsYXNzTGlzdC5jb250YWlucygnb3BlbicpKSB7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5uYXZiYXItc3ViIGxpLm9wZW4nKS5mb3JFYWNoKGkgPT4gaS5jbGFzc0xpc3QucmVtb3ZlKCdvcGVuJykpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcubmF2YmFyLXN1YiBsaS5vcGVuJykuZm9yRWFjaChpID0+IGkuY2xhc3NMaXN0LnJlbW92ZSgnb3BlbicpKVxuICAgICAgICBhLnBhcmVudEVsZW1lbnQhLmNsYXNzTGlzdC50b2dnbGUoJ29wZW4nKVxuXG4gICAgICAgIGNvbnN0IGV4YW1wbGVDb250YWluZXIgPSBhXG4gICAgICAgICAgLmNsb3Nlc3QoJ2xpJykhXG4gICAgICAgICAgLmdldEVsZW1lbnRzQnlUYWdOYW1lKCd1bCcpXG4gICAgICAgICAgLml0ZW0oMCkhXG5cbiAgICAgICAgLy8gU2V0IGV4YWN0IGhlaWdodCBhbmQgd2lkdGhzIGZvciB0aGUgcG9wb3ZlcnMgZm9yIHRoZSBtYWluIHBsYXlncm91bmQgbmF2aWdhdGlvblxuICAgICAgICBjb25zdCBpc1BsYXlncm91bmRTdWJtZW51ID0gISFhLmNsb3Nlc3QoJ25hdicpXG4gICAgICAgIGlmIChpc1BsYXlncm91bmRTdWJtZW51KSB7XG4gICAgICAgICAgY29uc3QgcGxheWdyb3VuZENvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwbGF5Z3JvdW5kLWNvbnRhaW5lcicpIVxuICAgICAgICAgIGV4YW1wbGVDb250YWluZXIuc3R5bGUuaGVpZ2h0ID0gYGNhbGMoJHtwbGF5Z3JvdW5kQ29udGFpbmVyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmhlaWdodCArIDI2fXB4IC0gNHJlbSlgXG5cbiAgICAgICAgICBjb25zdCBzaWRlQmFyV2lkdGggPSAoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnBsYXlncm91bmQtc2lkZWJhcicpIGFzIGFueSkub2Zmc2V0V2lkdGhcbiAgICAgICAgICBleGFtcGxlQ29udGFpbmVyLnN0eWxlLndpZHRoID0gYGNhbGMoMTAwJSAtICR7c2lkZUJhcldpZHRofXB4IC0gNzFweClgXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0pXG5cbiAgLy8gU2V0IHVwIHNvbWUga2V5IGNvbW1hbmRzXG4gIHNhbmRib3guZWRpdG9yLmFkZEFjdGlvbih7IFxuICAgIGlkOiAnY29weS1jbGlwYm9hcmQnLFxuICAgIGxhYmVsOiAnU2F2ZSB0byBjbGlwYm9hcmQnLFxuICAgIGtleWJpbmRpbmdzOiBbIG1vbmFjby5LZXlNb2QuQ3RybENtZCB8IG1vbmFjby5LZXlDb2RlLktFWV9TIF0sXG4gIFxuICAgIGNvbnRleHRNZW51R3JvdXBJZDogJ3J1bicsXG4gICAgY29udGV4dE1lbnVPcmRlcjogMS41LFxuICBcbiAgICBydW46IGZ1bmN0aW9uKGVkKSB7XG4gICAgICB3aW5kb3cubmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQobG9jYXRpb24uaHJlZi50b1N0cmluZygpKS50aGVuKFxuICAgICAgICAoKSA9PiB1aS5mbGFzaEluZm8oaSgncGxheV9leHBvcnRfY2xpcGJvYXJkJykpLFxuICAgICAgICAoZTogYW55KSA9PiBhbGVydChlKVxuICAgICAgKVxuICAgIH1cbiAgfSk7XG5cblxuICBzYW5kYm94LmVkaXRvci5hZGRBY3Rpb24oeyBcbiAgICBpZDogJ3J1bi1qcycsXG4gICAgbGFiZWw6ICdSdW4gdGhlIGV2YWx1YXRlZCBKYXZhU2NyaXB0IGZvciB5b3VyIFR5cGVTY3JpcHQgZmlsZScsXG4gICAga2V5YmluZGluZ3M6IFsgbW9uYWNvLktleU1vZC5DdHJsQ21kIHwgbW9uYWNvLktleUNvZGUuRW50ZXIgXSxcbiAgXG4gICAgY29udGV4dE1lbnVHcm91cElkOiAncnVuJyxcbiAgICBjb250ZXh0TWVudU9yZGVyOiAxLjUsXG4gIFxuICAgIHJ1bjogZnVuY3Rpb24oZWQpIHtcbiAgICAgIGNvbnN0IHJ1bkJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdydW4tYnV0dG9uJykhXG4gICAgICBydW5CdXR0b24ub25jbGljayAmJiBydW5CdXR0b24ub25jbGljayh7fSBhcyBhbnkpXG4gICAgfVxuICB9KTtcblxuXG4gIGNvbnN0IHJ1bkJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdydW4tYnV0dG9uJykhXG4gIHJ1bkJ1dHRvbi5vbmNsaWNrID0gKCkgPT4ge1xuICAgIGNvbnN0IHJ1biA9IHNhbmRib3guZ2V0UnVubmFibGVKUygpXG4gICAgY29uc3QgcnVuUGx1Z2luID0gcGx1Z2lucy5maW5kKHAgPT4gcC5pZCA9PT0gJ2xvZ3MnKSFcbiAgICBhY3RpdmF0ZVBsdWdpbihydW5QbHVnaW4sIGN1cnJlbnRQbHVnaW4oKSwgc2FuZGJveCwgdGFiQmFyLCBjb250YWluZXIpXG5cbiAgICBydW5XaXRoQ3VzdG9tTG9ncyhydW4sIGkpXG5cbiAgICBjb25zdCBpc0pTID0gc2FuZGJveC5jb25maWcudXNlSmF2YVNjcmlwdFxuICAgIHVpLmZsYXNoSW5mbyhpKGlzSlMgPyAncGxheV9ydW5fanMnIDogJ3BsYXlfcnVuX3RzJykpXG4gIH1cblxuICAvLyBIYW5kbGUgdGhlIGNsb3NlIGJ1dHRvbnMgb24gdGhlIGV4YW1wbGVzXG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2J1dHRvbi5leGFtcGxlcy1jbG9zZScpLmZvckVhY2goYiA9PiB7XG4gICAgY29uc3QgYnV0dG9uID0gYiBhcyBIVE1MQnV0dG9uRWxlbWVudFxuICAgIGJ1dHRvbi5vbmNsaWNrID0gKGU6IGFueSkgPT4ge1xuICAgICAgY29uc3QgYnV0dG9uID0gZS50YXJnZXQgYXMgSFRNTEJ1dHRvbkVsZW1lbnRcbiAgICAgIGNvbnN0IG5hdkxJID0gYnV0dG9uLmNsb3Nlc3QoJ2xpJylcbiAgICAgIG5hdkxJPy5jbGFzc0xpc3QucmVtb3ZlKCdvcGVuJylcbiAgICB9XG4gIH0pXG5cbiAgc2V0dXBTaWRlYmFyVG9nZ2xlKClcblxuICBjcmVhdGVDb25maWdEcm9wZG93bihzYW5kYm94LCBtb25hY28pXG4gIHVwZGF0ZUNvbmZpZ0Ryb3Bkb3duRm9yQ29tcGlsZXJPcHRpb25zKHNhbmRib3gsIG1vbmFjbylcblxuICAvLyBTdXBwb3J0IGdyYWJiaW5nIGV4YW1wbGVzIGZyb20gdGhlIGxvY2F0aW9uIGhhc2hcbiAgaWYgKGxvY2F0aW9uLmhhc2guc3RhcnRzV2l0aCgnI2V4YW1wbGUnKSkge1xuICAgIGNvbnN0IGV4YW1wbGVOYW1lID0gbG9jYXRpb24uaGFzaC5yZXBsYWNlKCcjZXhhbXBsZS8nLCAnJykudHJpbSgpXG4gICAgc2FuZGJveC5jb25maWcubG9nZ2VyLmxvZygnTG9hZGluZyBleGFtcGxlOicsIGV4YW1wbGVOYW1lKVxuICAgIGdldEV4YW1wbGVTb3VyY2VDb2RlKGNvbmZpZy5wcmVmaXgsIGNvbmZpZy5sYW5nLCBleGFtcGxlTmFtZSkudGhlbihleCA9PiB7XG4gICAgICBpZiAoZXguZXhhbXBsZSAmJiBleC5jb2RlKSB7XG4gICAgICAgIGNvbnN0IHsgZXhhbXBsZSwgY29kZSB9ID0gZXhcblxuICAgICAgICAvLyBVcGRhdGUgdGhlIGxvY2Fsc3RvcmFnZSBzaG93aW5nIHRoYXQgeW91J3ZlIHNlZW4gdGhpcyBwYWdlXG4gICAgICAgIGlmIChsb2NhbFN0b3JhZ2UpIHtcbiAgICAgICAgICBjb25zdCBzZWVuVGV4dCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdleGFtcGxlcy1zZWVuJykgfHwgJ3t9J1xuICAgICAgICAgIGNvbnN0IHNlZW4gPSBKU09OLnBhcnNlKHNlZW5UZXh0KVxuICAgICAgICAgIHNlZW5bZXhhbXBsZS5pZF0gPSBleGFtcGxlLmhhc2hcbiAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnZXhhbXBsZXMtc2VlbicsIEpTT04uc3RyaW5naWZ5KHNlZW4pKVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gU2V0IHRoZSBtZW51IHRvIGJlIHRoZSBzYW1lIHNlY3Rpb24gYXMgdGhpcyBjdXJyZW50IGV4YW1wbGVcbiAgICAgICAgLy8gdGhpcyBoYXBwZW5zIGJlaGluZCB0aGUgc2NlbmUgYW5kIGlzbid0IHZpc2libGUgdGlsbCB5b3UgaG92ZXJcbiAgICAgICAgLy8gY29uc3Qgc2VjdGlvblRpdGxlID0gZXhhbXBsZS5wYXRoWzBdXG4gICAgICAgIC8vIGNvbnN0IGFsbFNlY3Rpb25UaXRsZXMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdzZWN0aW9uLW5hbWUnKVxuICAgICAgICAvLyBmb3IgKGNvbnN0IHRpdGxlIG9mIGFsbFNlY3Rpb25UaXRsZXMpIHtcbiAgICAgICAgLy8gICBpZiAodGl0bGUudGV4dENvbnRlbnQgPT09IHNlY3Rpb25UaXRsZSkge1xuICAgICAgICAvLyAgICAgdGl0bGUub25jbGljayh7fSlcbiAgICAgICAgLy8gICB9XG4gICAgICAgIC8vIH1cblxuICAgICAgICBjb25zdCBhbGxMaW5rcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2V4YW1wbGUtbGluaycpXG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgZm9yIChjb25zdCBsaW5rIG9mIGFsbExpbmtzKSB7XG4gICAgICAgICAgaWYgKGxpbmsudGV4dENvbnRlbnQgPT09IGV4YW1wbGUudGl0bGUpIHtcbiAgICAgICAgICAgIGxpbmsuY2xhc3NMaXN0LmFkZCgnaGlnaGxpZ2h0JylcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBkb2N1bWVudC50aXRsZSA9ICdUeXBlU2NyaXB0IFBsYXlncm91bmQgLSAnICsgZXhhbXBsZS50aXRsZVxuICAgICAgICBzYW5kYm94LnNldFRleHQoY29kZSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNhbmRib3guc2V0VGV4dCgnLy8gVGhlcmUgd2FzIGFuIGlzc3VlIGdldHRpbmcgdGhlIGV4YW1wbGUsIGJhZCBVUkw/IENoZWNrIHRoZSBjb25zb2xlIGluIHRoZSBkZXZlbG9wZXIgdG9vbHMnKVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICAvLyBTZXRzIHVwIGEgd2F5IHRvIGNsaWNrIGJldHdlZW4gZXhhbXBsZXNcbiAgbW9uYWNvLmxhbmd1YWdlcy5yZWdpc3RlckxpbmtQcm92aWRlcihzYW5kYm94Lmxhbmd1YWdlLCBuZXcgRXhhbXBsZUhpZ2hsaWdodGVyKCkpXG5cbiAgY29uc3QgbGFuZ3VhZ2VTZWxlY3RvciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsYW5ndWFnZS1zZWxlY3RvcicpISBhcyBIVE1MU2VsZWN0RWxlbWVudFxuICBjb25zdCBwYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKGxvY2F0aW9uLnNlYXJjaClcbiAgbGFuZ3VhZ2VTZWxlY3Rvci5vcHRpb25zLnNlbGVjdGVkSW5kZXggPSBwYXJhbXMuZ2V0KCd1c2VKYXZhU2NyaXB0JykgPyAxIDogMFxuXG4gIGxhbmd1YWdlU2VsZWN0b3Iub25jaGFuZ2UgPSAoKSA9PiB7XG4gICAgY29uc3QgdXNlSmF2YVNjcmlwdCA9IGxhbmd1YWdlU2VsZWN0b3IudmFsdWUgPT09ICdKYXZhU2NyaXB0J1xuICAgIGNvbnN0IHF1ZXJ5ID0gc2FuZGJveC5jcmVhdGVVUkxRdWVyeVdpdGhDb21waWxlck9wdGlvbnMoc2FuZGJveCwgeyB1c2VKYXZhU2NyaXB0OiB1c2VKYXZhU2NyaXB0ID8gdHJ1ZSA6IHVuZGVmaW5lZCB9KVxuICAgIGNvbnN0IGZ1bGxVUkwgPSBgJHtkb2N1bWVudC5sb2NhdGlvbi5wcm90b2NvbH0vLyR7ZG9jdW1lbnQubG9jYXRpb24uaG9zdH0ke2RvY3VtZW50LmxvY2F0aW9uLnBhdGhuYW1lfSR7cXVlcnl9YFxuICAgIC8vIEB0cy1pZ25vcmVcbiAgICBkb2N1bWVudC5sb2NhdGlvbiA9IGZ1bGxVUkxcbiAgfVxuXG4gIGNvbnN0IHVpID0gY3JlYXRlVUkoKVxuICBjb25zdCBleHBvcnRlciA9IGNyZWF0ZUV4cG9ydGVyKHNhbmRib3gsIG1vbmFjbywgdWkpXG5cbiAgY29uc3QgcGxheWdyb3VuZCA9IHtcbiAgICBleHBvcnRlcixcbiAgICB1aSxcbiAgICByZWdpc3RlclBsdWdpbixcbiAgfVxuXG4gIHdpbmRvdy50cyA9IHNhbmRib3gudHNcbiAgd2luZG93LnNhbmRib3ggPSBzYW5kYm94XG4gIHdpbmRvdy5wbGF5Z3JvdW5kID0gcGxheWdyb3VuZFxuXG4gIGNvbnNvbGUubG9nKGBVc2luZyBUeXBlU2NyaXB0ICR7d2luZG93LnRzLnZlcnNpb259YClcblxuICBjb25zb2xlLmxvZygnQXZhaWxhYmxlIGdsb2JhbHM6JylcbiAgY29uc29sZS5sb2coJ1xcdHdpbmRvdy50cycsIHdpbmRvdy50cylcbiAgY29uc29sZS5sb2coJ1xcdHdpbmRvdy5zYW5kYm94Jywgd2luZG93LnNhbmRib3gpXG4gIGNvbnNvbGUubG9nKCdcXHR3aW5kb3cucGxheWdyb3VuZCcsIHdpbmRvdy5wbGF5Z3JvdW5kKVxuICBjb25zb2xlLmxvZygnXFx0d2luZG93LnJlYWN0Jywgd2luZG93LnJlYWN0KVxuICBjb25zb2xlLmxvZygnXFx0d2luZG93LnJlYWN0RE9NJywgd2luZG93LnJlYWN0RE9NKVxuXG5cbiAgLyoqIEEgcGx1Z2luICovXG4gIGNvbnN0IGFjdGl2YXRlRXh0ZXJuYWxQbHVnaW4gPSAoXG4gICAgcGx1Z2luOiBQbGF5Z3JvdW5kUGx1Z2luIHwgKCh1dGlsczogUGx1Z2luVXRpbHMpID0+IFBsYXlncm91bmRQbHVnaW4pLFxuICAgIGF1dG9BY3RpdmF0ZTogYm9vbGVhblxuICApID0+IHtcbiAgICBsZXQgcmVhZHlQbHVnaW46IFBsYXlncm91bmRQbHVnaW5cbiAgICAvLyBDYW4gZWl0aGVyIGJlIGEgZmFjdG9yeSwgb3Igb2JqZWN0XG4gICAgaWYgKHR5cGVvZiBwbHVnaW4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGNvbnN0IHV0aWxzID0gY3JlYXRlVXRpbHMoc2FuZGJveCwgcmVhY3QpXG4gICAgICByZWFkeVBsdWdpbiA9IHBsdWdpbih1dGlscylcbiAgICB9IGVsc2Uge1xuICAgICAgcmVhZHlQbHVnaW4gPSBwbHVnaW5cbiAgICB9XG5cbiAgICBpZiAoYXV0b0FjdGl2YXRlKSB7XG4gICAgICBjb25zb2xlLmxvZyhyZWFkeVBsdWdpbilcbiAgICB9XG5cbiAgICBwbGF5Z3JvdW5kLnJlZ2lzdGVyUGx1Z2luKHJlYWR5UGx1Z2luKVxuXG4gICAgLy8gQXV0by1zZWxlY3QgdGhlIGRldiBwbHVnaW5cbiAgICBjb25zdCBwbHVnaW5XYW50c0Zyb250ID0gcmVhZHlQbHVnaW4uc2hvdWxkQmVTZWxlY3RlZCAmJiByZWFkeVBsdWdpbi5zaG91bGRCZVNlbGVjdGVkKClcblxuICAgIGlmIChwbHVnaW5XYW50c0Zyb250IHx8IGF1dG9BY3RpdmF0ZSkge1xuICAgICAgLy8gQXV0by1zZWxlY3QgdGhlIGRldiBwbHVnaW5cbiAgICAgIGFjdGl2YXRlUGx1Z2luKHJlYWR5UGx1Z2luLCBjdXJyZW50UGx1Z2luKCksIHNhbmRib3gsIHRhYkJhciwgY29udGFpbmVyKVxuICAgIH1cbiAgfVxuXG4gIC8vIERldiBtb2RlIHBsdWdpblxuICBpZiAoYWxsb3dDb25uZWN0aW5nVG9Mb2NhbGhvc3QoKSkge1xuICAgIHdpbmRvdy5leHBvcnRzID0ge31cbiAgICBjb25zb2xlLmxvZygnQ29ubmVjdGluZyB0byBkZXYgcGx1Z2luJylcbiAgICB0cnkge1xuICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgY29uc3QgcmUgPSB3aW5kb3cucmVxdWlyZVxuICAgICAgcmUoWydsb2NhbC9pbmRleCddLCAoZGV2UGx1Z2luOiBhbnkpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coJ1NldCB1cCBkZXYgcGx1Z2luIGZyb20gbG9jYWxob3N0OjUwMDAnKVxuICAgICAgICB0cnkge1xuICAgICAgICAgIGFjdGl2YXRlRXh0ZXJuYWxQbHVnaW4oZGV2UGx1Z2luLCB0cnVlKVxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpXG4gICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICB1aS5mbGFzaEluZm8oJ0Vycm9yOiBDb3VsZCBub3QgbG9hZCBkZXYgcGx1Z2luIGZyb20gbG9jYWxob3N0OjUwMDAnKVxuICAgICAgICAgIH0sIDcwMClcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcignUHJvYmxlbSBsb2FkaW5nIHVwIHRoZSBkZXYgcGx1Z2luJylcbiAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpXG4gICAgfVxuICB9XG5cbiAgY29uc3QgZG93bmxvYWRQbHVnaW4gPSAocGx1Z2luOiBzdHJpbmcsIGF1dG9FbmFibGU6IGJvb2xlYW4pID0+IHtcbiAgICB0cnkge1xuICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgY29uc3QgcmUgPSB3aW5kb3cucmVxdWlyZVxuICAgICAgcmUoW2B1bnBrZy8ke3BsdWdpbn1AbGF0ZXN0L2Rpc3QvaW5kZXhgXSwgKGRldlBsdWdpbjogUGxheWdyb3VuZFBsdWdpbikgPT4ge1xuICAgICAgICBhY3RpdmF0ZUV4dGVybmFsUGx1Z2luKGRldlBsdWdpbiwgYXV0b0VuYWJsZSlcbiAgICAgIH0pXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1Byb2JsZW0gbG9hZGluZyB1cCB0aGUgcGx1Z2luOicsIHBsdWdpbilcbiAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpXG4gICAgfVxuICB9XG5cbiAgYWN0aXZlUGx1Z2lucygpLmZvckVhY2gocCA9PiBkb3dubG9hZFBsdWdpbihwLm1vZHVsZSwgZmFsc2UpKVxuXG4gIGlmIChsb2NhdGlvbi5oYXNoLnN0YXJ0c1dpdGgoJyNzaG93LWV4YW1wbGVzJykpIHtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdleGFtcGxlcy1idXR0b24nKT8uY2xpY2soKVxuICAgIH0sIDEwMClcbiAgfVxuXG4gIGlmIChsb2NhdGlvbi5oYXNoLnN0YXJ0c1dpdGgoJyNzaG93LXdoYXRpc25ldycpKSB7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnd2hhdGlzbmV3LWJ1dHRvbicpPy5jbGljaygpXG4gICAgfSwgMTAwKVxuICB9XG5cbiAgY29uc3QgcGx1Z2luVG9JbnN0YWxsID0gcGFyYW1zLmdldCgnaW5zdGFsbC1wbHVnaW4nKVxuICBpZiAocGx1Z2luVG9JbnN0YWxsKSB7XG4gICAgY29uc3QgYWxyZWFkeUluc3RhbGxlZCA9IGFjdGl2ZVBsdWdpbnMoKS5maW5kKHAgPT4gcC5tb2R1bGUgPT09IHBsdWdpblRvSW5zdGFsbClcbiAgICBjb25zb2xlLmxvZyhhY3RpdmVQbHVnaW5zKCksIGFscmVhZHlJbnN0YWxsZWQpXG4gICAgaWYgKCFhbHJlYWR5SW5zdGFsbGVkKSB7XG4gICAgICBjb25zdCBzaG91bGREb0l0ID0gY29uZmlybSgnV291bGQgeW91IGxpa2UgdG8gaW5zdGFsbCB0aGUgdGhpcmQgcGFydHkgcGx1Z2luP1xcblxcbicgKyBwbHVnaW5Ub0luc3RhbGwpXG4gICAgICBpZiAoc2hvdWxkRG9JdCkge1xuICAgICAgICBhZGRDdXN0b21QbHVnaW4ocGx1Z2luVG9JbnN0YWxsKVxuICAgICAgICBkb3dubG9hZFBsdWdpbihwbHVnaW5Ub0luc3RhbGwsIHRydWUpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHBsYXlncm91bmRcbn1cblxuZXhwb3J0IHR5cGUgUGxheWdyb3VuZCA9IFJldHVyblR5cGU8dHlwZW9mIHNldHVwUGxheWdyb3VuZD5cbiJdfQ==