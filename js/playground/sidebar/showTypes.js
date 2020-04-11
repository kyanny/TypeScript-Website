var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.compiledJSPlugin = () => {
        let codeElement;
        const plugin = {
            id: 'types',
            displayName: 'Types',
            willMount: (sandbox, container) => __awaiter(void 0, void 0, void 0, function* () {
                const createCodePre = document.createElement('pre');
                codeElement = document.createElement('code');
                createCodePre.appendChild(codeElement);
                container.appendChild(createCodePre);
            }),
            modelChangedDebounce: (sandbox, model) => __awaiter(void 0, void 0, void 0, function* () {
                const program = yield sandbox.createTSProgram();
                const checker = program.getTypeChecker();
                const sourceFile = program.getSourceFile(model.uri.path);
                const ts = sandbox.ts;
                sandbox.ts.forEachChild(sourceFile, node => {
                    if (ts.isInterfaceDeclaration(node)) {
                        const symbol = checker.getSymbolAtLocation(node);
                        if (symbol) {
                            console.log(symbol, symbol.members);
                        }
                        else {
                            console.log('could not get symbol for interface');
                        }
                    }
                });
            }),
        };
        return plugin;
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hvd1R5cGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vcGxheWdyb3VuZC9zcmMvc2lkZWJhci9zaG93VHlwZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBRWEsUUFBQSxnQkFBZ0IsR0FBRyxHQUFHLEVBQUU7UUFDbkMsSUFBSSxXQUF3QixDQUFBO1FBRTVCLE1BQU0sTUFBTSxHQUFxQjtZQUMvQixFQUFFLEVBQUUsT0FBTztZQUNYLFdBQVcsRUFBRSxPQUFPO1lBQ3BCLFNBQVMsRUFBRSxDQUFPLE9BQU8sRUFBRSxTQUFTLEVBQUUsRUFBRTtnQkFDdEMsTUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQTtnQkFDbkQsV0FBVyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUE7Z0JBRTVDLGFBQWEsQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLENBQUE7Z0JBQ3RDLFNBQVMsQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLENBQUE7WUFDdEMsQ0FBQyxDQUFBO1lBRUQsb0JBQW9CLEVBQUUsQ0FBTyxPQUFPLEVBQUUsS0FBSyxFQUFFLEVBQUU7Z0JBQzdDLE1BQU0sT0FBTyxHQUFHLE1BQU0sT0FBTyxDQUFDLGVBQWUsRUFBRSxDQUFBO2dCQUMvQyxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsY0FBYyxFQUFFLENBQUE7Z0JBRXhDLE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUUsQ0FBQTtnQkFDekQsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLEVBQUUsQ0FBQTtnQkFDckIsT0FBTyxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxFQUFFO29CQUN6QyxJQUFJLEVBQUUsQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsRUFBRTt3QkFDbkMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFBO3dCQUNoRCxJQUFJLE1BQU0sRUFBRTs0QkFDVixPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUE7eUJBQ3BDOzZCQUFNOzRCQUNMLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0NBQW9DLENBQUMsQ0FBQTt5QkFDbEQ7cUJBQ0Y7Z0JBQ0gsQ0FBQyxDQUFDLENBQUE7WUFDSixDQUFDLENBQUE7U0FDRixDQUFBO1FBRUQsT0FBTyxNQUFNLENBQUE7SUFDZixDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBQbGF5Z3JvdW5kUGx1Z2luIH0gZnJvbSAnLi4nXG5cbmV4cG9ydCBjb25zdCBjb21waWxlZEpTUGx1Z2luID0gKCkgPT4ge1xuICBsZXQgY29kZUVsZW1lbnQ6IEhUTUxFbGVtZW50XG5cbiAgY29uc3QgcGx1Z2luOiBQbGF5Z3JvdW5kUGx1Z2luID0ge1xuICAgIGlkOiAndHlwZXMnLFxuICAgIGRpc3BsYXlOYW1lOiAnVHlwZXMnLFxuICAgIHdpbGxNb3VudDogYXN5bmMgKHNhbmRib3gsIGNvbnRhaW5lcikgPT4ge1xuICAgICAgY29uc3QgY3JlYXRlQ29kZVByZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3ByZScpXG4gICAgICBjb2RlRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NvZGUnKVxuXG4gICAgICBjcmVhdGVDb2RlUHJlLmFwcGVuZENoaWxkKGNvZGVFbGVtZW50KVxuICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGNyZWF0ZUNvZGVQcmUpXG4gICAgfSxcblxuICAgIG1vZGVsQ2hhbmdlZERlYm91bmNlOiBhc3luYyAoc2FuZGJveCwgbW9kZWwpID0+IHtcbiAgICAgIGNvbnN0IHByb2dyYW0gPSBhd2FpdCBzYW5kYm94LmNyZWF0ZVRTUHJvZ3JhbSgpXG4gICAgICBjb25zdCBjaGVja2VyID0gcHJvZ3JhbS5nZXRUeXBlQ2hlY2tlcigpXG5cbiAgICAgIGNvbnN0IHNvdXJjZUZpbGUgPSBwcm9ncmFtLmdldFNvdXJjZUZpbGUobW9kZWwudXJpLnBhdGgpIVxuICAgICAgY29uc3QgdHMgPSBzYW5kYm94LnRzXG4gICAgICBzYW5kYm94LnRzLmZvckVhY2hDaGlsZChzb3VyY2VGaWxlLCBub2RlID0+IHtcbiAgICAgICAgaWYgKHRzLmlzSW50ZXJmYWNlRGVjbGFyYXRpb24obm9kZSkpIHtcbiAgICAgICAgICBjb25zdCBzeW1ib2wgPSBjaGVja2VyLmdldFN5bWJvbEF0TG9jYXRpb24obm9kZSlcbiAgICAgICAgICBpZiAoc3ltYm9sKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhzeW1ib2wsIHN5bWJvbC5tZW1iZXJzKVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnY291bGQgbm90IGdldCBzeW1ib2wgZm9yIGludGVyZmFjZScpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH0sXG4gIH1cblxuICByZXR1cm4gcGx1Z2luXG59XG4iXX0=