define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createDragBar = () => {
        const sidebar = document.createElement('div');
        sidebar.className = 'playground-dragbar';
        let left, right;
        const drag = (e) => {
            if (left && right) {
                // Get how far right the mouse is from the right
                const rightX = right.getBoundingClientRect().right;
                const offset = rightX - e.pageX;
                const screenClampLeft = window.innerWidth - 320;
                const clampedOffset = Math.min(Math.max(offset, 280), screenClampLeft);
                // Set the widths
                left.style.width = `calc(100% - ${clampedOffset}px)`;
                right.style.width = `${clampedOffset}px`;
                right.style.flexBasis = `${clampedOffset}px`;
                right.style.maxWidth = `${clampedOffset}px`;
                // Save the x coordinate of the
                if (window.localStorage) {
                    window.localStorage.setItem('dragbar-x', '' + clampedOffset);
                    window.localStorage.setItem('dragbar-window-width', '' + window.innerWidth);
                }
                // @ts-ignore - I know what I'm doing
                window.sandbox.editor.layout();
                // Don't allow selection
                e.stopPropagation();
                e.cancelBubble = true;
            }
        };
        sidebar.addEventListener('mousedown', e => {
            var _a;
            left = document.getElementById('editor-container');
            right = (_a = sidebar.parentElement) === null || _a === void 0 ? void 0 : _a.getElementsByClassName('playground-sidebar').item(0);
            // Handle dragging all over the screen
            document.addEventListener('mousemove', drag);
            // Remove it when you lt go anywhere
            document.addEventListener('mouseup', () => {
                document.removeEventListener('mousemove', drag);
                document.body.style.userSelect = 'auto';
            });
            // Don't allow the drag to select text accidentally
            document.body.style.userSelect = 'none';
            e.stopPropagation();
            e.cancelBubble = true;
        });
        return sidebar;
    };
    exports.sidebarHidden = () => !!window.localStorage.getItem('sidebar-hidden');
    exports.createSidebar = () => {
        const sidebar = document.createElement('div');
        sidebar.className = 'playground-sidebar';
        // Start with the sidebar hidden on small screens
        const isTinyScreen = window.innerWidth < 800;
        // This is independent of the sizing below so that you keep the same sized sidebar
        if (isTinyScreen || exports.sidebarHidden()) {
            sidebar.style.display = 'none';
        }
        if (window.localStorage && window.localStorage.getItem('dragbar-x')) {
            // Don't restore the x pos if the window isn't the same size
            if (window.innerWidth === Number(window.localStorage.getItem('dragbar-window-width'))) {
                // Set the dragger to the previous x pos
                let width = window.localStorage.getItem('dragbar-x');
                if (isTinyScreen) {
                    width = String(Math.min(Number(width), 280));
                }
                sidebar.style.width = `${width}px`;
                sidebar.style.flexBasis = `${width}px`;
                sidebar.style.maxWidth = `${width}px`;
                const left = document.getElementById('editor-container');
                left.style.width = `calc(100% - ${width}px)`;
            }
        }
        return sidebar;
    };
    const toggleIconWhenOpen = '&#x21E5;';
    const toggleIconWhenClosed = '&#x21E4;';
    exports.setupSidebarToggle = () => {
        const toggle = document.getElementById('sidebar-toggle');
        const updateToggle = () => {
            const sidebar = window.document.querySelector('.playground-sidebar');
            const sidebarShowing = sidebar.style.display !== 'none';
            toggle.innerHTML = sidebarShowing ? toggleIconWhenOpen : toggleIconWhenClosed;
            toggle.setAttribute('aria-label', sidebarShowing ? 'Hide Sidebar' : 'Show Sidebar');
        };
        toggle.onclick = () => {
            const sidebar = window.document.querySelector('.playground-sidebar');
            const newState = sidebar.style.display !== 'none';
            if (newState) {
                localStorage.setItem('sidebar-hidden', 'true');
                sidebar.style.display = 'none';
            }
            else {
                localStorage.removeItem('sidebar-hidden');
                sidebar.style.display = 'block';
            }
            updateToggle();
            // @ts-ignore - I know what I'm doing
            window.sandbox.editor.layout();
            return false;
        };
        // Ensure its set up at the start
        updateToggle();
    };
    exports.createTabBar = () => {
        const tabBar = document.createElement('div');
        tabBar.classList.add('playground-plugin-tabview');
        return tabBar;
    };
    exports.createPluginContainer = () => {
        const container = document.createElement('div');
        container.classList.add('playground-plugin-container');
        return container;
    };
    exports.createTabForPlugin = (plugin) => {
        const element = document.createElement('button');
        element.textContent = plugin.displayName;
        return element;
    };
    exports.activatePlugin = (plugin, previousPlugin, sandbox, tabBar, container) => {
        let newPluginTab, oldPluginTab;
        // @ts-ignore - This works at runtime
        for (const tab of tabBar.children) {
            if (tab.textContent === plugin.displayName)
                newPluginTab = tab;
            if (previousPlugin && tab.textContent === previousPlugin.displayName)
                oldPluginTab = tab;
        }
        // @ts-ignore
        if (!newPluginTab)
            throw new Error('Could not get a tab for the plugin: ' + plugin.displayName);
        // Tell the old plugin it's getting the boot
        // @ts-ignore
        if (previousPlugin && oldPluginTab) {
            if (previousPlugin.willUnmount)
                previousPlugin.willUnmount(sandbox, container);
            oldPluginTab.classList.remove('active');
        }
        // Wipe the sidebar
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
        // Start booting up the new plugin
        newPluginTab.classList.add('active');
        // Tell the new plugin to start doing some work
        if (plugin.willMount)
            plugin.willMount(sandbox, container);
        if (plugin.modelChanged)
            plugin.modelChanged(sandbox, sandbox.getModel());
        if (plugin.modelChangedDebounce)
            plugin.modelChangedDebounce(sandbox, sandbox.getModel());
        if (plugin.didMount)
            plugin.didMount(sandbox, container);
        // Let the previous plugin do any slow work after it's all done
        if (previousPlugin && previousPlugin.didUnmount)
            previousPlugin.didUnmount(sandbox, container);
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlRWxlbWVudHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wbGF5Z3JvdW5kL3NyYy9jcmVhdGVFbGVtZW50cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFJYSxRQUFBLGFBQWEsR0FBRyxHQUFHLEVBQUU7UUFDaEMsTUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQTtRQUM3QyxPQUFPLENBQUMsU0FBUyxHQUFHLG9CQUFvQixDQUFBO1FBRXhDLElBQUksSUFBaUIsRUFBRSxLQUFrQixDQUFBO1FBQ3pDLE1BQU0sSUFBSSxHQUFHLENBQUMsQ0FBYSxFQUFFLEVBQUU7WUFDN0IsSUFBSSxJQUFJLElBQUksS0FBSyxFQUFFO2dCQUNqQixnREFBZ0Q7Z0JBQ2hELE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLEtBQUssQ0FBQTtnQkFDbEQsTUFBTSxNQUFNLEdBQUcsTUFBTSxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUE7Z0JBQy9CLE1BQU0sZUFBZSxHQUFHLE1BQU0sQ0FBQyxVQUFVLEdBQUcsR0FBRyxDQUFBO2dCQUMvQyxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxFQUFFLGVBQWUsQ0FBQyxDQUFBO2dCQUV0RSxpQkFBaUI7Z0JBQ2pCLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLGVBQWUsYUFBYSxLQUFLLENBQUE7Z0JBQ3BELEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLEdBQUcsYUFBYSxJQUFJLENBQUE7Z0JBQ3hDLEtBQUssQ0FBQyxLQUFLLENBQUMsU0FBUyxHQUFHLEdBQUcsYUFBYSxJQUFJLENBQUE7Z0JBQzVDLEtBQUssQ0FBQyxLQUFLLENBQUMsUUFBUSxHQUFHLEdBQUcsYUFBYSxJQUFJLENBQUE7Z0JBRTNDLCtC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QTtRQUVwQywrQ0FBK0M7UUFDL0MsSUFBSSxNQUFNLENBQUMsU0FBUztZQUFFLE1BQU0sQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFBO1FBQzFELElBQUksTUFBTSxDQUFDLFlBQVk7WUFBRSxNQUFNLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQTtRQUN6RSxJQUFJLE1BQU0sQ0FBQyxvQkFBb0I7WUFBRSxNQUFNLENBQUMsb0JBQW9CLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFBO1FBQ3pGLElBQUksTUFBTSxDQUFDLFFBQVE7WUFBRSxNQUFNLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQTtRQUV4RCwrREFBK0Q7UUFDL0QsSUFBSSxjQUFjLElBQUksY0FBYyxDQUFDLFVBQVU7WUFBRSxjQUFjLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQTtJQUNoRyxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBQbGF5Z3JvdW5kUGx1Z2luIH0gZnJvbSAnLidcblxudHlwZSBTYW5kYm94ID0gaW1wb3J0KCd0eXBlc2NyaXB0LXNhbmRib3gnKS5TYW5kYm94XG5cbmV4cG9ydCBjb25zdCBjcmVhdGVEcmFnQmFyID0gKCkgPT4ge1xuICBjb25zdCBzaWRlYmFyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgc2lkZWJhci5jbGFzc05hbWUgPSAncGxheWdyb3VuZC1kcmFnYmFyJ1xuXG4gIGxldCBsZWZ0OiBIVE1MRWxlbWVudCwgcmlnaHQ6IEhUTUxFbGVtZW50XG4gIGNvbnN0IGRyYWcgPSAoZTogTW91c2VFdmVudCkgPT4ge1xuICAgIGlmIChsZWZ0ICYmIHJpZ2h0KSB7XG4gICAgICAvLyBHZXQgaG93IGZhciByaWdodCB0aGUgbW91c2UgaXMgZnJvbSB0aGUgcmlnaHRcbiAgICAgIGNvbnN0IHJpZ2h0WCA9IHJpZ2h0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnJpZ2h0XG4gICAgICBjb25zdCBvZmZzZXQgPSByaWdodFggLSBlLnBhZ2VYXG4gICAgICBjb25zdCBzY3JlZW5DbGFtcExlZnQgPSB3aW5kb3cuaW5uZXJXaWR0aCAtIDMyMFxuICAgICAgY29uc3QgY2xhbXBlZE9mZnNldCA9IE1hdGgubWluKE1hdGgubWF4KG9mZnNldCwgMjgwKSwgc2NyZWVuQ2xhbXBMZWZ0KVxuXG4gICAgICAvLyBTZXQgdGhlIHdpZHRoc1xuICAgICAgbGVmdC5zdHlsZS53aWR0aCA9IGBjYWxjKDEwMCUgLSAke2NsYW1wZWRPZmZzZXR9cHgpYFxuICAgICAgcmlnaHQuc3R5bGUud2lkdGggPSBgJHtjbGFtcGVkT2Zmc2V0fXB4YFxuICAgICAgcmlnaHQuc3R5bGUuZmxleEJhc2lzID0gYCR7Y2xhbXBlZE9mZnNldH1weGBcbiAgICAgIHJpZ2h0LnN0eWxlLm1heFdpZHRoID0gYCR7Y2xhbXBlZE9mZnNldH1weGBcblxuICAgICAgLy8gU2F2ZSB0aGUgeCBjb29yZGluYXRlIG9mIHRoZVxuICAgICAgaWYgKHdpbmRvdy5sb2NhbFN0b3JhZ2UpIHtcbiAgICAgICAgd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKCdkcmFnYmFyLXgnLCAnJyArIGNsYW1wZWRPZmZzZXQpXG4gICAgICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnZHJhZ2Jhci13aW5kb3ctd2lkdGgnLCAnJyArIHdpbmRvdy5pbm5lcldpZHRoKVxuICAgICAgfVxuXG4gICAgICAvLyBAdHMtaWdub3JlIC0gSSBrbm93IHdoYXQgSSdtIGRvaW5nXG4gICAgICB3aW5kb3cuc2FuZGJveC5lZGl0b3IubGF5b3V0KClcblxuICAgICAgLy8gRG9uJ3QgYWxsb3cgc2VsZWN0aW9uXG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICBlLmNhbmNlbEJ1YmJsZSA9IHRydWVcbiAgICB9XG4gIH1cblxuICBzaWRlYmFyLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIGUgPT4ge1xuICAgIGxlZnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZWRpdG9yLWNvbnRhaW5lcicpIVxuICAgIHJpZ2h0ID0gc2lkZWJhci5wYXJlbnRFbGVtZW50Py5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdwbGF5Z3JvdW5kLXNpZGViYXInKS5pdGVtKDApISBhcyBhbnlcbiAgICAvLyBIYW5kbGUgZHJhZ2dpbmcgYWxsIG92ZXIgdGhlIHNjcmVlblxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIGRyYWcpXG4gICAgLy8gUmVtb3ZlIGl0IHdoZW4geW91IGx0IGdvIGFueXdoZXJlXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsICgpID0+IHtcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIGRyYWcpXG4gICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLnVzZXJTZWxlY3QgPSAnYXV0bydcbiAgICB9KVxuXG4gICAgLy8gRG9uJ3QgYWxsb3cgdGhlIGRyYWcgdG8gc2VsZWN0IHRleHQgYWNjaWRlbnRhbGx5XG4gICAgZG9jdW1lbnQuYm9keS5zdHlsZS51c2VyU2VsZWN0ID0gJ25vbmUnXG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuICAgIGUuY2FuY2VsQnViYmxlID0gdHJ1ZVxuICB9KVxuXG4gIHJldHVybiBzaWRlYmFyXG59XG5cbmV4cG9ydCBjb25zdCBzaWRlYmFySGlkZGVuID0gKCkgPT4gISF3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3NpZGViYXItaGlkZGVuJylcblxuZXhwb3J0IGNvbnN0IGNyZWF0ZVNpZGViYXIgPSAoKSA9PiB7XG4gIGNvbnN0IHNpZGViYXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICBzaWRlYmFyLmNsYXNzTmFtZSA9ICdwbGF5Z3JvdW5kLXNpZGViYXInXG5cbiAgLy8gU3RhcnQgd2l0aCB0aGUgc2lkZWJhciBoaWRkZW4gb24gc21hbGwgc2NyZWVuc1xuICBjb25zdCBpc1RpbnlTY3JlZW4gPSB3aW5kb3cuaW5uZXJXaWR0aCA8IDgwMFxuXG4gIC8vIFRoaXMgaXMgaW5kZXBlbmRlbnQgb2YgdGhlIHNpemluZyBiZWxvdyBzbyB0aGF0IHlvdSBrZWVwIHRoZSBzYW1lIHNpemVkIHNpZGViYXJcbiAgaWYgKGlzVGlueVNjcmVlbiB8fCBzaWRlYmFySGlkZGVuKCkpIHtcbiAgICBzaWRlYmFyLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcbiAgfVxuXG4gIGlmICh3aW5kb3cubG9jYWxTdG9yYWdlICYmIHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnZHJhZ2Jhci14JykpIHtcbiAgICAvLyBEb24ndCByZXN0b3JlIHRoZSB4IHBvcyBpZiB0aGUgd2luZG93IGlzbid0IHRoZSBzYW1lIHNpemVcbiAgICBpZiAod2luZG93LmlubmVyV2lkdGggPT09IE51bWJlcih3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2RyYWdiYXItd2luZG93LXdpZHRoJykpKSB7XG4gICAgICAvLyBTZXQgdGhlIGRyYWdnZXIgdG8gdGhlIHByZXZpb3VzIHggcG9zXG4gICAgICBsZXQgd2lkdGggPSB3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2RyYWdiYXIteCcpXG5cbiAgICAgIGlmIChpc1RpbnlTY3JlZW4pIHtcbiAgICAgICAgd2lkdGggPSBTdHJpbmcoTWF0aC5taW4oTnVtYmVyKHdpZHRoKSwgMjgwKSlcbiAgICAgIH1cblxuICAgICAgc2lkZWJhci5zdHlsZS53aWR0aCA9IGAke3dpZHRofXB4YFxuICAgICAgc2lkZWJhci5zdHlsZS5mbGV4QmFzaXMgPSBgJHt3aWR0aH1weGBcbiAgICAgIHNpZGViYXIuc3R5bGUubWF4V2lkdGggPSBgJHt3aWR0aH1weGBcblxuICAgICAgY29uc3QgbGVmdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdlZGl0b3ItY29udGFpbmVyJykhXG4gICAgICBsZWZ0LnN0eWxlLndpZHRoID0gYGNhbGMoMTAwJSAtICR7d2lkdGh9cHgpYFxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBzaWRlYmFyXG59XG5cbmNvbnN0IHRvZ2dsZUljb25XaGVuT3BlbiA9ICcmI3gyMUU1OydcbmNvbnN0IHRvZ2dsZUljb25XaGVuQ2xvc2VkID0gJyYjeDIxRTQ7J1xuXG5leHBvcnQgY29uc3Qgc2V0dXBTaWRlYmFyVG9nZ2xlID0gKCkgPT4ge1xuICBjb25zdCB0b2dnbGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2lkZWJhci10b2dnbGUnKSFcblxuICBjb25zdCB1cGRhdGVUb2dnbGUgPSAoKSA9PiB7XG4gICAgY29uc3Qgc2lkZWJhciA9IHdpbmRvdy5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucGxheWdyb3VuZC1zaWRlYmFyJykgYXMgSFRNTERpdkVsZW1lbnRcbiAgICBjb25zdCBzaWRlYmFyU2hvd2luZyA9IHNpZGViYXIuc3R5bGUuZGlzcGxheSAhPT0gJ25vbmUnXG5cbiAgICB0b2dnbGUuaW5uZXJIVE1MID0gc2lkZWJhclNob3dpbmcgPyB0b2dnbGVJY29uV2hlbk9wZW4gOiB0b2dnbGVJY29uV2hlbkNsb3NlZFxuICAgIHRvZ2dsZS5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWwnLCBzaWRlYmFyU2hvd2luZyA/ICdIaWRlIFNpZGViYXInIDogJ1Nob3cgU2lkZWJhcicpXG4gIH1cblxuICB0b2dnbGUub25jbGljayA9ICgpID0+IHtcbiAgICBjb25zdCBzaWRlYmFyID0gd2luZG93LmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5wbGF5Z3JvdW5kLXNpZGViYXInKSBhcyBIVE1MRGl2RWxlbWVudFxuICAgIGNvbnN0IG5ld1N0YXRlID0gc2lkZWJhci5zdHlsZS5kaXNwbGF5ICE9PSAnbm9uZSdcblxuICAgIGlmIChuZXdTdGF0ZSkge1xuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3NpZGViYXItaGlkZGVuJywgJ3RydWUnKVxuICAgICAgc2lkZWJhci5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXG4gICAgfSBlbHNlIHtcbiAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCdzaWRlYmFyLWhpZGRlbicpXG4gICAgICBzaWRlYmFyLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snXG4gICAgfVxuXG4gICAgdXBkYXRlVG9nZ2xlKClcblxuICAgIC8vIEB0cy1pZ25vcmUgLSBJIGtub3cgd2hhdCBJJ20gZG9pbmdcbiAgICB3aW5kb3cuc2FuZGJveC5lZGl0b3IubGF5b3V0KClcblxuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgLy8gRW5zdXJlIGl0cyBzZXQgdXAgYXQgdGhlIHN0YXJ0XG4gIHVwZGF0ZVRvZ2dsZSgpXG59XG5cbmV4cG9ydCBjb25zdCBjcmVhdGVUYWJCYXIgPSAoKSA9PiB7XG4gIGNvbnN0IHRhYkJhciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gIHRhYkJhci5jbGFzc0xpc3QuYWRkKCdwbGF5Z3JvdW5kLXBsdWdpbi10YWJ2aWV3JylcbiAgcmV0dXJuIHRhYkJhclxufVxuXG5leHBvcnQgY29uc3QgY3JlYXRlUGx1Z2luQ29udGFpbmVyID0gKCkgPT4ge1xuICBjb25zdCBjb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICBjb250YWluZXIuY2xhc3NMaXN0LmFkZCgncGxheWdyb3VuZC1wbHVnaW4tY29udGFpbmVyJylcbiAgcmV0dXJuIGNvbnRhaW5lclxufVxuXG5leHBvcnQgY29uc3QgY3JlYXRlVGFiRm9yUGx1Z2luID0gKHBsdWdpbjogUGxheWdyb3VuZFBsdWdpbikgPT4ge1xuICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJylcbiAgZWxlbWVudC50ZXh0Q29udGVudCA9IHBsdWdpbi5kaXNwbGF5TmFtZVxuICByZXR1cm4gZWxlbWVudFxufVxuXG5leHBvcnQgY29uc3QgYWN0aXZhdGVQbHVnaW4gPSAoXG4gIHBsdWdpbjogUGxheWdyb3VuZFBsdWdpbixcbiAgcHJldmlvdXNQbHVnaW46IFBsYXlncm91bmRQbHVnaW4gfCB1bmRlZmluZWQsXG4gIHNhbmRib3g6IFNhbmRib3gsXG4gIHRhYkJhcjogSFRNTERpdkVsZW1lbnQsXG4gIGNvbnRhaW5lcjogSFRNTERpdkVsZW1lbnRcbikgPT4ge1xuICBsZXQgbmV3UGx1Z2luVGFiOiBFbGVtZW50LCBvbGRQbHVnaW5UYWI6IEVsZW1lbnRcbiAgLy8gQHRzLWlnbm9yZSAtIFRoaXMgd29ya3MgYXQgcnVudGltZVxuICBmb3IgKGNvbnN0IHRhYiBvZiB0YWJCYXIuY2hpbGRyZW4pIHtcbiAgICBpZiAodGFiLnRleHRDb250ZW50ID09PSBwbHVnaW4uZGlzcGxheU5hbWUpIG5ld1BsdWdpblRhYiA9IHRhYlxuICAgIGlmIChwcmV2aW91c1BsdWdpbiAmJiB0YWIudGV4dENvbnRlbnQgPT09IHByZXZpb3VzUGx1Z2luLmRpc3BsYXlOYW1lKSBvbGRQbHVnaW5UYWIgPSB0YWJcbiAgfVxuXG4gIC8vIEB0cy1pZ25vcmVcbiAgaWYgKCFuZXdQbHVnaW5UYWIpIHRocm93IG5ldyBFcnJvcignQ291bGQgbm90IGdldCBhIHRhYiBmb3IgdGhlIHBsdWdpbjogJyArIHBsdWdpbi5kaXNwbGF5TmFtZSlcblxuICAvLyBUZWxsIHRoZSBvbGQgcGx1Z2luIGl0J3MgZ2V0dGluZyB0aGUgYm9vdFxuICAvLyBAdHMtaWdub3JlXG4gIGlmIChwcmV2aW91c1BsdWdpbiAmJiBvbGRQbHVnaW5UYWIpIHtcbiAgICBpZiAocHJldmlvdXNQbHVnaW4ud2lsbFVubW91bnQpIHByZXZpb3VzUGx1Z2luLndpbGxVbm1vdW50KHNhbmRib3gsIGNvbnRhaW5lcilcbiAgICBvbGRQbHVnaW5UYWIuY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJylcbiAgfVxuXG4gIC8vIFdpcGUgdGhlIHNpZGViYXJcbiAgd2hpbGUgKGNvbnRhaW5lci5maXJzdENoaWxkKSB7XG4gICAgY29udGFpbmVyLnJlbW92ZUNoaWxkKGNvbnRhaW5lci5maXJzdENoaWxkKVxuICB9XG5cbiAgLy8gU3RhcnQgYm9vdGluZyB1cCB0aGUgbmV3IHBsdWdpblxuICBuZXdQbHVnaW5UYWIuY2xhc3NMaXN0LmFkZCgnYWN0aXZlJylcblxuICAvLyBUZWxsIHRoZSBuZXcgcGx1Z2luIHRvIHN0YXJ0IGRvaW5nIHNvbWUgd29ya1xuICBpZiAocGx1Z2luLndpbGxNb3VudCkgcGx1Z2luLndpbGxNb3VudChzYW5kYm94LCBjb250YWluZXIpXG4gIGlmIChwbHVnaW4ubW9kZWxDaGFuZ2VkKSBwbHVnaW4ubW9kZWxDaGFuZ2VkKHNhbmRib3gsIHNhbmRib3guZ2V0TW9kZWwoKSlcbiAgaWYgKHBsdWdpbi5tb2RlbENoYW5nZWREZWJvdW5jZSkgcGx1Z2luLm1vZGVsQ2hhbmdlZERlYm91bmNlKHNhbmRib3gsIHNhbmRib3guZ2V0TW9kZWwoKSlcbiAgaWYgKHBsdWdpbi5kaWRNb3VudCkgcGx1Z2luLmRpZE1vdW50KHNhbmRib3gsIGNvbnRhaW5lcilcblxuICAvLyBMZXQgdGhlIHByZXZpb3VzIHBsdWdpbiBkbyBhbnkgc2xvdyB3b3JrIGFmdGVyIGl0J3MgYWxsIGRvbmVcbiAgaWYgKHByZXZpb3VzUGx1Z2luICYmIHByZXZpb3VzUGx1Z2luLmRpZFVubW91bnQpIHByZXZpb3VzUGx1Z2luLmRpZFVubW91bnQoc2FuZGJveCwgY29udGFpbmVyKVxufVxuIl19