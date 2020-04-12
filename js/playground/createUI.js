define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createUI = () => {
        const flashInfo = (message) => {
            var _a;
            let flashBG = document.getElementById('flash-bg');
            if (flashBG) {
                (_a = flashBG.parentElement) === null || _a === void 0 ? void 0 : _a.removeChild(flashBG);
            }
            flashBG = document.createElement('div');
            flashBG.id = 'flash-bg';
            const p = document.createElement('p');
            p.textContent = message;
            flashBG.appendChild(p);
            document.body.appendChild(flashBG);
            setTimeout(() => {
                var _a;
                (_a = flashBG === null || flashBG === void 0 ? void 0 : flashBG.parentElement) === null || _a === void 0 ? void 0 : _a.removeChild(flashBG);
            }, 1000);
        };
        const createModalOverlay = (classList) => {
            document.querySelectorAll('.navbar-sub li.open').forEach(i => i.classList.remove('open'));
            const existingPopover = document.getElementById('popover-modal');
            if (existingPopover)
                existingPopover.parentElement.removeChild(existingPopover);
            const modalBG = document.createElement('div');
            modalBG.id = 'popover-background';
            document.body.appendChild(modalBG);
            const modal = document.createElement('div');
            modal.id = 'popover-modal';
            if (classList)
                modal.className = classList;
            const closeButton = document.createElement('button');
            closeButton.innerText = 'Close';
            closeButton.classList.add('close');
            modal.appendChild(closeButton);
            const oldOnkeyDown = document.onkeydown;
            const close = () => {
                modalBG.parentNode.removeChild(modalBG);
                modal.parentNode.removeChild(modal);
                // @ts-ignore
                document.onkeydown = oldOnkeyDown;
            };
            modalBG.onclick = close;
            closeButton.onclick = close;
            // Support hiding the modal via escape
            document.onkeydown = function (evt) {
                evt = evt || window.event;
                var isEscape = false;
                if ('key' in evt) {
                    isEscape = evt.key === 'Escape' || evt.key === 'Esc';
                }
                else {
                    // @ts-ignore - this used to be the case
                    isEscape = evt.keyCode === 27;
                }
                if (isEscape) {
                    close();
                }
            };
            document.body.appendChild(modal);
            return modal;
        };
        /** For showing a lot of code */
        const showModal = (code, subtitle, links) => {
            const modal = createModalOverlay();
            if (subtitle) {
                const titleElement = document.createElement('p');
                titleElement.textContent = subtitle;
                modal.appendChild(titleElement);
            }
            const pre = document.createElement('pre');
            modal.appendChild(pre);
            pre.textContent = code;
            const buttonContainer = document.createElement('div');
            const copyButton = document.createElement('button');
            copyButton.innerText = 'Copy';
            buttonContainer.appendChild(copyButton);
            const selectAllButton = document.createElement('button');
            selectAllButton.innerText = 'Select All';
            buttonContainer.appendChild(selectAllButton);
            modal.appendChild(buttonContainer);
            if (links) {
                Object.keys(links).forEach(name => {
                    const href = links[name];
                    const extraButton = document.createElement('button');
                    extraButton.innerText = name;
                    extraButton.onclick = () => (document.location = href);
                    buttonContainer.appendChild(extraButton);
                });
            }
            const selectAll = () => {
                const selection = window.getSelection();
                const range = document.createRange();
                range.selectNodeContents(pre);
                if (selection) {
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
            };
            selectAll();
            selectAllButton.onclick = selectAll;
            copyButton.onclick = () => {
                navigator.clipboard.writeText(code);
            };
        };
        return {
            createModalOverlay,
            showModal,
            flashInfo,
        };
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlVUkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wbGF5Z3JvdW5kL3NyYy9jcmVhdGVVSS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFTYSxRQUFBLFFBQVEsR0FBRyxHQUFPLEVBQUU7UUFDL0IsTUFBTSxTQUFTLEdBQUcsQ0FBQyxPQUFlLEVBQUUsRUFBRTs7WUFDcEMsSUFBSSxPQUFPLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQTtZQUNqRCxJQUFJLE9BQU8sRUFBRTtnQkFDWCxNQUFBLE9BQU8sQ0FBQyxhQUFhLDBDQUFFLFdBQVcsQ0FBQyxPQUFPLEVBQUM7YUFDNUM7WUFFRCxPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQTtZQUN2QyxPQUFPLENBQUMsRUFBRSxHQUFHLFVBQVUsQ0FBQTtZQUV2QixNQUFNLENBQUMsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBQ3JDLENBQUMsQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFBO1lBQ3ZCLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDdEIsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUE7WUFFbEMsVUFBVSxDQUFDLEdBQUcsRUFBRTs7Z0JBQ2QsTUFBQSxPQUFPLGFBQVAsT0FBTyx1QkFBUCxPQUFPLENBQUUsYUFBYSwwQ0FBRSxXQUFXLENBQUMsT0FBTyxFQUFDO1lBQzlDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQTtRQUNWLENBQUMsQ0FBQTtRQUVELE1BQU0sa0JBQWtCLEdBQUcsQ0FBQyxTQUFrQixFQUFFLEVBQUU7WUFDaEQsUUFBUSxDQUFDLGdCQUFnQixDQUFDLHFCQUFxQixDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMs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Q0FBQyxDQUFBO2dCQUM3QixJQUFJLFNBQVMsRUFBRTtvQkFDYixTQUFTLENBQUMsZUFBZSxFQUFFLENBQUE7b0JBQzNCLFNBQVMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUE7aUJBQzFCO1lBQ0gsQ0FBQyxDQUFBO1lBQ0QsU0FBUyxFQUFFLENBQUE7WUFFWCxlQUFlLENBQUMsT0FBTyxHQUFHLFNBQVMsQ0FBQTtZQUNuQyxVQUFVLENBQUMsT0FBTyxHQUFHLEdBQUcsRUFBRTtnQkFDeEIsU0FBUyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUE7WUFDckMsQ0FBQyxDQUFBO1FBQ0gsQ0FBQyxDQUFBO1FBRUQsT0FBTztZQUNMLGtCQUFrQjtZQUNsQixTQUFTO1lBQ1QsU0FBUztTQUNWLENBQUE7SUFDSCxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgaW50ZXJmYWNlIFVJIHtcbiAgLyoqIFNob3cgYSB0ZXh0IG1vZGFsLCB3aXRoIHNvbWUgYnV0dG9ucyAqL1xuICBzaG93TW9kYWw6IChtZXNzYWdlOiBzdHJpbmcsIHN1YnRpdGxlPzogc3RyaW5nLCBidXR0b25zPzogeyBbdGV4dDogc3RyaW5nXTogc3RyaW5nIH0pID0+IHZvaWRcbiAgLyoqIEEgcXVpY2sgZmxhc2ggb2Ygc29tZSB0ZXh0ICovXG4gIGZsYXNoSW5mbzogKG1lc3NhZ2U6IHN0cmluZykgPT4gdm9pZFxuICAvKiogQ3JlYXRlcyBhIG1vZGFsIGNvbnRhaW5lciB3aGljaCB5b3UgY2FuIHB1dCB5b3VyIG93biBET00gZWxlbWVudHMgaW5zaWRlICovXG4gIGNyZWF0ZU1vZGFsT3ZlcmxheTogKGNsYXNzZXM/OiBzdHJpbmcpID0+IEhUTUxEaXZFbGVtZW50XG59XG5cbmV4cG9ydCBjb25zdCBjcmVhdGVVSSA9ICgpOiBVSSA9PiB7XG4gIGNvbnN0IGZsYXNoSW5mbyA9IChtZXNzYWdlOiBzdHJpbmcpID0+IHtcbiAgICBsZXQgZmxhc2hCRyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmbGFzaC1iZycpXG4gICAgaWYgKGZsYXNoQkcpIHtcbiAgICAgIGZsYXNoQkcucGFyZW50RWxlbWVudD8ucmVtb3ZlQ2hpbGQoZmxhc2hCRylcbiAgICB9XG5cbiAgICBmbGFzaEJHID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICBmbGFzaEJHLmlkID0gJ2ZsYXNoLWJnJ1xuXG4gICAgY29uc3QgcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKVxuICAgIHAudGV4dENvbnRlbnQgPSBtZXNzYWdlXG4gICAgZmxhc2hCRy5hcHBlbmRDaGlsZChwKVxuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZmxhc2hCRylcblxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgZmxhc2hCRz8ucGFyZW50RWxlbWVudD8ucmVtb3ZlQ2hpbGQoZmxhc2hCRylcbiAgICB9LCAxMDAwKVxuICB9XG5cbiAgY29uc3QgY3JlYXRlTW9kYWxPdmVybGF5ID0gKGNsYXNzTGlzdD86IHN0cmluZykgPT4ge1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5uYXZiYXItc3ViIGxpLm9wZW4nKS5mb3JFYWNoKGkgPT4gaS5jbGFzc0xpc3QucmVtb3ZlKCdvcGVuJykpXG5cbiAgICBjb25zdCBleGlzdGluZ1BvcG92ZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncG9wb3Zlci1tb2RhbCcpXG4gICAgaWYgKGV4aXN0aW5nUG9wb3ZlcikgZXhpc3RpbmdQb3BvdmVyLnBhcmVudEVsZW1lbnQhLnJlbW92ZUNoaWxkKGV4aXN0aW5nUG9wb3ZlcilcblxuICAgIGNvbnN0IG1vZGFsQkcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIG1vZGFsQkcuaWQgPSAncG9wb3Zlci1iYWNrZ3JvdW5kJ1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobW9kYWxCRylcblxuICAgIGNvbnN0IG1vZGFsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICBtb2RhbC5pZCA9ICdwb3BvdmVyLW1vZGFsJ1xuICAgIGlmIChjbGFzc0xpc3QpIG1vZGFsLmNsYXNzTmFtZSA9IGNsYXNzTGlzdFxuXG4gICAgY29uc3QgY2xvc2VCdXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKVxuICAgIGNsb3NlQnV0dG9uLmlubmVyVGV4dCA9ICdDbG9zZSdcbiAgICBjbG9zZUJ1dHRvbi5jbGFzc0xpc3QuYWRkKCdjbG9zZScpXG4gICAgbW9kYWwuYXBwZW5kQ2hpbGQoY2xvc2VCdXR0b24pXG5cbiAgICBjb25zdCBvbGRPbmtleURvd24gPSBkb2N1bWVudC5vbmtleWRvd25cblxuICAgIGNvbnN0IGNsb3NlID0gKCkgPT4ge1xuICAgICAgbW9kYWxCRy5wYXJlbnROb2RlIS5yZW1vdmVDaGlsZChtb2RhbEJHKVxuICAgICAgbW9kYWwucGFyZW50Tm9kZSEucmVtb3ZlQ2hpbGQobW9kYWwpXG4gICAgICAvLyBAdHMtaWdub3JlXG4gICAgICBkb2N1bWVudC5vbmtleWRvd24gPSBvbGRPbmtleURvd25cbiAgICB9XG5cbiAgICBtb2RhbEJHLm9uY2xpY2sgPSBjbG9zZVxuICAgIGNsb3NlQnV0dG9uLm9uY2xpY2sgPSBjbG9zZVxuXG4gICAgLy8gU3VwcG9ydCBoaWRpbmcgdGhlIG1vZGFsIHZpYSBlc2NhcGVcbiAgICBkb2N1bWVudC5vbmtleWRvd24gPSBmdW5jdGlvbihldnQpIHtcbiAgICAgIGV2dCA9IGV2dCB8fCB3aW5kb3cuZXZlbnRcbiAgICAgIHZhciBpc0VzY2FwZSA9IGZhbHNlXG4gICAgICBpZiAoJ2tleScgaW4gZXZ0KSB7XG4gICAgICAgIGlzRXNjYXBlID0gZXZ0LmtleSA9PT0gJ0VzY2FwZScgfHwgZXZ0LmtleSA9PT0gJ0VzYydcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIEB0cy1pZ25vcmUgLSB0aGlzIHVzZWQgdG8gYmUgdGhlIGNhc2VcbiAgICAgICAgaXNFc2NhcGUgPSBldnQua2V5Q29kZSA9PT0gMjdcbiAgICAgIH1cbiAgICAgIGlmIChpc0VzY2FwZSkge1xuICAgICAgICBjbG9zZSgpXG4gICAgICB9XG4gICAgfVxuXG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChtb2RhbClcblxuICAgIHJldHVybiBtb2RhbFxuICB9XG5cbiAgLyoqIEZvciBzaG93aW5nIGEgbG90IG9mIGNvZGUgKi9cbiAgY29uc3Qgc2hvd01vZGFsID0gKGNvZGU6IHN0cmluZywgc3VidGl0bGU/OiBzdHJpbmcsIGxpbmtzPzogeyBbdGV4dDogc3RyaW5nXTogc3RyaW5nIH0pID0+IHtcbiAgICBjb25zdCBtb2RhbCA9IGNyZWF0ZU1vZGFsT3ZlcmxheSgpXG5cbiAgICBpZiAoc3VidGl0bGUpIHtcbiAgICAgIGNvbnN0IHRpdGxlRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKVxuICAgICAgdGl0bGVFbGVtZW50LnRleHRDb250ZW50ID0gc3VidGl0bGVcbiAgICAgIG1vZGFsLmFwcGVuZENoaWxkKHRpdGxlRWxlbWVudClcbiAgICB9XG5cbiAgICBjb25zdCBwcmUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwcmUnKVxuICAgIG1vZGFsLmFwcGVuZENoaWxkKHByZSlcbiAgICBwcmUudGV4dENvbnRlbnQgPSBjb2RlXG5cbiAgICBjb25zdCBidXR0b25Db250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuXG4gICAgY29uc3QgY29weUJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpXG4gICAgY29weUJ1dHRvbi5pbm5lclRleHQgPSAnQ29weSdcbiAgICBidXR0b25Db250YWluZXIuYXBwZW5kQ2hpbGQoY29weUJ1dHRvbilcblxuICAgIGNvbnN0IHNlbGVjdEFsbEJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpXG4gICAgc2VsZWN0QWxsQnV0dG9uLmlubmVyVGV4dCA9ICdTZWxlY3QgQWxsJ1xuICAgIGJ1dHRvbkNvbnRhaW5lci5hcHBlbmRDaGlsZChzZWxlY3RBbGxCdXR0b24pXG5cbiAgICBtb2RhbC5hcHBlbmRDaGlsZChidXR0b25Db250YWluZXIpXG5cbiAgICBpZiAobGlua3MpIHtcbiAgICAgIE9iamVjdC5rZXlzKGxpbmtzKS5mb3JFYWNoKG5hbWUgPT4ge1xuICAgICAgICBjb25zdCBocmVmID0gbGlua3NbbmFtZV1cbiAgICAgICAgY29uc3QgZXh0cmFCdXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKVxuICAgICAgICBleHRyYUJ1dHRvbi5pbm5lclRleHQgPSBuYW1lXG4gICAgICAgIGV4dHJhQnV0dG9uLm9uY2xpY2sgPSAoKSA9PiAoZG9jdW1lbnQubG9jYXRpb24gPSBocmVmIGFzIGFueSlcbiAgICAgICAgYnV0dG9uQ29udGFpbmVyLmFwcGVuZENoaWxkKGV4dHJhQnV0dG9uKVxuICAgICAgfSlcbiAgICB9XG5cbiAgICBjb25zdCBzZWxlY3RBbGwgPSAoKSA9PiB7XG4gICAgICBjb25zdCBzZWxlY3Rpb24gPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKClcbiAgICAgIGNvbnN0IHJhbmdlID0gZG9jdW1lbnQuY3JlYXRlUmFuZ2UoKVxuICAgICAgcmFuZ2Uuc2VsZWN0Tm9kZUNvbnRlbnRzKHByZSlcbiAgICAgIGlmIChzZWxlY3Rpb24pIHtcbiAgICAgICAgc2VsZWN0aW9uLnJlbW92ZUFsbFJhbmdlcygpXG4gICAgICAgIHNlbGVjdGlvbi5hZGRSYW5nZShyYW5nZSlcbiAgICAgIH1cbiAgICB9XG4gICAgc2VsZWN0QWxsKClcblxuICAgIHNlbGVjdEFsbEJ1dHRvbi5vbmNsaWNrID0gc2VsZWN0QWxsXG4gICAgY29weUJ1dHRvbi5vbmNsaWNrID0gKCkgPT4ge1xuICAgICAgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQoY29kZSlcbiAgICB9XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGNyZWF0ZU1vZGFsT3ZlcmxheSxcbiAgICBzaG93TW9kYWwsXG4gICAgZmxhc2hJbmZvLFxuICB9XG59XG4iXX0=