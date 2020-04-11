define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.compiledJSPlugin = i => {
        let codeElement;
        const plugin = {
            id: 'js',
            displayName: i('play_sidebar_js'),
            willMount: (sandbox, container) => {
                const createCodePre = document.createElement('pre');
                codeElement = document.createElement('code');
                createCodePre.appendChild(codeElement);
                container.appendChild(createCodePre);
            },
            modelChangedDebounce: (sandbox, model) => {
                sandbox.getRunnableJS().then(js => {
                    sandbox.monaco.editor.colorize(js, 'javascript', {}).then(coloredJS => {
                        codeElement.innerHTML = coloredJS;
                    });
                });
            },
        };
        return plugin;
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hvd0pTLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vcGxheWdyb3VuZC9zcmMvc2lkZWJhci9zaG93SlMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBRWEsUUFBQSxnQkFBZ0IsR0FBa0IsQ0FBQyxDQUFDLEVBQUU7UUFDakQsSUFBSSxXQUF3QixDQUFBO1FBRTVCLE1BQU0sTUFBTSxHQUFxQjtZQUMvQixFQUFFLEVBQUUsSUFBSTtZQUNSLFdBQVcsRUFBRSxDQUFDLENBQUMsaUJBQWlCLENBQUM7WUFDakMsU0FBUyxFQUFFLENBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxFQUFFO2dCQUNoQyxNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFBO2dCQUNuRCxXQUFXLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQTtnQkFFNUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQTtnQkFDdEMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQTtZQUN0QyxDQUFDO1lBQ0Qsb0JBQW9CLEVBQUUsQ0FBQyxPQUFPLEVBQUUsS0FBSyxFQUFFLEVBQUU7Z0JBQ3ZDLE9BQU8sQ0FBQyxhQUFhLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUU7b0JBQ2hDLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxFQUFFLEVBQUUsWUFBWSxFQUFFLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRTt3QkFDcEUsV0FBVyxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUE7b0JBQ25DLENBQUMsQ0FBQyxDQUFBO2dCQUNKLENBQUMsQ0FBQyxDQUFBO1lBQ0osQ0FBQztTQUNGLENBQUE7UUFFRCxPQUFPLE1BQU0sQ0FBQTtJQUNmLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFBsYXlncm91bmRQbHVnaW4sIFBsdWdpbkZhY3RvcnkgfSBmcm9tICcuLidcblxuZXhwb3J0IGNvbnN0IGNvbXBpbGVkSlNQbHVnaW46IFBsdWdpbkZhY3RvcnkgPSBpID0+IHtcbiAgbGV0IGNvZGVFbGVtZW50OiBIVE1MRWxlbWVudFxuXG4gIGNvbnN0IHBsdWdpbjogUGxheWdyb3VuZFBsdWdpbiA9IHtcbiAgICBpZDogJ2pzJyxcbiAgICBkaXNwbGF5TmFtZTogaSgncGxheV9zaWRlYmFyX2pzJyksXG4gICAgd2lsbE1vdW50OiAoc2FuZGJveCwgY29udGFpbmVyKSA9PiB7XG4gICAgICBjb25zdCBjcmVhdGVDb2RlUHJlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncHJlJylcbiAgICAgIGNvZGVFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY29kZScpXG5cbiAgICAgIGNyZWF0ZUNvZGVQcmUuYXBwZW5kQ2hpbGQoY29kZUVsZW1lbnQpXG4gICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoY3JlYXRlQ29kZVByZSlcbiAgICB9LFxuICAgIG1vZGVsQ2hhbmdlZERlYm91bmNlOiAoc2FuZGJveCwgbW9kZWwpID0+IHtcbiAgICAgIHNhbmRib3guZ2V0UnVubmFibGVKUygpLnRoZW4oanMgPT4ge1xuICAgICAgICBzYW5kYm94Lm1vbmFjby5lZGl0b3IuY29sb3JpemUoanMsICdqYXZhc2NyaXB0Jywge30pLnRoZW4oY29sb3JlZEpTID0+IHtcbiAgICAgICAgICBjb2RlRWxlbWVudC5pbm5lckhUTUwgPSBjb2xvcmVkSlNcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfSxcbiAgfVxuXG4gIHJldHVybiBwbHVnaW5cbn1cbiJdfQ==