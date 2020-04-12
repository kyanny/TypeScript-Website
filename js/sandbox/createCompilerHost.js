// A single file version from
// https://stackoverflow.com/questions/53733138/how-do-i-type-check-a-snippet-of-typescript-code-in-memory
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function createCompilerHost(code, path) {
        const host = {
            fileExists: filePath => filePath === path,
            directoryExists: dirPath => dirPath === '/',
            getCurrentDirectory: () => '/',
            getDirectories: () => [],
            getCanonicalFileName: fileName => fileName,
            getNewLine: () => '\n',
            getDefaultLibFileName: () => '',
            getSourceFile: _ => undefined,
            readFile: filePath => (filePath === path ? code : undefined),
            useCaseSensitiveFileNames: () => true,
            writeFile: () => { },
        };
        return host;
    }
    exports.createCompilerHost = createCompilerHost;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlQ29tcGlsZXJIb3N0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc2FuZGJveC9zcmMvY3JlYXRlQ29tcGlsZXJIb3N0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDZCQUE2QjtBQUM3QiwwR0FBMEc7Ozs7SUFFMUcsU0FBZ0Isa0JBQWtCLENBQUMsSUFBWSxFQUFFLElBQVk7UUFDM0QsTUFBTSxJQUFJLEdBQXNDO1lBQzlDLFVBQVUsRUFBRSxRQUFRLENBQUMsRUFBRSxDQUFDLFFBQVEsS0FBSyxJQUFJO1lBQ3pDLGVBQWUsRUFBRSxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sS0FBSyxHQUFHO1lBQzNDLG1CQUFtQixFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUc7WUFDOUIsY0FBYyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUU7WUFDeEIsb0JBQW9CLEVBQUUsUUFBUSxDQUFDLEVBQUUsQ0FBQyxRQUFRO1lBQzFDLFVBQVUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJO1lBQ3RCLHFCQUFxQixFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUU7WUFDL0IsYUFBYSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsU0FBUztZQUM3QixRQUFRLEVBQUUsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1lBQzVELHlCQUF5QixFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUk7WUFDckMsU0FBUyxFQUFFLEdBQUcsRUFBRSxHQUFFLENBQUM7U0FDcEIsQ0FBQTtRQUVELE9BQU8sSUFBSSxDQUFBO0lBQ2IsQ0FBQztJQWhCRCxnREFnQkMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBBIHNpbmdsZSBmaWxlIHZlcnNpb24gZnJvbVxuLy8gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvNTM3MzMxMzgvaG93LWRvLWktdHlwZS1jaGVjay1hLXNuaXBwZXQtb2YtdHlwZXNjcmlwdC1jb2RlLWluLW1lbW9yeVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQ29tcGlsZXJIb3N0KGNvZGU6IHN0cmluZywgcGF0aDogc3RyaW5nKSB7XG4gIGNvbnN0IGhvc3Q6IGltcG9ydCgndHlwZXNjcmlwdCcpLkNvbXBpbGVySG9zdCA9IHtcbiAgICBmaWxlRXhpc3RzOiBmaWxlUGF0aCA9PiBmaWxlUGF0aCA9PT0gcGF0aCxcbiAgICBkaXJlY3RvcnlFeGlzdHM6IGRpclBhdGggPT4gZGlyUGF0aCA9PT0gJy8nLFxuICAgIGdldEN1cnJlbnREaXJlY3Rvcnk6ICgpID0+ICcvJyxcbiAgICBnZXREaXJlY3RvcmllczogKCkgPT4gW10sXG4gICAgZ2V0Q2Fub25pY2FsRmlsZU5hbWU6IGZpbGVOYW1lID0+IGZpbGVOYW1lLFxuICAgIGdldE5ld0xpbmU6ICgpID0+ICdcXG4nLFxuICAgIGdldERlZmF1bHRMaWJGaWxlTmFtZTogKCkgPT4gJycsXG4gICAgZ2V0U291cmNlRmlsZTogXyA9PiB1bmRlZmluZWQsXG4gICAgcmVhZEZpbGU6IGZpbGVQYXRoID0+IChmaWxlUGF0aCA9PT0gcGF0aCA/IGNvZGUgOiB1bmRlZmluZWQpLFxuICAgIHVzZUNhc2VTZW5zaXRpdmVGaWxlTmFtZXM6ICgpID0+IHRydWUsXG4gICAgd3JpdGVGaWxlOiAoKSA9PiB7fSxcbiAgfVxuXG4gIHJldHVybiBob3N0XG59XG4iXX0=