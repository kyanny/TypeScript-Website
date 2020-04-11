define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /** contains the ts-ignore, and the global window manipulation  */
    exports.localize = (key, fallback) => 
    // @ts-ignore
    'i' in window ? window.i(key) : fallback;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYWxpemVXaXRoRmFsbGJhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wbGF5Z3JvdW5kL3NyYy9sb2NhbGl6ZVdpdGhGYWxsYmFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFBQSxrRUFBa0U7SUFDckQsUUFBQSxRQUFRLEdBQUcsQ0FBQyxHQUFXLEVBQUUsUUFBZ0IsRUFBRSxFQUFFO0lBQ3hELGFBQWE7SUFDYixHQUFHLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKiogY29udGFpbnMgdGhlIHRzLWlnbm9yZSwgYW5kIHRoZSBnbG9iYWwgd2luZG93IG1hbmlwdWxhdGlvbiAgKi9cbmV4cG9ydCBjb25zdCBsb2NhbGl6ZSA9IChrZXk6IHN0cmluZywgZmFsbGJhY2s6IHN0cmluZykgPT5cbiAgLy8gQHRzLWlnbm9yZVxuICAnaScgaW4gd2luZG93ID8gd2luZG93Lmkoa2V5KSA6IGZhbGxiYWNrXG4iXX0=