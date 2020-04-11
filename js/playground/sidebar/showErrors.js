var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "../localizeWithFallback"], function (require, exports, localizeWithFallback_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.showErrors = i => {
        let decorations = [];
        let decorationLock = false;
        const plugin = {
            id: 'errors',
            displayName: i('play_sidebar_errors'),
            willMount: (sandbox, container) => __awaiter(void 0, void 0, void 0, function* () {
                const noErrorsMessage = document.createElement('div');
                noErrorsMessage.id = 'empty-message-container';
                container.appendChild(noErrorsMessage);
                const errorUL = document.createElement('ul');
                errorUL.id = 'compiler-errors';
                container.appendChild(errorUL);
            }),
            modelChangedDebounce: (sandbox, model) => __awaiter(void 0, void 0, void 0, function* () {
                sandbox.getWorkerProcess().then(worker => {
                    worker.getSemanticDiagnostics(model.uri.toString()).then(diags => {
                        const errorUL = document.getElementById('compiler-errors');
                        const noErrorsMessage = document.getElementById('empty-message-container');
                        if (!errorUL || !noErrorsMessage)
                            return;
                        while (errorUL.firstChild) {
                            errorUL.removeChild(errorUL.firstChild);
                        }
                        // Bail early if there's nothing to show
                        if (!diags.length) {
                            errorUL.style.display = 'none';
                            noErrorsMessage.style.display = 'flex';
                            // Already has a message
                            if (noErrorsMessage.children.length)
                                return;
                            const message = document.createElement('div');
                            message.textContent = localizeWithFallback_1.localize('play_sidebar_errors_no_errors', 'No errors');
                            message.classList.add('empty-plugin-message');
                            noErrorsMessage.appendChild(message);
                            return;
                        }
                        noErrorsMessage.style.display = 'none';
                        errorUL.style.display = 'block';
                        diags.forEach(diag => {
                            const li = document.createElement('li');
                            li.classList.add('diagnostic');
                            switch (diag.category) {
                                case 0:
                                    li.classList.add('warning');
                                    break;
                                case 1:
                                    li.classList.add('error');
                                    break;
                                case 2:
                                    li.classList.add('suggestion');
                                    break;
                                case 3:
                                    li.classList.add('message');
                                    break;
                            }
                            if (typeof diag === 'string') {
                                li.textContent = diag;
                            }
                            else {
                                li.textContent = sandbox.ts.flattenDiagnosticMessageText(diag.messageText, '\n');
                            }
                            errorUL.appendChild(li);
                            li.onmouseenter = () => {
                                if (diag.start && diag.length && !decorationLock) {
                                    const start = model.getPositionAt(diag.start);
                                    const end = model.getPositionAt(diag.start + diag.length);
                                    decorations = sandbox.editor.deltaDecorations(decorations, [
                                        {
                                            range: new sandbox.monaco.Range(start.lineNumber, start.column, end.lineNumber, end.column),
                                            options: { inlineClassName: 'error-highlight' },
                                        },
                                    ]);
                                }
                            };
                            li.onmouseleave = () => {
                                if (!decorationLock) {
                                    sandbox.editor.deltaDecorations(decorations, []);
                                }
                            };
                            li.onclick = () => {
                                if (diag.start && diag.length) {
                                    const start = model.getPositionAt(diag.start);
                                    sandbox.editor.revealLine(start.lineNumber);
                                    const end = model.getPositionAt(diag.start + diag.length);
                                    decorations = sandbox.editor.deltaDecorations(decorations, [
                                        {
                                            range: new sandbox.monaco.Range(start.lineNumber, start.column, end.lineNumber, end.column),
                                            options: { inlineClassName: 'error-highlight', isWholeLine: true },
                                        },
                                    ]);
                                    decorationLock = true;
                                    setTimeout(() => {
                                        decorationLock = false;
                                        sandbox.editor.deltaDecorations(decorations, []);
                                    }, 300);
                                }
                            };
                        });
                    });
                });
            }),
        };
        return plugin;
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hvd0Vycm9ycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BsYXlncm91bmQvc3JjL3NpZGViYXIvc2hvd0Vycm9ycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7SUFHYSxRQUFBLFVBQVUsR0FBa0IsQ0FBQyxDQUFDLEVBQUU7UUFDM0MsSUFBSSxXQUFXLEdBQWEsRUFBRSxDQUFBO1FBQzlCLElBQUksY0FBYyxHQUFHLEtBQUssQ0FBQTtRQUUxQixNQUFNLE1BQU0sR0FBcUI7WUFDL0IsRUFBRSxFQUFFLFFBQVE7WUFDWixXQUFXLEVBQUUsQ0FBQyxDQUFDLHFCQUFxQixDQUFDO1lBQ3JDLFNBQVMsRUFBRSxDQUFPLE9BQU8sRUFBRSxTQUFTLEVBQUUsRUFBRTtnQkFDdEMsTUFBTSxlQUFlLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQTtnQkFDckQsZUFBZSxDQUFDLEVBQUUsR0FBRyx5QkFBeUIsQ0FBQTtnQkFDOUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsQ0FBQTtnQkFFdEMsTUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQTtnQkFDNUMsT0FBTyxDQUFDLEVBQUUsR0FBRyxpQkFBaUIsQ0FBQTtnQkFDOUIsU0FBUyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQTtZQUNoQyxDQUFDLENBQUE7WUFFRCxvQkFBb0IsRUFBRSxDQUFPLE9BQU8sRUFBRSxLQUFLLEVBQUUsRUFBRTtnQkFDN0MsT0FBTyxDQUFDLGdCQUFnQixFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFO29CQUN2QyxNQUFNLENBQUMsc0JBQXNCLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRTt3QkFDL0QsTUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFBO3dCQUMxRCxNQUFNLGVBQWUsR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLHlCQUF5QixDQUFDLENBQUE7d0JBQzFFLElBQUksQ0FBQyxPQUFPLElBQUksQ0FBQyxlQUFlOzRCQUFFLE9BQU07d0JBRXhDLE9BQU8sT0FBTyxDQUFDLFVBQVUsRUFBRTs0QkFDekIsT0FBTyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUE7eUJBQ3hDO3dCQUVELHdDQUF3Qzt3QkFDeEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUU7NEJBQ2pCLE9BQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQTs0QkFDOUIsZUFBZSxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFBOzRCQUV0Qyx3QkFBd0I7NEJBQ3hCLElBQUksZUFBZSxDQUFDLFFBQVEsQ0FBQyxNQUFNO2dDQUFFLE9BQU07NEJBRTNDLE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUE7NEJBQzdDLE9BQU8sQ0FBQyxXQUFXLEdBQUcsK0JBQVEsQ0FBQywrQkFBK0IsRUFBRSxXQUFXLENBQUMsQ0FBQTs0QkFDNUUsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsc0JBQXNCLENBQUMsQ0FBQTs0QkFDN0MsZUFBZSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQTs0QkFDcEMsT0FBTTt5QkFDUDt3QkFFRCxlQUFlLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUE7d0JBQ3RDLE9BQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQTt3QkFFL0IsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTs0QkFDbkIsTUFBTSxFQUFFLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQTs0QkFDdkMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUE7NEJBQzlCLFFBQVEsSUFBSSxDQUFDLFFBQVEsRUFBRTtnQ0FDckIsS0FBSyxDQUFDO29DQUNKLEVBQUUsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFBO29DQUMzQixNQUFLO2dDQUNQLEtBQUssQ0FBQztvQ0FDSixFQUFFLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQTtvQ0FDekIsTUFBSztnQ0FDUCxLQUFLLENBQUM7b0NBQ0osRUFBRSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUE7b0NBQzlCLE1BQUs7Z0NBQ1AsS0FBSyxDQUFDO29DQUNKLEVBQUUsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFBO29DQUMzQixNQUFLOzZCQUNSOzRCQUVELElBQUksT0FBTyxJQUFJLEtBQUssUUFBUSxFQUFFO2dDQUM1QixFQUFFLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQTs2QkFDdEI7aUNBQU07Z0NBQ0wsRUFBRSxDQUFDLFdBQVcsR0FBRyxPQUFPLENBQUMsRUFBRSxDQUFDLDRCQUE0QixDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUE7NkJBQ2pGOzRCQUNELE9BQU8sQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUE7NEJBRXZCLEVBQUUsQ0FBQyxZQUFZLEdBQUcsR0FBRyxFQUFFO2dDQUNyQixJQUFJLElBQUksQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLGNBQWMsRUFBRTtvQ0FDaEQsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7b0NBQzdDLE1BQU0sR0FBRyxHQUFHLEtBQUssQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUE7b0NBQ3pELFdBQVcsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsRUFBRTt3Q0FDekQ7NENBQ0UsS0FBSyxFQUFFLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxVQUFVLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQzs0Q0FDM0YsT0FBTyxFQUFFLEVBQUUsZUFBZSxFQUFFLGlCQUFpQixFQUFFO3lDQUNoRDtxQ0FDRixDQUFDLENBQUE7aUNBQ0g7NEJBQ0gsQ0FBQyxDQUFBOzRCQUVELEVBQUUsQ0FBQyxZQUFZLEdBQUcsR0FBRyxFQUFFO2dDQUNyQixJQUFJLENBQUMsY0FBYyxFQUFFO29DQUNuQixPQUFPLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsQ0FBQTtpQ0FDakQ7NEJBQ0gsQ0FBQyxDQUFBOzRCQUVELEVBQUUsQ0FBQyxPQUFPLEdBQUcsR0FBRyxFQUFFO2dDQUNoQixJQUFJLElBQUksQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtvQ0FDN0IsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7b0NBQzdDLE9BQU8sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQTtvQ0FFM0MsTUFBTSxHQUFHLEdBQUcsS0FBSyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQTtvQ0FDekQsV0FBVyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxFQUFFO3dDQUN6RDs0Q0FDRSxLQUFLLEVBQUUsSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLFVBQVUsRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDOzRDQUMzRixPQUFPLEVBQUUsRUFBRSxlQUFlLEVBQUUsaUJBQWlCLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRTt5Q0FDbkU7cUNBQ0YsQ0FBQyxDQUFBO29DQUVGLGNBQWMsR0FBRyxJQUFJLENBQUE7b0NBQ3JCLFVBQVUsQ0FBQyxHQUFHLEVBQUU7d0NBQ2QsY0FBYyxHQUFHLEtBQUssQ0FBQTt3Q0FDdEIsT0FBTyxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDLENBQUE7b0NBQ2xELENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQTtpQ0FDUjs0QkFDSCxDQUFDLENBQUE7d0JBQ0gsQ0FBQyxDQUFDLENBQUE7b0JBQ0osQ0FBQyxDQUFDLENBQUE7Z0JBQ0osQ0FBQyxDQUFDLENBQUE7WUFDSixDQUFDLENBQUE7U0FDRixDQUFBO1FBRUQsT0FBTyxNQUFNLENBQUE7SUFDZixDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBQbGF5Z3JvdW5kUGx1Z2luLCBQbHVnaW5GYWN0b3J5IH0gZnJvbSAnLi4nXG5pbXBvcnQgeyBsb2NhbGl6ZSB9IGZyb20gJy4uL2xvY2FsaXplV2l0aEZhbGxiYWNrJ1xuXG5leHBvcnQgY29uc3Qgc2hvd0Vycm9yczogUGx1Z2luRmFjdG9yeSA9IGkgPT4ge1xuICBsZXQgZGVjb3JhdGlvbnM6IHN0cmluZ1tdID0gW11cbiAgbGV0IGRlY29yYXRpb25Mb2NrID0gZmFsc2VcblxuICBjb25zdCBwbHVnaW46IFBsYXlncm91bmRQbHVnaW4gPSB7XG4gICAgaWQ6ICdlcnJvcnMnLFxuICAgIGRpc3BsYXlOYW1lOiBpKCdwbGF5X3NpZGViYXJfZXJyb3JzJyksXG4gICAgd2lsbE1vdW50OiBhc3luYyAoc2FuZGJveCwgY29udGFpbmVyKSA9PiB7XG4gICAgICBjb25zdCBub0Vycm9yc01lc3NhZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgICAgbm9FcnJvcnNNZXNzYWdlLmlkID0gJ2VtcHR5LW1lc3NhZ2UtY29udGFpbmVyJ1xuICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKG5vRXJyb3JzTWVzc2FnZSlcblxuICAgICAgY29uc3QgZXJyb3JVTCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3VsJylcbiAgICAgIGVycm9yVUwuaWQgPSAnY29tcGlsZXItZXJyb3JzJ1xuICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGVycm9yVUwpXG4gICAgfSxcblxuICAgIG1vZGVsQ2hhbmdlZERlYm91bmNlOiBhc3luYyAoc2FuZGJveCwgbW9kZWwpID0+IHtcbiAgICAgIHNhbmRib3guZ2V0V29ya2VyUHJvY2VzcygpLnRoZW4od29ya2VyID0+IHtcbiAgICAgICAgd29ya2VyLmdldFNlbWFudGljRGlhZ25vc3RpY3MobW9kZWwudXJpLnRvU3RyaW5nKCkpLnRoZW4oZGlhZ3MgPT4ge1xuICAgICAgICAgIGNvbnN0IGVycm9yVUwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29tcGlsZXItZXJyb3JzJylcbiAgICAgICAgICBjb25zdCBub0Vycm9yc01lc3NhZ2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZW1wdHktbWVzc2FnZS1jb250YWluZXInKVxuICAgICAgICAgIGlmICghZXJyb3JVTCB8fCAhbm9FcnJvcnNNZXNzYWdlKSByZXR1cm5cblxuICAgICAgICAgIHdoaWxlIChlcnJvclVMLmZpcnN0Q2hpbGQpIHtcbiAgICAgICAgICAgIGVycm9yVUwucmVtb3ZlQ2hpbGQoZXJyb3JVTC5maXJzdENoaWxkKVxuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIEJhaWwgZWFybHkgaWYgdGhlcmUncyBub3RoaW5nIHRvIHNob3dcbiAgICAgICAgICBpZiAoIWRpYWdzLmxlbmd0aCkge1xuICAgICAgICAgICAgZXJyb3JVTC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXG4gICAgICAgICAgICBub0Vycm9yc01lc3NhZ2Uuc3R5bGUuZGlzcGxheSA9ICdmbGV4J1xuXG4gICAgICAgICAgICAvLyBBbHJlYWR5IGhhcyBhIG1lc3NhZ2VcbiAgICAgICAgICAgIGlmIChub0Vycm9yc01lc3NhZ2UuY2hpbGRyZW4ubGVuZ3RoKSByZXR1cm5cblxuICAgICAgICAgICAgY29uc3QgbWVzc2FnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgICAgICAgICBtZXNzYWdlLnRleHRDb250ZW50ID0gbG9jYWxpemUoJ3BsYXlfc2lkZWJhcl9lcnJvcnNfbm9fZXJyb3JzJywgJ05vIGVycm9ycycpXG4gICAgICAgICAgICBtZXNzYWdlLmNsYXNzTGlzdC5hZGQoJ2VtcHR5LXBsdWdpbi1tZXNzYWdlJylcbiAgICAgICAgICAgIG5vRXJyb3JzTWVzc2FnZS5hcHBlbmRDaGlsZChtZXNzYWdlKVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbm9FcnJvcnNNZXNzYWdlLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcbiAgICAgICAgICBlcnJvclVMLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snXG5cbiAgICAgICAgICBkaWFncy5mb3JFYWNoKGRpYWcgPT4ge1xuICAgICAgICAgICAgY29uc3QgbGkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpXG4gICAgICAgICAgICBsaS5jbGFzc0xpc3QuYWRkKCdkaWFnbm9zdGljJylcbiAgICAgICAgICAgIHN3aXRjaCAoZGlhZy5jYXRlZ29yeSkge1xuICAgICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgICAgbGkuY2xhc3NMaXN0LmFkZCgnd2FybmluZycpXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgIGxpLmNsYXNzTGlzdC5hZGQoJ2Vycm9yJylcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgbGkuY2xhc3NMaXN0LmFkZCgnc3VnZ2VzdGlvbicpXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgICAgIGxpLmNsYXNzTGlzdC5hZGQoJ21lc3NhZ2UnKVxuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2YgZGlhZyA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgbGkudGV4dENvbnRlbnQgPSBkaWFnXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBsaS50ZXh0Q29udGVudCA9IHNhbmRib3gudHMuZmxhdHRlbkRpYWdub3N0aWNNZXNzYWdlVGV4dChkaWFnLm1lc3NhZ2VUZXh0LCAnXFxuJylcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVycm9yVUwuYXBwZW5kQ2hpbGQobGkpXG5cbiAgICAgICAgICAgIGxpLm9ubW91c2VlbnRlciA9ICgpID0+IHtcbiAgICAgICAgICAgICAgaWYgKGRpYWcuc3RhcnQgJiYgZGlhZy5sZW5ndGggJiYgIWRlY29yYXRpb25Mb2NrKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3RhcnQgPSBtb2RlbC5nZXRQb3NpdGlvbkF0KGRpYWcuc3RhcnQpXG4gICAgICAgICAgICAgICAgY29uc3QgZW5kID0gbW9kZWwuZ2V0UG9zaXRpb25BdChkaWFnLnN0YXJ0ICsgZGlhZy5sZW5ndGgpXG4gICAgICAgICAgICAgICAgZGVjb3JhdGlvbnMgPSBzYW5kYm94LmVkaXRvci5kZWx0YURlY29yYXRpb25zKGRlY29yYXRpb25zLCBbXG4gICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHJhbmdlOiBuZXcgc2FuZGJveC5tb25hY28uUmFuZ2Uoc3RhcnQubGluZU51bWJlciwgc3RhcnQuY29sdW1uLCBlbmQubGluZU51bWJlciwgZW5kLmNvbHVtbiksXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnM6IHsgaW5saW5lQ2xhc3NOYW1lOiAnZXJyb3ItaGlnaGxpZ2h0JyB9LFxuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxpLm9ubW91c2VsZWF2ZSA9ICgpID0+IHtcbiAgICAgICAgICAgICAgaWYgKCFkZWNvcmF0aW9uTG9jaykge1xuICAgICAgICAgICAgICAgIHNhbmRib3guZWRpdG9yLmRlbHRhRGVjb3JhdGlvbnMoZGVjb3JhdGlvbnMsIFtdKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxpLm9uY2xpY2sgPSAoKSA9PiB7XG4gICAgICAgICAgICAgIGlmIChkaWFnLnN0YXJ0ICYmIGRpYWcubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3RhcnQgPSBtb2RlbC5nZXRQb3NpdGlvbkF0KGRpYWcuc3RhcnQpXG4gICAgICAgICAgICAgICAgc2FuZGJveC5lZGl0b3IucmV2ZWFsTGluZShzdGFydC5saW5lTnVtYmVyKVxuXG4gICAgICAgICAgICAgICAgY29uc3QgZW5kID0gbW9kZWwuZ2V0UG9zaXRpb25BdChkaWFnLnN0YXJ0ICsgZGlhZy5sZW5ndGgpXG4gICAgICAgICAgICAgICAgZGVjb3JhdGlvbnMgPSBzYW5kYm94LmVkaXRvci5kZWx0YURlY29yYXRpb25zKGRlY29yYXRpb25zLCBbXG4gICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHJhbmdlOiBuZXcgc2FuZGJveC5tb25hY28uUmFuZ2Uoc3RhcnQubGluZU51bWJlciwgc3RhcnQuY29sdW1uLCBlbmQubGluZU51bWJlciwgZW5kLmNvbHVtbiksXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnM6IHsgaW5saW5lQ2xhc3NOYW1lOiAnZXJyb3ItaGlnaGxpZ2h0JywgaXNXaG9sZUxpbmU6IHRydWUgfSxcbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXSlcblxuICAgICAgICAgICAgICAgIGRlY29yYXRpb25Mb2NrID0gdHJ1ZVxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgZGVjb3JhdGlvbkxvY2sgPSBmYWxzZVxuICAgICAgICAgICAgICAgICAgc2FuZGJveC5lZGl0b3IuZGVsdGFEZWNvcmF0aW9ucyhkZWNvcmF0aW9ucywgW10pXG4gICAgICAgICAgICAgICAgfSwgMzAwKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfSxcbiAgfVxuXG4gIHJldHVybiBwbHVnaW5cbn1cbiJdfQ==