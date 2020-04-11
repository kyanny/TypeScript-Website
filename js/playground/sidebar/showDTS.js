define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.showDTSPlugin = i => {
        let codeElement;
        const plugin = {
            id: 'dts',
            displayName: i('play_sidebar_dts'),
            willMount: (sandbox, container) => {
                // TODO: Monaco?
                const createCodePre = document.createElement('pre');
                codeElement = document.createElement('code');
                createCodePre.appendChild(codeElement);
                container.appendChild(createCodePre);
            },
            modelChanged: (sandbox, model) => {
                sandbox.getDTSForCode().then(dts => {
                    sandbox.monaco.editor.colorize(dts, 'typescript', {}).then(coloredDTS => {
                        codeElement.innerHTML = coloredDTS;
                    });
                });
            },
        };
        return plugin;
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hvd0RUUy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BsYXlncm91bmQvc3JjL3NpZGViYXIvc2hvd0RUUy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFHYSxRQUFBLGFBQWEsR0FBa0IsQ0FBQyxDQUFDLEVBQUU7UUFDOUMsSUFBSSxXQUF3QixDQUFBO1FBRTVCLE1BQU0sTUFBTSxHQUFxQjtZQUMvQixFQUFFLEVBQUUsS0FBSztZQUNULFdBQVcsRUFBRSxDQUFDLENBQUMsa0JBQWtCLENBQUM7WUFDbEMsU0FBUyxFQUFFLENBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxFQUFFO2dCQUNoQyxnQkFBZ0I7Z0JBQ2hCLE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUE7Z0JBQ25ELFdBQVcsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFBO2dCQUU1QyxhQUFhLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFBO2dCQUN0QyxTQUFTLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFBO1lBQ3RDLENBQUM7WUFDRCxZQUFZLEVBQUUsQ0FBQyxPQUFPLEVBQUUsS0FBSyxFQUFFLEVBQUU7Z0JBQy9CLE9BQU8sQ0FBQyxhQUFhLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUU7b0JBQ2pDLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsWUFBWSxFQUFFLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRTt3QkFDdEUsV0FBVyxDQUFDLFNBQVMsR0FBRyxVQUFVLENBQUE7b0JBQ3BDLENBQUMsQ0FBQyxDQUFBO2dCQUNKLENBQUMsQ0FBQyxDQUFBO1lBQ0osQ0FBQztTQUNGLENBQUE7UUFFRCxPQUFPLE1BQU0sQ0FBQTtJQUNmLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFBsYXlncm91bmRQbHVnaW4sIFBsdWdpbkZhY3RvcnkgfSBmcm9tICcuLidcbmltcG9ydCB7IGxvY2FsaXplIH0gZnJvbSAnLi4vbG9jYWxpemVXaXRoRmFsbGJhY2snXG5cbmV4cG9ydCBjb25zdCBzaG93RFRTUGx1Z2luOiBQbHVnaW5GYWN0b3J5ID0gaSA9PiB7XG4gIGxldCBjb2RlRWxlbWVudDogSFRNTEVsZW1lbnRcblxuICBjb25zdCBwbHVnaW46IFBsYXlncm91bmRQbHVnaW4gPSB7XG4gICAgaWQ6ICdkdHMnLFxuICAgIGRpc3BsYXlOYW1lOiBpKCdwbGF5X3NpZGViYXJfZHRzJyksXG4gICAgd2lsbE1vdW50OiAoc2FuZGJveCwgY29udGFpbmVyKSA9PiB7XG4gICAgICAvLyBUT0RPOiBNb25hY28/XG4gICAgICBjb25zdCBjcmVhdGVDb2RlUHJlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncHJlJylcbiAgICAgIGNvZGVFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY29kZScpXG5cbiAgICAgIGNyZWF0ZUNvZGVQcmUuYXBwZW5kQ2hpbGQoY29kZUVsZW1lbnQpXG4gICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoY3JlYXRlQ29kZVByZSlcbiAgICB9LFxuICAgIG1vZGVsQ2hhbmdlZDogKHNhbmRib3gsIG1vZGVsKSA9PiB7XG4gICAgICBzYW5kYm94LmdldERUU0ZvckNvZGUoKS50aGVuKGR0cyA9PiB7XG4gICAgICAgIHNhbmRib3gubW9uYWNvLmVkaXRvci5jb2xvcml6ZShkdHMsICd0eXBlc2NyaXB0Jywge30pLnRoZW4oY29sb3JlZERUUyA9PiB7XG4gICAgICAgICAgY29kZUVsZW1lbnQuaW5uZXJIVE1MID0gY29sb3JlZERUU1xuICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9LFxuICB9XG5cbiAgcmV0dXJuIHBsdWdpblxufVxuIl19