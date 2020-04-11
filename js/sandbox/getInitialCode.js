var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "./vendor/lzstring.min"], function (require, exports, lzstring_min_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    lzstring_min_1 = __importDefault(lzstring_min_1);
    /**
     * Grabs the sourcecode for an example from the query hash or local storage
     * @param fallback if nothing is found return this
     * @param location DI'd copy of document.location
     */
    exports.getInitialCode = (fallback, location) => {
        // Old school support
        if (location.hash.startsWith('#src')) {
            const code = location.hash.replace('#src=', '').trim();
            return decodeURIComponent(code);
        }
        // New school support
        if (location.hash.startsWith('#code')) {
            const code = location.hash.replace('#code/', '').trim();
            let userCode = lzstring_min_1.default.decompressFromEncodedURIComponent(code);
            // Fallback incase there is an extra level of decoding:
            // https://gitter.im/Microsoft/TypeScript?at=5dc478ab9c39821509ff189a
            if (!userCode)
                userCode = lzstring_min_1.default.decompressFromEncodedURIComponent(decodeURIComponent(code));
            return userCode;
        }
        // Local copy fallback
        if (localStorage.getItem('sandbox-history')) {
            return localStorage.getItem('sandbox-history');
        }
        return fallback;
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0SW5pdGlhbENvZGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zYW5kYm94L3NyYy9nZXRJbml0aWFsQ29kZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7O0lBRUE7Ozs7T0FJRztJQUNVLFFBQUEsY0FBYyxHQUFHLENBQUMsUUFBZ0IsRUFBRSxRQUFrQixFQUFFLEVBQUU7UUFDckUscUJBQXFCO1FBQ3JCLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDcEMsTUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFBO1lBQ3RELE9BQU8sa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUE7U0FDaEM7UUFFRCxxQkFBcUI7UUFDckIsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUNyQyxNQUFNLElBQUksR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUE7WUFDdkQsSUFBSSxRQUFRLEdBQUcsc0JBQVEsQ0FBQyxpQ0FBaUMsQ0FBQyxJQUFJLENBQUMsQ0FBQTtZQUMvRCx1REFBdUQ7WUFDdkQscUVBQXFFO1lBQ3JFLElBQUksQ0FBQyxRQUFRO2dCQUFFLFFBQVEsR0FBRyxzQkFBUSxDQUFDLGlDQUFpQyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUE7WUFDOUYsT0FBTyxRQUFRLENBQUE7U0FDaEI7UUFFRCxzQkFBc0I7UUFDdEIsSUFBSSxZQUFZLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLEVBQUU7WUFDM0MsT0FBTyxZQUFZLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFFLENBQUE7U0FDaEQ7UUFFRCxPQUFPLFFBQVEsQ0FBQTtJQUNqQixDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgbHpzdHJpbmcgZnJvbSAnLi92ZW5kb3IvbHpzdHJpbmcubWluJ1xuXG4vKipcbiAqIEdyYWJzIHRoZSBzb3VyY2Vjb2RlIGZvciBhbiBleGFtcGxlIGZyb20gdGhlIHF1ZXJ5IGhhc2ggb3IgbG9jYWwgc3RvcmFnZVxuICogQHBhcmFtIGZhbGxiYWNrIGlmIG5vdGhpbmcgaXMgZm91bmQgcmV0dXJuIHRoaXNcbiAqIEBwYXJhbSBsb2NhdGlvbiBESSdkIGNvcHkgb2YgZG9jdW1lbnQubG9jYXRpb25cbiAqL1xuZXhwb3J0IGNvbnN0IGdldEluaXRpYWxDb2RlID0gKGZhbGxiYWNrOiBzdHJpbmcsIGxvY2F0aW9uOiBMb2NhdGlvbikgPT4ge1xuICAvLyBPbGQgc2Nob29sIHN1cHBvcnRcbiAgaWYgKGxvY2F0aW9uLmhhc2guc3RhcnRzV2l0aCgnI3NyYycpKSB7XG4gICAgY29uc3QgY29kZSA9IGxvY2F0aW9uLmhhc2gucmVwbGFjZSgnI3NyYz0nLCAnJykudHJpbSgpXG4gICAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChjb2RlKVxuICB9XG5cbiAgLy8gTmV3IHNjaG9vbCBzdXBwb3J0XG4gIGlmIChsb2NhdGlvbi5oYXNoLnN0YXJ0c1dpdGgoJyNjb2RlJykpIHtcbiAgICBjb25zdCBjb2RlID0gbG9jYXRpb24uaGFzaC5yZXBsYWNlKCcjY29kZS8nLCAnJykudHJpbSgpXG4gICAgbGV0IHVzZXJDb2RlID0gbHpzdHJpbmcuZGVjb21wcmVzc0Zyb21FbmNvZGVkVVJJQ29tcG9uZW50KGNvZGUpXG4gICAgLy8gRmFsbGJhY2sgaW5jYXNlIHRoZXJlIGlzIGFuIGV4dHJhIGxldmVsIG9mIGRlY29kaW5nOlxuICAgIC8vIGh0dHBzOi8vZ2l0dGVyLmltL01pY3Jvc29mdC9UeXBlU2NyaXB0P2F0PTVkYzQ3OGFiOWMzOTgyMTUwOWZmMTg5YVxuICAgIGlmICghdXNlckNvZGUpIHVzZXJDb2RlID0gbHpzdHJpbmcuZGVjb21wcmVzc0Zyb21FbmNvZGVkVVJJQ29tcG9uZW50KGRlY29kZVVSSUNvbXBvbmVudChjb2RlKSlcbiAgICByZXR1cm4gdXNlckNvZGVcbiAgfVxuXG4gIC8vIExvY2FsIGNvcHkgZmFsbGJhY2tcbiAgaWYgKGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdzYW5kYm94LWhpc3RvcnknKSkge1xuICAgIHJldHVybiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnc2FuZGJveC1oaXN0b3J5JykhXG4gIH1cblxuICByZXR1cm4gZmFsbGJhY2tcbn1cbiJdfQ==