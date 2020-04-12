define(["require", "exports", "../localizeWithFallback"], function (require, exports, localizeWithFallback_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let allLogs = '';
    exports.runPlugin = i => {
        const plugin = {
            id: 'logs',
            displayName: i('play_sidebar_logs'),
            willMount: (sandbox, container) => {
                if (allLogs.length === 0) {
                    const noErrorsMessage = document.createElement('div');
                    noErrorsMessage.id = 'empty-message-container';
                    container.appendChild(noErrorsMessage);
                    const message = document.createElement('div');
                    message.textContent = localizeWithFallback_1.localize('play_sidebar_logs_no_logs', 'No logs');
                    message.classList.add('empty-plugin-message');
                    noErrorsMessage.appendChild(message);
                }
                const errorUL = document.createElement('div');
                errorUL.id = 'log-container';
                container.appendChild(errorUL);
                const logs = document.createElement('div');
                logs.id = 'log';
                logs.innerHTML = allLogs;
                errorUL.appendChild(logs);
            },
        };
        return plugin;
    };
    exports.runWithCustomLogs = (closure, i) => {
        const noLogs = document.getElementById('empty-message-container');
        if (noLogs) {
            noLogs.style.display = 'none';
        }
        rewireLoggingToElement(() => document.getElementById('log'), () => document.getElementById('log-container'), closure, true, i);
    };
    // Thanks SO: https://stackoverflow.com/questions/20256760/javascript-console-log-to-html/35449256#35449256
    function rewireLoggingToElement(eleLocator, eleOverflowLocator, closure, autoScroll, i) {
        fixLoggingFunc('log', 'LOG');
        fixLoggingFunc('debug', 'DBG');
        fixLoggingFunc('warn', 'WRN');
        fixLoggingFunc('error', 'ERR');
        fixLoggingFunc('info', 'INF');
        closure.then(js => {
            try {
                eval(js);
            }
            catch (error) {
                console.error(i('play_run_js_fail'));
                console.error(error);
            }
            allLogs = allLogs + '<hr />';
            undoLoggingFunc('log');
            undoLoggingFunc('debug');
            undoLoggingFunc('warn');
            undoLoggingFunc('error');
            undoLoggingFunc('info');
        });
        function undoLoggingFunc(name) {
            // @ts-ignore
            console[name] = console['old' + name];
        }
        function fixLoggingFunc(name, id) {
            // @ts-ignore
            console['old' + name] = console[name];
            // @ts-ignore
            console[name] = function (...objs) {
                const output = produceOutput(objs);
                const eleLog = eleLocator();
                const prefix = '[<span class="log-' + name + '">' + id + '</span>]: ';
                const eleContainerLog = eleOverflowLocator();
                allLogs = allLogs + prefix + output + '<br>';
                if (eleLog && eleContainerLog) {
                    if (autoScroll) {
                        const atBottom = eleContainerLog.scrollHeight - eleContainerLog.clientHeight <= eleContainerLog.scrollTop + 1;
                        eleLog.innerHTML = allLogs;
                        if (atBottom)
                            eleContainerLog.scrollTop = eleContainerLog.scrollHeight - eleContainerLog.clientHeight;
                    }
                    else {
                        eleLog.innerHTML = allLogs;
                    }
                }
                // @ts-ignore
                console['old' + name].apply(undefined, objs);
            };
        }
        function produceOutput(args) {
            return args.reduce((output, arg, index) => {
                const isObj = typeof arg === 'object';
                let textRep = '';
                if (arg && arg.stack && arg.message) {
                    // special case for err
                    textRep = arg.message;
                }
                else if (isObj) {
                    textRep = JSON.stringify(arg, null, 2);
                }
                else {
                    textRep = arg;
                }
                const showComma = index !== args.length - 1;
                const comma = showComma ? "<span class='comma'>, </span>" : '';
                return output + textRep + comma + '&nbsp;';
            }, '');
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVudGltZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BsYXlncm91bmQvc3JjL3NpZGViYXIvcnVudGltZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFHQSxJQUFJLE9BQU8sR0FBRyxFQUFFLENBQUE7SUFFSCxRQUFBLFNBQVMsR0FBa0IsQ0FBQyxDQUFDLEVBQUU7UUFDMUMsTUFBTSxNQUFNLEdBQXFCO1lBQy9CLEVBQUUsRUFBRSxNQUFNO1lBQ1YsV0FBVyxFQUFFLENBQUMsQ0FBQyxtQkFBbUIsQ0FBQztZQUNuQyxTQUFTLEVBQUUsQ0FBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLEVBQUU7Z0JBQ2hDLElBQUksT0FBTyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7b0JBQ3hCLE1BQU0sZUFBZSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUE7b0JBQ3JELGVBQWUsQ0FBQyxFQUFFLEdBQUcseUJBQXlCLENBQUE7b0JBQzlDLFNBQVMsQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDLENBQUE7b0JBRXRDLE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUE7b0JBQzdDLE9BQU8sQ0FBQyxXQUFXLEdBQUcsK0JBQVEsQ0FBQywyQkFBMkIsRUFBRSxTQUFTLENBQUMsQ0FBQTtvQkFDdEUsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsc0JBQXNCLENBQUMsQ0FBQTtvQkFDN0MsZUFBZSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQTtpQkFDckM7Z0JBRUQsTUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQTtnQkFDN0MsT0FBTyxDQUFDLEVBQUUsR0FBRyxlQUFlLENBQUE7Z0JBQzVCLFNBQVMsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUE7Z0JBRTlCLE1BQU0sSUFBSSxHQUFHLFFBQVEsQ0FB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QUssS0FBSyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQTtnQkFDM0MsTUFBTSxLQUFLLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQywrQkFBK0IsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFBO2dCQUM5RCxPQUFPLE1BQU0sR0FBRyxPQUFPLEdBQUcsS0FBSyxHQUFHLFFBQVEsQ0FBQTtZQUM1QyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUE7UUFDUixDQUFDO0lBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFBsYXlncm91bmRQbHVnaW4sIFBsdWdpbkZhY3RvcnkgfSBmcm9tICcuLidcbmltcG9ydCB7IGxvY2FsaXplIH0gZnJvbSAnLi4vbG9jYWxpemVXaXRoRmFsbGJhY2snXG5cbmxldCBhbGxMb2dzID0gJydcblxuZXhwb3J0IGNvbnN0IHJ1blBsdWdpbjogUGx1Z2luRmFjdG9yeSA9IGkgPT4ge1xuICBjb25zdCBwbHVnaW46IFBsYXlncm91bmRQbHVnaW4gPSB7XG4gICAgaWQ6ICdsb2dzJyxcbiAgICBkaXNwbGF5TmFtZTogaSgncGxheV9zaWRlYmFyX2xvZ3MnKSxcbiAgICB3aWxsTW91bnQ6IChzYW5kYm94LCBjb250YWluZXIpID0+IHtcbiAgICAgIGlmIChhbGxMb2dzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBjb25zdCBub0Vycm9yc01lc3NhZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgICAgICBub0Vycm9yc01lc3NhZ2UuaWQgPSAnZW1wdHktbWVzc2FnZS1jb250YWluZXInXG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChub0Vycm9yc01lc3NhZ2UpXG5cbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgICAgIG1lc3NhZ2UudGV4dENvbnRlbnQgPSBsb2NhbGl6ZSgncGxheV9zaWRlYmFyX2xvZ3Nfbm9fbG9ncycsICdObyBsb2dzJylcbiAgICAgICAgbWVzc2FnZS5jbGFzc0xpc3QuYWRkKCdlbXB0eS1wbHVnaW4tbWVzc2FnZScpXG4gICAgICAgIG5vRXJyb3JzTWVzc2FnZS5hcHBlbmRDaGlsZChtZXNzYWdlKVxuICAgICAgfVxuXG4gICAgICBjb25zdCBlcnJvclVMID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICAgIGVycm9yVUwuaWQgPSAnbG9nLWNvbnRhaW5lcidcbiAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChlcnJvclVMKVxuXG4gICAgICBjb25zdCBsb2dzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICAgIGxvZ3MuaWQgPSAnbG9nJ1xuICAgICAgbG9ncy5pbm5lckhUTUwgPSBhbGxMb2dzXG4gICAgICBlcnJvclVMLmFwcGVuZENoaWxkKGxvZ3MpXG4gICAgfSxcbiAgfVxuXG4gIHJldHVybiBwbHVnaW5cbn1cblxuZXhwb3J0IGNvbnN0IHJ1bldpdGhDdXN0b21Mb2dzID0gKGNsb3N1cmU6IFByb21pc2U8c3RyaW5nPiwgaTogRnVuY3Rpb24pID0+IHtcbiAgY29uc3Qgbm9Mb2dzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2VtcHR5LW1lc3NhZ2UtY29udGFpbmVyJylcbiAgaWYgKG5vTG9ncykge1xuICAgIG5vTG9ncy5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXG4gIH1cblxuICByZXdpcmVMb2dnaW5nVG9FbGVtZW50KFxuICAgICgpID0+IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsb2cnKSEsXG4gICAgKCkgPT4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xvZy1jb250YWluZXInKSEsXG4gICAgY2xvc3VyZSxcbiAgICB0cnVlLFxuICAgIGlcbiAgKVxufVxuXG4vLyBUaGFua3MgU086IGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzIwMjU2NzYwL2phdmFzY3JpcHQtY29uc29sZS1sb2ctdG8taHRtbC8zNTQ0OTI1NiMzNTQ0OTI1NlxuXG5mdW5jdGlvbiByZXdpcmVMb2dnaW5nVG9FbGVtZW50KFxuICBlbGVMb2NhdG9yOiAoKSA9PiBFbGVtZW50LFxuICBlbGVPdmVyZmxvd0xvY2F0b3I6ICgpID0+IEVsZW1lbnQsXG4gIGNsb3N1cmU6IFByb21pc2U8c3RyaW5nPixcbiAgYXV0b1Njcm9sbDogYm9vbGVhbixcbiAgaTogRnVuY3Rpb25cbikge1xuICBmaXhMb2dnaW5nRnVuYygnbG9nJywgJ0xPRycpXG4gIGZpeExvZ2dpbmdGdW5jKCdkZWJ1ZycsICdEQkcnKVxuICBmaXhMb2dnaW5nRnVuYygnd2FybicsICdXUk4nKVxuICBmaXhMb2dnaW5nRnVuYygnZXJyb3InLCAnRVJSJylcbiAgZml4TG9nZ2luZ0Z1bmMoJ2luZm8nLCAnSU5GJylcblxuICBjbG9zdXJlLnRoZW4oanMgPT4ge1xuICAgIHRyeSB7XG4gICAgICBldmFsKGpzKVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGkoJ3BsYXlfcnVuX2pzX2ZhaWwnKSlcbiAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpXG4gICAgfVxuXG4gICAgYWxsTG9ncyA9IGFsbExvZ3MgKyAnPGhyIC8+J1xuXG4gICAgdW5kb0xvZ2dpbmdGdW5jKCdsb2cnKVxuICAgIHVuZG9Mb2dnaW5nRnVuYygnZGVidWcnKVxuICAgIHVuZG9Mb2dnaW5nRnVuYygnd2FybicpXG4gICAgdW5kb0xvZ2dpbmdGdW5jKCdlcnJvcicpXG4gICAgdW5kb0xvZ2dpbmdGdW5jKCdpbmZvJylcbiAgfSlcblxuICBmdW5jdGlvbiB1bmRvTG9nZ2luZ0Z1bmMobmFtZTogc3RyaW5nKSB7XG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIGNvbnNvbGVbbmFtZV0gPSBjb25zb2xlWydvbGQnICsgbmFtZV1cbiAgfVxuXG4gIGZ1bmN0aW9uIGZpeExvZ2dpbmdGdW5jKG5hbWU6IHN0cmluZywgaWQ6IHN0cmluZykge1xuICAgIC8vIEB0cy1pZ25vcmVcbiAgICBjb25zb2xlWydvbGQnICsgbmFtZV0gPSBjb25zb2xlW25hbWVdXG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIGNvbnNvbGVbbmFtZV0gPSBmdW5jdGlvbiguLi5vYmpzOiBhbnlbXSkge1xuICAgICAgY29uc3Qgb3V0cHV0ID0gcHJvZHVjZU91dHB1dChvYmpzKVxuICAgICAgY29uc3QgZWxlTG9nID0gZWxlTG9jYXRvcigpXG4gICAgICBjb25zdCBwcmVmaXggPSAnWzxzcGFuIGNsYXNzPVwibG9nLScgKyBuYW1lICsgJ1wiPicgKyBpZCArICc8L3NwYW4+XTogJ1xuICAgICAgY29uc3QgZWxlQ29udGFpbmVyTG9nID0gZWxlT3ZlcmZsb3dMb2NhdG9yKClcbiAgICAgIGFsbExvZ3MgPSBhbGxMb2dzICsgcHJlZml4ICsgb3V0cHV0ICsgJzxicj4nXG5cbiAgICAgIGlmIChlbGVMb2cgJiYgZWxlQ29udGFpbmVyTG9nKSB7XG4gICAgICAgIGlmIChhdXRvU2Nyb2xsKSB7XG4gICAgICAgICAgY29uc3QgYXRCb3R0b20gPSBlbGVDb250YWluZXJMb2cuc2Nyb2xsSGVpZ2h0IC0gZWxlQ29udGFpbmVyTG9nLmNsaWVudEhlaWdodCA8PSBlbGVDb250YWluZXJMb2cuc2Nyb2xsVG9wICsgMVxuICAgICAgICAgIGVsZUxvZy5pbm5lckhUTUwgPSBhbGxMb2dzXG5cbiAgICAgICAgICBpZiAoYXRCb3R0b20pIGVsZUNvbnRhaW5lckxvZy5zY3JvbGxUb3AgPSBlbGVDb250YWluZXJMb2cuc2Nyb2xsSGVpZ2h0IC0gZWxlQ29udGFpbmVyTG9nLmNsaWVudEhlaWdodFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGVsZUxvZy5pbm5lckhUTUwgPSBhbGxMb2dzXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgY29uc29sZVsnb2xkJyArIG5hbWVdLmFwcGx5KHVuZGVmaW5lZCwgb2JqcylcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBwcm9kdWNlT3V0cHV0KGFyZ3M6IGFueVtdKSB7XG4gICAgcmV0dXJuIGFyZ3MucmVkdWNlKChvdXRwdXQ6IGFueSwgYXJnOiBhbnksIGluZGV4KSA9PiB7XG4gICAgICBjb25zdCBpc09iaiA9IHR5cGVvZiBhcmcgPT09ICdvYmplY3QnXG4gICAgICBsZXQgdGV4dFJlcCA9ICcnXG4gICAgICBpZiAoYXJnICYmIGFyZy5zdGFjayAmJiBhcmcubWVzc2FnZSkge1xuICAgICAgICAvLyBzcGVjaWFsIGNhc2UgZm9yIGVyclxuICAgICAgICB0ZXh0UmVwID0gYXJnLm1lc3NhZ2VcbiAgICAgIH0gZWxzZSBpZiAoaXNPYmopIHtcbiAgICAgICAgdGV4dFJlcCA9IEpTT04uc3RyaW5naWZ5KGFyZywgbnVsbCwgMilcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRleHRSZXAgPSBhcmcgYXMgYW55XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHNob3dDb21tYSA9IGluZGV4ICE9PSBhcmdzLmxlbmd0aCAtIDFcbiAgICAgIGNvbnN0IGNvbW1hID0gc2hvd0NvbW1hID8gXCI8c3BhbiBjbGFzcz0nY29tbWEnPiwgPC9zcGFuPlwiIDogJydcbiAgICAgIHJldHVybiBvdXRwdXQgKyB0ZXh0UmVwICsgY29tbWEgKyAnJm5ic3A7J1xuICAgIH0sICcnKVxuICB9XG59XG4iXX0=