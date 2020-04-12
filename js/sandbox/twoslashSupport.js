define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const booleanConfigRegexp = /^\/\/\s?@(\w+)$/;
    // https://regex101.com/r/8B2Wwh/1
    const valuedConfigRegexp = /^\/\/\s?@(\w+):\s?(.+)$/;
    /**
     * This is a port of the twoslash bit which grabs compiler options
     * from the source code
     */
    exports.extractTwoSlashComplierOptions = (ts) => (code) => {
        const codeLines = code.split('\n');
        const options = {};
        codeLines.forEach(line => {
            let match;
            if ((match = booleanConfigRegexp.exec(line))) {
                options[match[1]] = true;
                setOption(match[1], 'true', options, ts);
            }
            else if ((match = valuedConfigRegexp.exec(line))) {
                setOption(match[1], match[2], options, ts);
            }
        });
        return options;
    };
    function setOption(name, value, opts, ts) {
        // @ts-ignore - optionDeclarations is not public API
        for (const opt of ts.optionDeclarations) {
            if (opt.name.toLowerCase() === name.toLowerCase()) {
                switch (opt.type) {
                    case 'number':
                    case 'string':
                    case 'boolean':
                        opts[opt.name] = parsePrimitive(value, opt.type);
                        break;
                    case 'list':
                        opts[opt.name] = value.split(',').map(v => parsePrimitive(v, opt.element.type));
                        break;
                    default:
                        opts[opt.name] = opt.type.get(value.toLowerCase());
                        if (opts[opt.name] === undefined) {
                            const keys = Array.from(opt.type.keys());
                            throw new Error(`Invalid value ${value} for ${opt.name}. Allowed values: ${keys.join(',')}`);
                        }
                        break;
                }
                return;
            }
        }
        throw new Error(`No compiler setting named '${name}' exists!`);
    }
    function parsePrimitive(value, type) {
        switch (type) {
            case 'number':
                return +value;
            case 'string':
                return value;
            case 'boolean':
                return value.toLowerCase() === 'true' || value.length === 0;
        }
        console.log(`Unknown primitive type ${type} with - ${value}`);
    }
    exports.parsePrimitive = parsePrimitive;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHdvc2xhc2hTdXBwb3J0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc2FuZGJveC9zcmMvdHdvc2xhc2hTdXBwb3J0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQUFBLE1BQU0sbUJBQW1CLEdBQUcsaUJBQWlCLENBQUE7SUFFN0Msa0NBQWtDO0lBQ2xDLE1BQU0sa0JBQWtCLEdBQUcseUJBQXlCLENBQUE7SUFNcEQ7OztPQUdHO0lBRVUsUUFBQSw4QkFBOEIsR0FBRyxDQUFDLEVBQU0sRUFBRSxFQUFFLENBQUMsQ0FBQyxJQUFZLEVBQUUsRUFBRTtRQUN6RSxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFBO1FBQ2xDLE1BQU0sT0FBTyxHQUFHLEVBQVMsQ0FBQTtRQUV6QixTQUFTLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ3ZCLElBQUksS0FBSyxDQUFBO1lBQ1QsSUFBSSxDQUFDLEtBQUssR0FBRyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRTtnQkFDNUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQTtnQkFDeEIsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFBO2FBQ3pDO2lCQUFNLElBQUksQ0FBQyxLQUFLLEdBQUcsa0JBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUU7Z0JBQ2xELFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQTthQUMzQztRQUNILENBQUMsQ0FBQyxDQUFBO1FBQ0YsT0FBTyxPQUFPLENBQUE7SUFDaEIsQ0FBQyxDQUFBO0lBRUQsU0FBUyxTQUFTLENBQUMsSUFBWSxFQUFFLEtBQWEsRUFBRSxJQUFxQixFQUFFLEVBQU07UUFDM0Usb0RBQW9EO1FBQ3BELEtBQUssTUFBTSxHQUFHLElBQUksRUFBRSxDQUFDLGtCQUFrQixFQUFFO1lBQ3ZDLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsS0FBSyxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUU7Z0JBQ2pELFFBQVEsR0FBRyxDQUFDLElBQUksRUFBRTtvQkFDaEIsS0FBSyxRQUFRLENBQUM7b0JBQ2QsS0FBSyxRQUFRLENBQUM7b0JBQ2QsS0FBSyxTQUFTO3dCQUNaLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsY0FBYyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUE7d0JBQ2hELE1BQUs7b0JBRVAsS0FBSyxNQUFNO3dCQUNULElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxjQUFjLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxPQUFRLENBQUMsSUFBYyxDQUFDLENBQUMsQ0FBQTt3QkFDMUYsTUFBSztvQkFFUDt3QkFDRSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFBO3dCQUVsRCxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssU0FBUyxFQUFFOzRCQUNoQyxNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFTLENBQUMsQ0FBQTs0QkFDL0MsTUFBTSxJQUFJLEtBQUssQ0FBQyxpQkFBaUIsS0FBSyxRQUFRLEdBQUcsQ0FBQyxJQUFJLHFCQUFxQixJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQTt5QkFDN0Y7d0JBQ0QsTUFBSztpQkFDUjtnQkFDRCxPQUFNO2FBQ1A7U0FDRjtRQUVELE1BQU0sSUFBSSxLQUFLLENBQUMsOEJBQThCLElBQUksV0FBVyxDQUFDLENBQUE7SUFDaEUsQ0FBQztJQUVELFNBQWdCLGNBQWMsQ0FBQyxLQUFhLEVBQUUsSUFBWTtRQUN4RCxRQUFRLElBQUksRUFBRTtZQUNaLEtBQUssUUFBUTtnQkFDWCxPQUFPLENBQUMsS0FBSyxDQUFBO1lBQ2YsS0FBSyxRQUFRO2dCQUNYLE9BQU8sS0FBSyxDQUFBO1lBQ2QsS0FBSyxTQUFTO2dCQUNaLE9BQU8sS0FBSyxDQUFDLFdBQVcsRUFBRSxLQUFLLE1BQU0sSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQTtTQUM5RDtRQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMsMEJBQTBCLElBQUksV0FBVyxLQUFLLEVBQUUsQ0FBQyxDQUFBO0lBQy9ELENBQUM7SUFWRCx3Q0FVQyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IGJvb2xlYW5Db25maWdSZWdleHAgPSAvXlxcL1xcL1xccz9AKFxcdyspJC9cblxuLy8gaHR0cHM6Ly9yZWdleDEwMS5jb20vci84QjJXd2gvMVxuY29uc3QgdmFsdWVkQ29uZmlnUmVnZXhwID0gL15cXC9cXC9cXHM/QChcXHcrKTpcXHM/KC4rKSQvXG5cbnR5cGUgU2FuZGJveCA9IFJldHVyblR5cGU8dHlwZW9mIGltcG9ydCgnLicpLmNyZWF0ZVR5cGVTY3JpcHRTYW5kYm94PlxudHlwZSBUUyA9IHR5cGVvZiBpbXBvcnQoJ3R5cGVzY3JpcHQnKVxudHlwZSBDb21waWxlck9wdGlvbnMgPSBpbXBvcnQoJ3R5cGVzY3JpcHQnKS5Db21waWxlck9wdGlvbnNcblxuLyoqXG4gKiBUaGlzIGlzIGEgcG9ydCBvZiB0aGUgdHdvc2xhc2ggYml0IHdoaWNoIGdyYWJzIGNvbXBpbGVyIG9wdGlvbnNcbiAqIGZyb20gdGhlIHNvdXJjZSBjb2RlXG4gKi9cblxuZXhwb3J0IGNvbnN0IGV4dHJhY3RUd29TbGFzaENvbXBsaWVyT3B0aW9ucyA9ICh0czogVFMpID0+IChjb2RlOiBzdHJpbmcpID0+IHtcbiAgY29uc3QgY29kZUxpbmVzID0gY29kZS5zcGxpdCgnXFxuJylcbiAgY29uc3Qgb3B0aW9ucyA9IHt9IGFzIGFueVxuXG4gIGNvZGVMaW5lcy5mb3JFYWNoKGxpbmUgPT4ge1xuICAgIGxldCBtYXRjaFxuICAgIGlmICgobWF0Y2ggPSBib29sZWFuQ29uZmlnUmVnZXhwLmV4ZWMobGluZSkpKSB7XG4gICAgICBvcHRpb25zW21hdGNoWzFdXSA9IHRydWVcbiAgICAgIHNldE9wdGlvbihtYXRjaFsxXSwgJ3RydWUnLCBvcHRpb25zLCB0cylcbiAgICB9IGVsc2UgaWYgKChtYXRjaCA9IHZhbHVlZENvbmZpZ1JlZ2V4cC5leGVjKGxpbmUpKSkge1xuICAgICAgc2V0T3B0aW9uKG1hdGNoWzFdLCBtYXRjaFsyXSwgb3B0aW9ucywgdHMpXG4gICAgfVxuICB9KVxuICByZXR1cm4gb3B0aW9uc1xufVxuXG5mdW5jdGlvbiBzZXRPcHRpb24obmFtZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nLCBvcHRzOiBDb21waWxlck9wdGlvbnMsIHRzOiBUUykge1xuICAvLyBAdHMtaWdub3JlIC0gb3B0aW9uRGVjbGFyYXRpb25zIGlzIG5vdCBwdWJsaWMgQVBJXG4gIGZvciAoY29uc3Qgb3B0IG9mIHRzLm9wdGlvbkRlY2xhcmF0aW9ucykge1xuICAgIGlmIChvcHQubmFtZS50b0xvd2VyQ2FzZSgpID09PSBuYW1lLnRvTG93ZXJDYXNlKCkpIHtcbiAgICAgIHN3aXRjaCAob3B0LnR5cGUpIHtcbiAgICAgICAgY2FzZSAnbnVtYmVyJzpcbiAgICAgICAgY2FzZSAnc3RyaW5nJzpcbiAgICAgICAgY2FzZSAnYm9vbGVhbic6XG4gICAgICAgICAgb3B0c1tvcHQubmFtZV0gPSBwYXJzZVByaW1pdGl2ZSh2YWx1ZSwgb3B0LnR5cGUpXG4gICAgICAgICAgYnJlYWtcblxuICAgICAgICBjYXNlICdsaXN0JzpcbiAgICAgICAgICBvcHRzW29wdC5uYW1lXSA9IHZhbHVlLnNwbGl0KCcsJykubWFwKHYgPT4gcGFyc2VQcmltaXRpdmUodiwgb3B0LmVsZW1lbnQhLnR5cGUgYXMgc3RyaW5nKSlcbiAgICAgICAgICBicmVha1xuXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgb3B0c1tvcHQubmFtZV0gPSBvcHQudHlwZS5nZXQodmFsdWUudG9Mb3dlckNhc2UoKSlcblxuICAgICAgICAgIGlmIChvcHRzW29wdC5uYW1lXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBjb25zdCBrZXlzID0gQXJyYXkuZnJvbShvcHQudHlwZS5rZXlzKCkgYXMgYW55KVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHZhbHVlICR7dmFsdWV9IGZvciAke29wdC5uYW1lfS4gQWxsb3dlZCB2YWx1ZXM6ICR7a2V5cy5qb2luKCcsJyl9YClcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICAgIHJldHVyblxuICAgIH1cbiAgfVxuXG4gIHRocm93IG5ldyBFcnJvcihgTm8gY29tcGlsZXIgc2V0dGluZyBuYW1lZCAnJHtuYW1lfScgZXhpc3RzIWApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVByaW1pdGl2ZSh2YWx1ZTogc3RyaW5nLCB0eXBlOiBzdHJpbmcpOiBhbnkge1xuICBzd2l0Y2ggKHR5cGUpIHtcbiAgICBjYXNlICdudW1iZXInOlxuICAgICAgcmV0dXJuICt2YWx1ZVxuICAgIGNhc2UgJ3N0cmluZyc6XG4gICAgICByZXR1cm4gdmFsdWVcbiAgICBjYXNlICdib29sZWFuJzpcbiAgICAgIHJldHVybiB2YWx1ZS50b0xvd2VyQ2FzZSgpID09PSAndHJ1ZScgfHwgdmFsdWUubGVuZ3RoID09PSAwXG4gIH1cbiAgY29uc29sZS5sb2coYFVua25vd24gcHJpbWl0aXZlIHR5cGUgJHt0eXBlfSB3aXRoIC0gJHt2YWx1ZX1gKVxufVxuIl19