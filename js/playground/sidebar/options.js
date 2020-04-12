define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const pluginRegistry = [
        {
            module: 'typescript-playground-presentation-mode',
            display: 'Presentation Mode',
            blurb: 'Create presentations inside the TypeScript playground, seamlessly jump between slides and live-code.',
            repo: 'https://github.com/orta/playground-slides/#README',
            author: {
                name: 'Orta',
                href: 'https://orta.io',
            },
        },
    ];
    /** Whether the playground should actively reach out to an existing plugin */
    exports.allowConnectingToLocalhost = () => {
        return !!localStorage.getItem('compiler-setting-connect-dev-plugin');
    };
    exports.activePlugins = () => {
        const existing = customPlugins().map(module => ({ module }));
        return existing.concat(pluginRegistry.filter(p => !!localStorage.getItem('plugin-' + p.module)));
    };
    const removeCustomPlugins = (mod) => {
        const newPlugins = customPlugins().filter(p => p !== mod);
        localStorage.setItem('custom-plugins-playground', JSON.stringify(newPlugins));
    };
    exports.addCustomPlugin = (mod) => {
        const newPlugins = customPlugins();
        newPlugins.push(mod);
        localStorage.setItem('custom-plugins-playground', JSON.stringify(newPlugins));
        // @ts-ignore
        window.appInsights &&
            // @ts-ignore
            window.appInsights.trackEvent({ name: 'Added Custom Module', properties: { id: mod } });
    };
    const customPlugins = () => {
        return JSON.parse(localStorage.getItem('custom-plugins-playground') || '[]');
    };
    exports.optionsPlugin = i => {
        const settings = [
            {
                display: i('play_sidebar_options_disable_ata'),
                blurb: i('play_sidebar_options_disable_ata_copy'),
                flag: 'disable-ata',
            },
            {
                display: i('play_sidebar_options_disable_save'),
                blurb: i('play_sidebar_options_disable_save_copy'),
                flag: 'disable-save-on-type',
            },
        ];
        const plugin = {
            id: 'options',
            displayName: i('play_sidebar_options'),
            // shouldBeSelected: () => true, // uncomment to make this the first tab on reloads
            willMount: (_sandbox, container) => {
                const categoryDiv = document.createElement('div');
                container.appendChild(categoryDiv);
                const p = document.createElement('p');
                p.id = 'restart-required';
                p.textContent = i('play_sidebar_options_restart_required');
                categoryDiv.appendChild(p);
                const ol = document.createElement('ol');
                ol.className = 'playground-options';
                createSection(i('play_sidebar_options_external'), categoryDiv);
                const pluginsOL = document.createElement('ol');
                pluginsOL.className = 'playground-plugins';
                pluginRegistry.forEach(plugin => {
                    const settingButton = createPlugin(plugin);
                    pluginsOL.appendChild(settingButton);
                });
                categoryDiv.appendChild(pluginsOL);
                const warning = document.createElement('p');
                warning.className = 'warning';
                warning.textContent = i('play_sidebar_options_external_warning');
                categoryDiv.appendChild(warning);
                createSection(i('play_sidebar_options_modules'), categoryDiv);
                const customModulesOL = document.createElement('ol');
                customModulesOL.className = 'custom-modules';
                const updateCustomModules = () => {
                    while (customModulesOL.firstChild) {
                        customModulesOL.removeChild(customModulesOL.firstChild);
                    }
                    customPlugins().forEach(module => {
                        const li = document.createElement('li');
                        li.innerHTML = module;
                        const a = document.createElement('a');
                        a.href = '#';
                        a.textContent = 'X';
                        a.onclick = () => {
                            removeCustomPlugins(module);
                            updateCustomModules();
                            announceWeNeedARestart();
                            return false;
                        };
                        li.appendChild(a);
                        customModulesOL.appendChild(li);
                    });
                };
                updateCustomModules();
                categoryDiv.appendChild(customModulesOL);
                const inputForm = createNewModuleInputForm(updateCustomModules, i);
                categoryDiv.appendChild(inputForm);
                createSection('Plugin Dev', categoryDiv);
                const pluginsDevOL = document.createElement('ol');
                pluginsDevOL.className = 'playground-options';
                const connectToDev = createButton({
                    display: i('play_sidebar_options_plugin_dev_option'),
                    blurb: i('play_sidebar_options_plugin_dev_copy'),
                    flag: 'connect-dev-plugin',
                });
                pluginsDevOL.appendChild(connectToDev);
                categoryDiv.appendChild(pluginsDevOL);
                categoryDiv.appendChild(document.createElement('hr'));
                createSection(i('play_sidebar_options'), categoryDiv);
                settings.forEach(setting => {
                    const settingButton = createButton(setting);
                    ol.appendChild(settingButton);
                });
                categoryDiv.appendChild(ol);
            },
        };
        return plugin;
    };
    const announceWeNeedARestart = () => {
        document.getElementById('restart-required').style.display = 'block';
    };
    const createSection = (title, container) => {
        const pluginDevTitle = document.createElement('h4');
        pluginDevTitle.textContent = title;
        container.appendChild(pluginDevTitle);
    };
    const createPlugin = (plugin) => {
        const li = document.createElement('li');
        const div = document.createElement('div');
        const label = document.createElement('label');
        const top = `<span>${plugin.display}</span> by <a href='${plugin.author.href}'>${plugin.author.name}</a><br/>${plugin.blurb}`;
        const bottom = `<a href='https://www.npmjs.com/package/${plugin.module}'>npm</a> | <a href="${plugin.repo}">repo</a>`;
        label.innerHTML = `${top}<br/>${bottom}`;
        const key = 'plugin-' + plugin.module;
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.id = key;
        input.checked = !!localStorage.getItem(key);
        input.onchange = () => {
            announceWeNeedARestart();
            if (input.checked) {
                // @ts-ignore
                window.appInsights &&
                    // @ts-ignore
                    window.appInsights.trackEvent({ name: 'Added Registry Plugin', properties: { id: key } });
                localStorage.setItem(key, 'true');
            }
            else {
                localStorage.removeItem(key);
            }
        };
        label.htmlFor = input.id;
        div.appendChild(input);
        div.appendChild(label);
        li.appendChild(div);
        return li;
    };
    const createButton = (setting) => {
        const li = document.createElement('li');
        const label = document.createElement('label');
        label.innerHTML = `<span>${setting.display}</span><br/>${setting.blurb}`;
        const key = 'compiler-setting-' + setting.flag;
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.id = key;
        input.checked = !!localStorage.getItem(key);
        input.onchange = () => {
            if (input.checked) {
                localStorage.setItem(key, 'true');
            }
            else {
                localStorage.removeItem(key);
            }
        };
        label.htmlFor = input.id;
        li.appendChild(input);
        li.appendChild(label);
        return li;
    };
    const createNewModuleInputForm = (updateOL, i) => {
        const form = document.createElement('form');
        const newModuleInput = document.createElement('input');
        newModuleInput.type = 'text';
        newModuleInput.id = 'gist-input';
        newModuleInput.placeholder = i('play_sidebar_options_modules_placeholder');
        form.appendChild(newModuleInput);
        form.onsubmit = e => {
            announceWeNeedARestart();
            exports.addCustomPlugin(newModuleInput.value);
            e.stopPropagation();
            updateOL();
            return false;
        };
        return form;
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3B0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BsYXlncm91bmQvc3JjL3NpZGViYXIvb3B0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFFQSxNQUFNLGNBQWMsR0FBRztRQUNyQjtZQUNFLE1BQU0sRUFBRSx5Q0FBeUM7WUFDakQsT0FBTyxFQUFFLG1CQUFtQjtZQUM1QixLQUFLLEVBQUUsc0dBQXNHO1lBQzdHLElBQUksRUFBRSxtREFBbUQ7WUFDekQsTUFBTSxFQUFFO2dCQUNOLElBQUksRUFBRSxNQUFNO2dCQUNaLElBQUksRUFBRSxpQkFBaUI7YUFDeEI7U0FDRjtLQUNGLENBQUE7SUFFRCw2RUFBNkU7SUFDaEUsUUFBQSwwQkFBMEIsR0FBRyxHQUFHLEVBQUU7UUFDN0MsT0FBTyxDQUFDLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFBO0lBQ3RFLENBQUMsQ0FBQTtJQUVZLFFBQUEsYUFBYSxHQUFHLEdBQUcsRUFBRTtRQUNoQyxNQUFNLFFBQVEsR0FBRyxhQUFhLEVBQUUsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFBO1FBQzVELE9BQU8sUUFBUSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDbEcsQ0FBQyxDQUFBO0lBRUQsTUFBTSxtQkFBbUIsR0FBRyxDQUFDLEdBQVcsRUFBRSxFQUFFO1FBQzFDLE1BQU0sVUFBVSxHQUFHLGFBQWEsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQTtRQUN6RCxZQUFZLENBQUMsT0FB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QUMsSUFBSSxHQUFHLE1BQU0sQ0FBQTtRQUM1QixjQUFjLENBQUMsRUFBRSxHQUFHLFlBQVksQ0FBQTtRQUNoQyxjQUFjLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQywwQ0FBMEMsQ0FBQyxDQUFBO1FBQzFFLElBQUksQ0FBQyxXQUFXLENBQUMsY0FBYyxDQUFDLENBQUE7UUFFaEMsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsRUFBRTtZQUNsQixzQkFBc0IsRUFBRSxDQUFBO1lBQ3hCLHVCQUFlLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFBO1lBQ3JDLENBQUMsQ0FBQyxlQUFlLEVBQUUsQ0FBQTtZQUNuQixRQUFRLEVBQUUsQ0FBQTtZQUNWLE9BQU8sS0FBSyxDQUFBO1FBQ2QsQ0FBQyxDQUFBO1FBRUQsT0FBTyxJQUFJLENBQUE7SUFDYixDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBQbGF5Z3JvdW5kUGx1Z2luLCBQbHVnaW5GYWN0b3J5IH0gZnJvbSAnLi4nXG5cbmNvbnN0IHBsdWdpblJlZ2lzdHJ5ID0gW1xuICB7XG4gICAgbW9kdWxlOiAndHlwZXNjcmlwdC1wbGF5Z3JvdW5kLXByZXNlbnRhdGlvbi1tb2RlJyxcbiAgICBkaXNwbGF5OiAnUHJlc2VudGF0aW9uIE1vZGUnLFxuICAgIGJsdXJiOiAnQ3JlYXRlIHByZXNlbnRhdGlvbnMgaW5zaWRlIHRoZSBUeXBlU2NyaXB0IHBsYXlncm91bmQsIHNlYW1sZXNzbHkganVtcCBiZXR3ZWVuIHNsaWRlcyBhbmQgbGl2ZS1jb2RlLicsXG4gICAgcmVwbzogJ2h0dHBzOi8vZ2l0aHViLmNvbS9vcnRhL3BsYXlncm91bmQtc2xpZGVzLyNSRUFETUUnLFxuICAgIGF1dGhvcjoge1xuICAgICAgbmFtZTogJ09ydGEnLFxuICAgICAgaHJlZjogJ2h0dHBzOi8vb3J0YS5pbycsXG4gICAgfSxcbiAgfSxcbl1cblxuLyoqIFdoZXRoZXIgdGhlIHBsYXlncm91bmQgc2hvdWxkIGFjdGl2ZWx5IHJlYWNoIG91dCB0byBhbiBleGlzdGluZyBwbHVnaW4gKi9cbmV4cG9ydCBjb25zdCBhbGxvd0Nvbm5lY3RpbmdUb0xvY2FsaG9zdCA9ICgpID0+IHtcbiAgcmV0dXJuICEhbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2NvbXBpbGVyLXNldHRpbmctY29ubmVjdC1kZXYtcGx1Z2luJylcbn1cblxuZXhwb3J0IGNvbnN0IGFjdGl2ZVBsdWdpbnMgPSAoKSA9PiB7XG4gIGNvbnN0IGV4aXN0aW5nID0gY3VzdG9tUGx1Z2lucygpLm1hcChtb2R1bGUgPT4gKHsgbW9kdWxlIH0pKVxuICByZXR1cm4gZXhpc3RpbmcuY29uY2F0KHBsdWdpblJlZ2lzdHJ5LmZpbHRlcihwID0+ICEhbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3BsdWdpbi0nICsgcC5tb2R1bGUpKSlcbn1cblxuY29uc3QgcmVtb3ZlQ3VzdG9tUGx1Z2lucyA9IChtb2Q6IHN0cmluZykgPT4ge1xuICBjb25zdCBuZXdQbHVnaW5zID0gY3VzdG9tUGx1Z2lucygpLmZpbHRlcihwID0+IHAgIT09IG1vZClcbiAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2N1c3RvbS1wbHVnaW5zLXBsYXlncm91bmQnLCBKU09OLnN0cmluZ2lmeShuZXdQbHVnaW5zKSlcbn1cblxuZXhwb3J0IGNvbnN0IGFkZEN1c3RvbVBsdWdpbiA9IChtb2Q6IHN0cmluZykgPT4ge1xuICBjb25zdCBuZXdQbHVnaW5zID0gY3VzdG9tUGx1Z2lucygpXG4gIG5ld1BsdWdpbnMucHVzaChtb2QpXG4gIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdjdXN0b20tcGx1Z2lucy1wbGF5Z3JvdW5kJywgSlNPTi5zdHJpbmdpZnkobmV3UGx1Z2lucykpXG4gIC8vIEB0cy1pZ25vcmVcbiAgd2luZG93LmFwcEluc2lnaHRzICYmXG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIHdpbmRvdy5hcHBJbnNpZ2h0cy50cmFja0V2ZW50KHsgbmFtZTogJ0FkZGVkIEN1c3RvbSBNb2R1bGUnLCBwcm9wZXJ0aWVzOiB7IGlkOiBtb2QgfSB9KVxufVxuXG5jb25zdCBjdXN0b21QbHVnaW5zID0gKCk6IHN0cmluZ1tdID0+IHtcbiAgcmV0dXJuIEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2N1c3RvbS1wbHVnaW5zLXBsYXlncm91bmQnKSB8fCAnW10nKVxufVxuXG5leHBvcnQgY29uc3Qgb3B0aW9uc1BsdWdpbjogUGx1Z2luRmFjdG9yeSA9IGkgPT4ge1xuICBjb25zdCBzZXR0aW5ncyA9IFtcbiAgICB7XG4gICAgICBkaXNwbGF5OiBpKCdwbGF5X3NpZGViYXJfb3B0aW9uc19kaXNhYmxlX2F0YScpLFxuICAgICAgYmx1cmI6IGkoJ3BsYXlfc2lkZWJhcl9vcHRpb25zX2Rpc2FibGVfYXRhX2NvcHknKSxcbiAgICAgIGZsYWc6ICdkaXNhYmxlLWF0YScsXG4gICAgfSxcbiAgICB7XG4gICAgICBkaXNwbGF5OiBpKCdwbGF5X3NpZGViYXJfb3B0aW9uc19kaXNhYmxlX3NhdmUnKSxcbiAgICAgIGJsdXJiOiBpKCdwbGF5X3NpZGViYXJfb3B0aW9uc19kaXNhYmxlX3NhdmVfY29weScpLFxuICAgICAgZmxhZzogJ2Rpc2FibGUtc2F2ZS1vbi10eXBlJyxcbiAgICB9LFxuICAgIC8vIHtcbiAgICAvLyAgIGRpc3BsYXk6ICdWZXJib3NlIExvZ2dpbmcnLFxuICAgIC8vICAgYmx1cmI6ICdUdXJuIG9uIHN1cGVyZmx1b3VzIGxvZ2dpbmcnLFxuICAgIC8vICAgZmxhZzogJ2VuYWJsZS1zdXBlcmZsdW91cy1sb2dnaW5nJyxcbiAgICAvLyB9LFxuICBdXG5cbiAgY29uc3QgcGx1Z2luOiBQbGF5Z3JvdW5kUGx1Z2luID0ge1xuICAgIGlkOiAnb3B0aW9ucycsXG4gICAgZGlzcGxheU5hbWU6IGkoJ3BsYXlfc2lkZWJhcl9vcHRpb25zJyksXG4gICAgLy8gc2hvdWxkQmVTZWxlY3RlZDogKCkgPT4gdHJ1ZSwgLy8gdW5jb21tZW50IHRvIG1ha2UgdGhpcyB0aGUgZmlyc3QgdGFiIG9uIHJlbG9hZHNcbiAgICB3aWxsTW91bnQ6IChfc2FuZGJveCwgY29udGFpbmVyKSA9PiB7XG4gICAgICBjb25zdCBjYXRlZ29yeURpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoY2F0ZWdvcnlEaXYpXG5cbiAgICAgIGNvbnN0IHAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJylcbiAgICAgIHAuaWQgPSAncmVzdGFydC1yZXF1aXJlZCdcbiAgICAgIHAudGV4dENvbnRlbnQgPSBpKCdwbGF5X3NpZGViYXJfb3B0aW9uc19yZXN0YXJ0X3JlcXVpcmVkJylcbiAgICAgIGNhdGVnb3J5RGl2LmFwcGVuZENoaWxkKHApXG5cbiAgICAgIGNvbnN0IG9sID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnb2wnKVxuICAgICAgb2wuY2xhc3NOYW1lID0gJ3BsYXlncm91bmQtb3B0aW9ucydcblxuICAgICAgY3JlYXRlU2VjdGlvbihpKCdwbGF5X3NpZGViYXJfb3B0aW9uc19leHRlcm5hbCcpLCBjYXRlZ29yeURpdilcblxuICAgICAgY29uc3QgcGx1Z2luc09MID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnb2wnKVxuICAgICAgcGx1Z2luc09MLmNsYXNzTmFtZSA9ICdwbGF5Z3JvdW5kLXBsdWdpbnMnXG4gICAgICBwbHVnaW5SZWdpc3RyeS5mb3JFYWNoKHBsdWdpbiA9PiB7XG4gICAgICAgIGNvbnN0IHNldHRpbmdCdXR0b24gPSBjcmVhdGVQbHVnaW4ocGx1Z2luKVxuICAgICAgICBwbHVnaW5zT0wuYXBwZW5kQ2hpbGQoc2V0dGluZ0J1dHRvbilcbiAgICAgIH0pXG4gICAgICBjYXRlZ29yeURpdi5hcHBlbmRDaGlsZChwbHVnaW5zT0wpXG5cbiAgICAgIGNvbnN0IHdhcm5pbmcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJylcbiAgICAgIHdhcm5pbmcuY2xhc3NOYW1lID0gJ3dhcm5pbmcnXG4gICAgICB3YXJuaW5nLnRleHRDb250ZW50ID0gaSgncGxheV9zaWRlYmFyX29wdGlvbnNfZXh0ZXJuYWxfd2FybmluZycpXG4gICAgICBjYXRlZ29yeURpdi5hcHBlbmRDaGlsZCh3YXJuaW5nKVxuXG4gICAgICBjcmVhdGVTZWN0aW9uKGkoJ3BsYXlfc2lkZWJhcl9vcHRpb25zX21vZHVsZXMnKSwgY2F0ZWdvcnlEaXYpXG4gICAgICBjb25zdCBjdXN0b21Nb2R1bGVzT0wgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvbCcpXG4gICAgICBjdXN0b21Nb2R1bGVzT0wuY2xhc3NOYW1lID0gJ2N1c3RvbS1tb2R1bGVzJ1xuXG4gICAgICBjb25zdCB1cGRhdGVDdXN0b21Nb2R1bGVzID0gKCkgPT4ge1xuICAgICAgICB3aGlsZSAoY3VzdG9tTW9kdWxlc09MLmZpcnN0Q2hpbGQpIHtcbiAgICAgICAgICBjdXN0b21Nb2R1bGVzT0wucmVtb3ZlQ2hpbGQoY3VzdG9tTW9kdWxlc09MLmZpcnN0Q2hpbGQpXG4gICAgICAgIH1cbiAgICAgICAgY3VzdG9tUGx1Z2lucygpLmZvckVhY2gobW9kdWxlID0+IHtcbiAgICAgICAgICBjb25zdCBsaSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJylcbiAgICAgICAgICBsaS5pbm5lckhUTUwgPSBtb2R1bGVcbiAgICAgICAgICBjb25zdCBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpXG4gICAgICAgICAgYS5ocmVmID0gJyMnXG4gICAgICAgICAgYS50ZXh0Q29udGVudCA9ICdYJ1xuICAgICAgICAgIGEub25jbGljayA9ICgpID0+IHtcbiAgICAgICAgICAgIHJlbW92ZUN1c3RvbVBsdWdpbnMobW9kdWxlKVxuICAgICAgICAgICAgdXBkYXRlQ3VzdG9tTW9kdWxlcygpXG4gICAgICAgICAgICBhbm5vdW5jZVdlTmVlZEFSZXN0YXJ0KClcbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICAgIH1cbiAgICAgICAgICBsaS5hcHBlbmRDaGlsZChhKVxuXG4gICAgICAgICAgY3VzdG9tTW9kdWxlc09MLmFwcGVuZENoaWxkKGxpKVxuICAgICAgICB9KVxuICAgICAgfVxuICAgICAgdXBkYXRlQ3VzdG9tTW9kdWxlcygpXG5cbiAgICAgIGNhdGVnb3J5RGl2LmFwcGVuZENoaWxkKGN1c3RvbU1vZHVsZXNPTClcbiAgICAgIGNvbnN0IGlucHV0Rm9ybSA9IGNyZWF0ZU5ld01vZHVsZUlucHV0Rm9ybSh1cGRhdGVDdXN0b21Nb2R1bGVzLCBpKVxuICAgICAgY2F0ZWdvcnlEaXYuYXBwZW5kQ2hpbGQoaW5wdXRGb3JtKVxuXG4gICAgICBjcmVhdGVTZWN0aW9uKCdQbHVnaW4gRGV2JywgY2F0ZWdvcnlEaXYpXG5cbiAgICAgIGNvbnN0IHBsdWdpbnNEZXZPTCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ29sJylcbiAgICAgIHBsdWdpbnNEZXZPTC5jbGFzc05hbWUgPSAncGxheWdyb3VuZC1vcHRpb25zJ1xuICAgICAgY29uc3QgY29ubmVjdFRvRGV2ID0gY3JlYXRlQnV0dG9uKHtcbiAgICAgICAgZGlzcGxheTogaSgncGxheV9zaWRlYmFyX29wdGlvbnNfcGx1Z2luX2Rldl9vcHRpb24nKSxcbiAgICAgICAgYmx1cmI6IGkoJ3BsYXlfc2lkZWJhcl9vcHRpb25zX3BsdWdpbl9kZXZfY29weScpLFxuICAgICAgICBmbGFnOiAnY29ubmVjdC1kZXYtcGx1Z2luJyxcbiAgICAgIH0pXG4gICAgICBwbHVnaW5zRGV2T0wuYXBwZW5kQ2hpbGQoY29ubmVjdFRvRGV2KVxuICAgICAgY2F0ZWdvcnlEaXYuYXBwZW5kQ2hpbGQocGx1Z2luc0Rldk9MKVxuXG4gICAgICBjYXRlZ29yeURpdi5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdocicpKVxuXG4gICAgICBjcmVhdGVTZWN0aW9uKGkoJ3BsYXlfc2lkZWJhcl9vcHRpb25zJyksIGNhdGVnb3J5RGl2KVxuXG4gICAgICBzZXR0aW5ncy5mb3JFYWNoKHNldHRpbmcgPT4ge1xuICAgICAgICBjb25zdCBzZXR0aW5nQnV0dG9uID0gY3JlYXRlQnV0dG9uKHNldHRpbmcpXG4gICAgICAgIG9sLmFwcGVuZENoaWxkKHNldHRpbmdCdXR0b24pXG4gICAgICB9KVxuXG4gICAgICBjYXRlZ29yeURpdi5hcHBlbmRDaGlsZChvbClcbiAgICB9LFxuICB9XG5cbiAgcmV0dXJuIHBsdWdpblxufVxuXG5jb25zdCBhbm5vdW5jZVdlTmVlZEFSZXN0YXJ0ID0gKCkgPT4ge1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVzdGFydC1yZXF1aXJlZCcpIS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJ1xufVxuXG5jb25zdCBjcmVhdGVTZWN0aW9uID0gKHRpdGxlOiBzdHJpbmcsIGNvbnRhaW5lcjogRWxlbWVudCkgPT4ge1xuICBjb25zdCBwbHVnaW5EZXZUaXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2g0JylcbiAgcGx1Z2luRGV2VGl0bGUudGV4dENvbnRlbnQgPSB0aXRsZVxuICBjb250YWluZXIuYXBwZW5kQ2hpbGQocGx1Z2luRGV2VGl0bGUpXG59XG5cbmNvbnN0IGNyZWF0ZVBsdWdpbiA9IChwbHVnaW46IHR5cGVvZiBwbHVnaW5SZWdpc3RyeVswXSkgPT4ge1xuICBjb25zdCBsaSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJylcbiAgY29uc3QgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcblxuICBjb25zdCBsYWJlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xhYmVsJylcblxuICBjb25zdCB0b3AgPSBgPHNwYW4+JHtwbHVnaW4uZGlzcGxheX08L3NwYW4+IGJ5IDxhIGhyZWY9JyR7cGx1Z2luLmF1dGhvci5ocmVmfSc+JHtwbHVnaW4uYXV0aG9yLm5hbWV9PC9hPjxici8+JHtwbHVnaW4uYmx1cmJ9YFxuICBjb25zdCBib3R0b20gPSBgPGEgaHJlZj0naHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvJHtwbHVnaW4ubW9kdWxlfSc+bnBtPC9hPiB8IDxhIGhyZWY9XCIke3BsdWdpbi5yZXBvfVwiPnJlcG88L2E+YFxuICBsYWJlbC5pbm5lckhUTUwgPSBgJHt0b3B9PGJyLz4ke2JvdHRvbX1gXG5cbiAgY29uc3Qga2V5ID0gJ3BsdWdpbi0nICsgcGx1Z2luLm1vZHVsZVxuICBjb25zdCBpbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0JylcbiAgaW5wdXQudHlwZSA9ICdjaGVja2JveCdcbiAgaW5wdXQuaWQgPSBrZXlcbiAgaW5wdXQuY2hlY2tlZCA9ICEhbG9jYWxTdG9yYWdlLmdldEl0ZW0oa2V5KVxuXG4gIGlucHV0Lm9uY2hhbmdlID0gKCkgPT4ge1xuICAgIGFubm91bmNlV2VOZWVkQVJlc3RhcnQoKVxuICAgIGlmIChpbnB1dC5jaGVja2VkKSB7XG4gICAgICAvLyBAdHMtaWdub3JlXG4gICAgICB3aW5kb3cuYXBwSW5zaWdodHMgJiZcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICB3aW5kb3cuYXBwSW5zaWdodHMudHJhY2tFdmVudCh7IG5hbWU6ICdBZGRlZCBSZWdpc3RyeSBQbHVnaW4nLCBwcm9wZXJ0aWVzOiB7IGlkOiBrZXkgfSB9KVxuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oa2V5LCAndHJ1ZScpXG4gICAgfSBlbHNlIHtcbiAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKGtleSlcbiAgICB9XG4gIH1cblxuICBsYWJlbC5odG1sRm9yID0gaW5wdXQuaWRcblxuICBkaXYuYXBwZW5kQ2hpbGQoaW5wdXQpXG4gIGRpdi5hcHBlbmRDaGlsZChsYWJlbClcbiAgbGkuYXBwZW5kQ2hpbGQoZGl2KVxuICByZXR1cm4gbGlcbn1cblxuY29uc3QgY3JlYXRlQnV0dG9uID0gKHNldHRpbmc6IHsgYmx1cmI6IHN0cmluZzsgZmxhZzogc3RyaW5nOyBkaXNwbGF5OiBzdHJpbmcgfSkgPT4ge1xuICBjb25zdCBsaSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJylcbiAgY29uc3QgbGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsYWJlbCcpXG4gIGxhYmVsLmlubmVySFRNTCA9IGA8c3Bhbj4ke3NldHRpbmcuZGlzcGxheX08L3NwYW4+PGJyLz4ke3NldHRpbmcuYmx1cmJ9YFxuXG4gIGNvbnN0IGtleSA9ICdjb21waWxlci1zZXR0aW5nLScgKyBzZXR0aW5nLmZsYWdcbiAgY29uc3QgaW5wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpXG4gIGlucHV0LnR5cGUgPSAnY2hlY2tib3gnXG4gIGlucHV0LmlkID0ga2V5XG4gIGlucHV0LmNoZWNrZWQgPSAhIWxvY2FsU3RvcmFnZS5nZXRJdGVtKGtleSlcblxuICBpbnB1dC5vbmNoYW5nZSA9ICgpID0+IHtcbiAgICBpZiAoaW5wdXQuY2hlY2tlZCkge1xuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oa2V5LCAndHJ1ZScpXG4gICAgfSBlbHNlIHtcbiAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKGtleSlcbiAgICB9XG4gIH1cblxuICBsYWJlbC5odG1sRm9yID0gaW5wdXQuaWRcblxuICBsaS5hcHBlbmRDaGlsZChpbnB1dClcbiAgbGkuYXBwZW5kQ2hpbGQobGFiZWwpXG4gIHJldHVybiBsaVxufVxuXG5jb25zdCBjcmVhdGVOZXdNb2R1bGVJbnB1dEZvcm0gPSAodXBkYXRlT0w6IEZ1bmN0aW9uLCBpOiBhbnkpID0+IHtcbiAgY29uc3QgZm9ybSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2Zvcm0nKVxuXG4gIGNvbnN0IG5ld01vZHVsZUlucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKVxuICBuZXdNb2R1bGVJbnB1dC50eXBlID0gJ3RleHQnXG4gIG5ld01vZHVsZUlucHV0LmlkID0gJ2dpc3QtaW5wdXQnXG4gIG5ld01vZHVsZUlucHV0LnBsYWNlaG9sZGVyID0gaSgncGxheV9zaWRlYmFyX29wdGlvbnNfbW9kdWxlc19wbGFjZWhvbGRlcicpXG4gIGZvcm0uYXBwZW5kQ2hpbGQobmV3TW9kdWxlSW5wdXQpXG5cbiAgZm9ybS5vbnN1Ym1pdCA9IGUgPT4ge1xuICAgIGFubm91bmNlV2VOZWVkQVJlc3RhcnQoKVxuICAgIGFkZEN1c3RvbVBsdWdpbihuZXdNb2R1bGVJbnB1dC52YWx1ZSlcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG4gICAgdXBkYXRlT0woKVxuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgcmV0dXJuIGZvcm1cbn1cbiJdfQ==