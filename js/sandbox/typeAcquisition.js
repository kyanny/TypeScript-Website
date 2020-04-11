var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "./vendor/lzstring.min"], function (require, exports, lzstring_min_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    lzstring_min_1 = __importDefault(lzstring_min_1);
    const globalishObj = typeof globalThis !== 'undefined' ? globalThis : window || {};
    globalishObj.typeDefinitions = {};
    /**
     * Type Defs we've already got, and nulls when something has failed.
     * This is to make sure that it doesn't infinite loop.
     */
    exports.acquiredTypeDefs = globalishObj.typeDefinitions;
    const moduleJSONURL = (name) => 
    // prettier-ignore
    `https://ofcncog2cu-dsn.algolia.net/1/indexes/npm-search/${encodeURIComponent(name)}?attributes=types&x-algolia-agent=Algolia%20for%20vanilla%20JavaScript%20(lite)%203.27.1&x-algolia-application-id=OFCNCOG2CU&x-algolia-api-key=f54e21fa3a2a0160595bb058179bfb1e`;
    const unpkgURL = (name, path) => `https://www.unpkg.com/${encodeURIComponent(name)}/${encodeURIComponent(path)}`;
    const packageJSONURL = (name) => unpkgURL(name, 'package.json');
    const errorMsg = (msg, response, config) => {
        config.logger.error(`${msg} - will not try again in this session`, response.status, response.statusText, response);
        debugger;
    };
    /**
     * Grab any import/requires from inside the code and make a list of
     * its dependencies
     */
    const parseFileForModuleReferences = (sourceCode) => {
        // https://regex101.com/r/Jxa3KX/4
        const requirePattern = /(const|let|var)(.|\n)*? require\(('|")(.*)('|")\);?$/gm;
        // this handle ths 'from' imports  https://regex101.com/r/hdEpzO/4
        const es6Pattern = /(import|export)((?!from)(?!require)(.|\n))*?(from|require\()\s?('|")(.*)('|")\)?;?$/gm;
        // https://regex101.com/r/hdEpzO/6
        const es6ImportOnly = /import\s?('|")(.*)('|")\)?;?/gm;
        const foundModules = new Set();
        var match;
        while ((match = es6Pattern.exec(sourceCode)) !== null) {
            if (match[6])
                foundModules.add(match[6]);
        }
        while ((match = requirePattern.exec(sourceCode)) !== null) {
            if (match[5])
                foundModules.add(match[5]);
        }
        while ((match = es6ImportOnly.exec(sourceCode)) !== null) {
            if (match[2])
                foundModules.add(match[2]);
        }
        return Array.from(foundModules);
    };
    /** Converts some of the known global imports to node so that we grab the right info */
    const mapModuleNameToModule = (name) => {
        // in node repl:
        // > require("module").builtinModules
        const builtInNodeMods = [
            'assert',
            'async_hooks',
            'base',
            'buffer',
            'child_process',
            'cluster',
            'console',
            'constants',
            'crypto',
            'dgram',
            'dns',
            'domain',
            'events',
            'fs',
            'globals',
            'http',
            'http2',
            'https',
            'index',
            'inspector',
            'module',
            'net',
            'os',
            'path',
            'perf_hooks',
            'process',
            'punycode',
            'querystring',
            'readline',
            'repl',
            'stream',
            'string_decoder',
            'timers',
            'tls',
            'trace_events',
            'tty',
            'url',
            'util',
            'v8',
            'vm',
            'worker_threads',
            'zlib',
        ];
        if (builtInNodeMods.includes(name)) {
            return 'node';
        }
        return name;
    };
    //** A really dumb version of path.resolve */
    const mapRelativePath = (moduleDeclaration, currentPath) => {
        // https://stackoverflow.com/questions/14780350/convert-relative-path-to-absolute-using-javascript
        function absolute(base, relative) {
            if (!base)
                return relative;
            const stack = base.split('/');
            const parts = relative.split('/');
            stack.pop(); // remove current file name (or empty string)
            for (var i = 0; i < parts.length; i++) {
                if (parts[i] == '.')
                    continue;
                if (parts[i] == '..')
                    stack.pop();
                else
                    stack.push(parts[i]);
            }
            return stack.join('/');
        }
        return absolute(currentPath, moduleDeclaration);
    };
    const convertToModuleReferenceID = (outerModule, moduleDeclaration, currentPath) => {
        const modIsScopedPackageOnly = moduleDeclaration.indexOf('@') === 0 && moduleDeclaration.split('/').length === 2;
        const modIsPackageOnly = moduleDeclaration.indexOf('@') === -1 && moduleDeclaration.split('/').length === 1;
        const isPackageRootImport = modIsPackageOnly || modIsScopedPackageOnly;
        if (isPackageRootImport) {
            return moduleDeclaration;
        }
        else {
            return `${outerModule}-${mapRelativePath(moduleDeclaration, currentPath)}`;
        }
    };
    /**
     * Takes an initial module and the path for the root of the typings and grab it and start grabbing its
     * dependencies then add those the to runtime.
     */
    const addModuleToRuntime = (mod, path, config) => __awaiter(void 0, void 0, void 0, function* () {
        const isDeno = path && path.indexOf('https://') === 0;
        const dtsFileURL = isDeno ? path : unpkgURL(mod, path);
        const content = yield getCachedDTSString(config, dtsFileURL);
        if (!content) {
            return errorMsg(`Could not get root d.ts file for the module '${mod}' at ${path}`, {}, config);
        }
        // Now look and grab dependent modules where you need the
        yield getDependenciesForModule(content, mod, path, config);
        if (isDeno) {
            const wrapped = `declare module "${path}" { ${content} }`;
            config.addLibraryToRuntime(wrapped, path);
        }
        else {
            const typelessModule = mod.split('@types/').slice(-1);
            const wrapped = `declare module "${typelessModule}" { ${content} }`;
            config.addLibraryToRuntime(wrapped, `node_modules/${mod}/${path}`);
        }
    });
    /**
     * Takes a module import, then uses both the algolia API and the the package.json to derive
     * the root type def path.
     *
     * @param {string} packageName
     * @returns {Promise<{ mod: string, path: string, packageJSON: any }>}
     */
    const getModuleAndRootDefTypePath = (packageName, config) => __awaiter(void 0, void 0, void 0, function* () {
        const url = moduleJSONURL(packageName);
        const response = yield config.fetcher(url);
        if (!response.ok) {
            return errorMsg(`Could not get Algolia JSON for the module '${packageName}'`, response, config);
        }
        const responseJSON = yield response.json();
        if (!responseJSON) {
            return errorMsg(`Could the Algolia JSON was un-parsable for the module '${packageName}'`, response, config);
        }
        if (!responseJSON.types) {
            return config.logger.log(`There were no types for '${packageName}' - will not try again in this session`);
        }
        if (!responseJSON.types.ts) {
            return config.logger.log(`There were no types for '${packageName}' - will not try again in this session`);
        }
        exports.acquiredTypeDefs[packageName] = responseJSON;
        if (responseJSON.types.ts === 'included') {
            const modPackageURL = packageJSONURL(packageName);
            const response = yield config.fetcher(modPackageURL);
            if (!response.ok) {
                return errorMsg(`Could not get Package JSON for the module '${packageName}'`, response, config);
            }
            const responseJSON = yield response.json();
            if (!responseJSON) {
                return errorMsg(`Could not get Package JSON for the module '${packageName}'`, response, config);
            }
            config.addLibraryToRuntime(JSON.stringify(responseJSON, null, '  '), `node_modules/${packageName}/package.json`);
            // Get the path of the root d.ts file
            // non-inferred route
            let rootTypePath = responseJSON.typing || responseJSON.typings || responseJSON.types;
            // package main is custom
            if (!rootTypePath && typeof responseJSON.main === 'string' && responseJSON.main.indexOf('.js') > 0) {
                rootTypePath = responseJSON.main.replace(/js$/, 'd.ts');
            }
            // Final fallback, to have got here it must have passed in algolia
            if (!rootTypePath) {
                rootTypePath = 'index.d.ts';
            }
            return { mod: packageName, path: rootTypePath, packageJSON: responseJSON };
        }
        else if (responseJSON.types.ts === 'definitely-typed') {
            return { mod: responseJSON.types.definitelyTyped, path: 'index.d.ts', packageJSON: responseJSON };
        }
        else {
            throw "This shouldn't happen";
        }
    });
    const getCachedDTSString = (config, url) => __awaiter(void 0, void 0, void 0, function* () {
        const cached = localStorage.getItem(url);
        if (cached) {
            const [dateString, text] = cached.split('-=-^-=-');
            const cachedDate = new Date(dateString);
            const now = new Date();
            const cacheTimeout = 604800000; // 1 week
            // const cacheTimeout = 60000 // 1 min
            if (now.getTime() - cachedDate.getTime() < cacheTimeout) {
                return lzstring_min_1.default.decompressFromUTF16(text);
            }
            else {
                config.logger.log('Skipping cache for ', url);
            }
        }
        const response = yield config.fetcher(url);
        if (!response.ok) {
            return errorMsg(`Could not get DTS response for the module at ${url}`, response, config);
        }
        // TODO: handle checking for a resolve to index.d.ts whens someone imports the folder
        let content = yield response.text();
        if (!content) {
            return errorMsg(`Could not get text for DTS response at ${url}`, response, config);
        }
        const now = new Date();
        const cacheContent = `${now.toISOString()}-=-^-=-${lzstring_min_1.default.compressToUTF16(content)}`;
        localStorage.setItem(url, cacheContent);
        return content;
    });
    const getReferenceDependencies = (sourceCode, mod, path, config) => __awaiter(void 0, void 0, void 0, function* () {
        var match;
        if (sourceCode.indexOf('reference path') > 0) {
            // https://regex101.com/r/DaOegw/1
            const referencePathExtractionPattern = /<reference path="(.*)" \/>/gm;
            while ((match = referencePathExtractionPattern.exec(sourceCode)) !== null) {
                const relativePath = match[1];
                if (relativePath) {
                    let newPath = mapRelativePath(relativePath, path);
                    if (newPath) {
                        const dtsRefURL = unpkgURL(mod, newPath);
                        const dtsReferenceResponseText = yield getCachedDTSString(config, dtsRefURL);
                        if (!dtsReferenceResponseText) {
                            return errorMsg(`Could not get root d.ts file for the module '${mod}' at ${path}`, {}, config);
                        }
                        yield getDependenciesForModule(dtsReferenceResponseText, mod, newPath, config);
                        const representationalPath = `node_modules/${mod}/${newPath}`;
                        config.addLibraryToRuntime(dtsReferenceResponseText, representationalPath);
                    }
                }
            }
        }
    });
    /**
     * Pseudo in-browser type acquisition tool, uses a
     */
    exports.detectNewImportsToAcquireTypeFor = (sourceCode, userAddLibraryToRuntime, fetcher = fetch, playgroundConfig) => __awaiter(void 0, void 0, void 0, function* () {
        // Wrap the runtime func with our own side-effect for visibility
        const addLibraryToRuntime = (code, path) => {
            globalishObj.typeDefinitions[path] = code;
            userAddLibraryToRuntime(code, path);
        };
        // Basically start the recursion with an undefined module
        const config = { sourceCode, addLibraryToRuntime, fetcher, logger: playgroundConfig.logger };
        const results = getDependenciesForModule(sourceCode, undefined, 'playground.ts', config);
        return results;
    });
    /**
     * Looks at a JS/DTS file and recurses through all the dependencies.
     * It avoids
     */
    const getDependenciesForModule = (sourceCode, moduleName, path, config) => {
        // Get all the import/requires for the file
        const filteredModulesToLookAt = parseFileForModuleReferences(sourceCode);
        filteredModulesToLookAt.forEach((name) => __awaiter(void 0, void 0, void 0, function* () {
            // Support grabbing the hard-coded node modules if needed
            const moduleToDownload = mapModuleNameToModule(name);
            if (!moduleName && moduleToDownload.startsWith('.')) {
                return config.logger.log("[ATA] Can't resolve relative dependencies from the playground root");
            }
            const moduleID = convertToModuleReferenceID(moduleName, moduleToDownload, moduleName);
            if (exports.acquiredTypeDefs[moduleID] || exports.acquiredTypeDefs[moduleID] === null) {
                return;
            }
            config.logger.log(`[ATA] Looking at ${moduleToDownload}`);
            const modIsScopedPackageOnly = moduleToDownload.indexOf('@') === 0 && moduleToDownload.split('/').length === 2;
            const modIsPackageOnly = moduleToDownload.indexOf('@') === -1 && moduleToDownload.split('/').length === 1;
            const isPackageRootImport = modIsPackageOnly || modIsScopedPackageOnly;
            const isDenoModule = moduleToDownload.indexOf('https://') === 0;
            if (isPackageRootImport) {
                // So it doesn't run twice for a package
                exports.acquiredTypeDefs[moduleID] = null;
                // E.g. import danger from "danger"
                const packageDef = yield getModuleAndRootDefTypePath(moduleToDownload, config);
                if (packageDef) {
                    exports.acquiredTypeDefs[moduleID] = packageDef.packageJSON;
                    yield addModuleToRuntime(packageDef.mod, packageDef.path, config);
                }
            }
            else if (isDenoModule) {
                // E.g. import { serve } from "https://deno.land/std@v0.12/http/server.ts";
                yield addModuleToRuntime(moduleToDownload, moduleToDownload, config);
            }
            else {
                // E.g. import {Component} from "./MyThing"
                if (!moduleToDownload || !path)
                    throw `No outer module or path for a relative import: ${moduleToDownload}`;
                const absolutePathForModule = mapRelativePath(moduleToDownload, path);
                // So it doesn't run twice for a package
                exports.acquiredTypeDefs[moduleID] = null;
                const resolvedFilepath = absolutePathForModule.endsWith('.ts')
                    ? absolutePathForModule
                    : absolutePathForModule + '.d.ts';
                yield addModuleToRuntime(moduleName, resolvedFilepath, config);
            }
        }));
        // Also support the
        getReferenceDependencies(sourceCode, moduleName, path, config);
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZUFjcXVpc2l0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc2FuZGJveC9zcmMvdHlwZUFjcXVpc2l0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7SUFHQSxNQUFNLFlBQVksR0FBUSxPQUFPLFVBQVUsS0FBSyxXQUFXLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsTUFBTSxJQUFJLEVBQUUsQ0FBQTtJQUN2RixZQUFZLENBQUMsZUFBZSxHQUFHLEVBQUUsQ0FBQTtJQUVqQzs7O09BR0c7SUFDVSxRQUFBLGdCQUFnQixHQUFzQyxZQUFZLENBQUMsZUFBZSxDQUFBO0lBSS9GLE1BQU0sYUFBYSxHQUFHLENBQUMsSUFBWSxFQUFFLEVBQUU7SUFDckMsa0JBQWtCO0lBQ2xCLDJEQUEyRCxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsaUxBQWlMLENBQUE7SUFFdFEsTUFBTSxRQUFRLEdBQUcsQ0FBQyxJQUFZLEVBQUUsSUFBWSxFQUFFLEVBQUUsQ0FDOUMseUJBQXlCLGtCQUFrQixDQUFDLElBQUksQ0FBQyxJQUFJLGtCQUFrQixDQUFDLElBQUksQ0FBQyxFQUFFLENBQUE7SUFFakYsTUFBTSxjQUFjLEdBQUcsQ0FBQyxJQUFZLEVBQUUsRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsY0FBYyxDQUFDLENBQUE7SUFFdkUsTUFBTSxRQUFRLEdBQUcsQ0FBQyxHQUFXLEVBQUUsUUFBYSxFQUFFLE1BQWlCLEVBQUUsRUFBRTtRQUNqRSxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsdUNBQXVDLEVBQUUsUUFBUSxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxDQUFBO1FBQ2xILFFBQVEsQ0FBQTtJQUNWLENBQUMsQ0FBQTtJQUVEOzs7T0FHRztJQUNILE1BQU0sNEJBQTRCLEdBQUcsQ0FBQyxVQUFrQixFQUFF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cG9ydCB7IFBsYXlncm91bmRDb25maWcgfSBmcm9tICcuLydcbmltcG9ydCBsenN0cmluZyBmcm9tICcuL3ZlbmRvci9senN0cmluZy5taW4nXG5cbmNvbnN0IGdsb2JhbGlzaE9iajogYW55ID0gdHlwZW9mIGdsb2JhbFRoaXMgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsVGhpcyA6IHdpbmRvdyB8fCB7fVxuZ2xvYmFsaXNoT2JqLnR5cGVEZWZpbml0aW9ucyA9IHt9XG5cbi8qKlxuICogVHlwZSBEZWZzIHdlJ3ZlIGFscmVhZHkgZ290LCBhbmQgbnVsbHMgd2hlbiBzb21ldGhpbmcgaGFzIGZhaWxlZC5cbiAqIFRoaXMgaXMgdG8gbWFrZSBzdXJlIHRoYXQgaXQgZG9lc24ndCBpbmZpbml0ZSBsb29wLlxuICovXG5leHBvcnQgY29uc3QgYWNxdWlyZWRUeXBlRGVmczogeyBbbmFtZTogc3RyaW5nXTogc3RyaW5nIHwgbnVsbCB9ID0gZ2xvYmFsaXNoT2JqLnR5cGVEZWZpbml0aW9uc1xuXG5leHBvcnQgdHlwZSBBZGRMaWJUb1J1bnRpbWVGdW5jID0gKGNvZGU6IHN0cmluZywgcGF0aDogc3RyaW5nKSA9PiB2b2lkXG5cbmNvbnN0IG1vZHVsZUpTT05VUkwgPSAobmFtZTogc3RyaW5nKSA9PlxuICAvLyBwcmV0dGllci1pZ25vcmVcbiAgYGh0dHBzOi8vb2ZjbmNvZzJjdS1kc24uYWxnb2xpYS5uZXQvMS9pbmRleGVzL25wbS1zZWFyY2gvJHtlbmNvZGVVUklDb21wb25lbnQobmFtZSl9P2F0dHJpYnV0ZXM9dHlwZXMmeC1hbGdvbGlhLWFnZW50PUFsZ29saWElMjBmb3IlMjB2YW5pbGxhJTIwSmF2YVNjcmlwdCUyMChsaXRlKSUyMDMuMjcuMSZ4LWFsZ29saWEtYXBwbGljYXRpb24taWQ9T0ZDTkNPRzJDVSZ4LWFsZ29saWEtYXBpLWtleT1mNTRlMjFmYTNhMmEwMTYwNTk1YmIwNTgxNzliZmIxZWBcblxuY29uc3QgdW5wa2dVUkwgPSAobmFtZTogc3RyaW5nLCBwYXRoOiBzdHJpbmcpID0+XG4gIGBodHRwczovL3d3dy51bnBrZy5jb20vJHtlbmNvZGVVUklDb21wb25lbnQobmFtZSl9LyR7ZW5jb2RlVVJJQ29tcG9uZW50KHBhdGgpfWBcblxuY29uc3QgcGFja2FnZUpTT05VUkwgPSAobmFtZTogc3RyaW5nKSA9PiB1bnBrZ1VSTChuYW1lLCAncGFja2FnZS5qc29uJylcblxuY29uc3QgZXJyb3JNc2cgPSAobXNnOiBzdHJpbmcsIHJlc3BvbnNlOiBhbnksIGNvbmZpZzogQVRBQ29uZmlnKSA9PiB7XG4gIGNvbmZpZy5sb2dnZXIuZXJyb3IoYCR7bXNnfSAtIHdpbGwgbm90IHRyeSBhZ2FpbiBpbiB0aGlzIHNlc3Npb25gLCByZXNwb25zZS5zdGF0dXMsIHJlc3BvbnNlLnN0YXR1c1RleHQsIHJlc3BvbnNlKVxuICBkZWJ1Z2dlclxufVxuXG4vKipcbiAqIEdyYWIgYW55IGltcG9ydC9yZXF1aXJlcyBmcm9tIGluc2lkZSB0aGUgY29kZSBhbmQgbWFrZSBhIGxpc3Qgb2ZcbiAqIGl0cyBkZXBlbmRlbmNpZXNcbiAqL1xuY29uc3QgcGFyc2VGaWxlRm9yTW9kdWxlUmVmZXJlbmNlcyA9IChzb3VyY2VDb2RlOiBzdHJpbmcpID0+IHtcbiAgLy8gaHR0cHM6Ly9yZWdleDEwMS5jb20vci9KeGEzS1gvNFxuICBjb25zdCByZXF1aXJlUGF0dGVybiA9IC8oY29uc3R8bGV0fHZhcikoLnxcXG4pKj8gcmVxdWlyZVxcKCgnfFwiKSguKikoJ3xcIilcXCk7PyQvZ21cbiAgLy8gdGhpcyBoYW5kbGUgdGhzICdmcm9tJyBpbXBvcnRzICBodHRwczovL3JlZ2V4MTAxLmNvbS9yL2hkRXB6Ty80XG4gIGNvbnN0IGVzNlBhdHRlcm4gPSAvKGltcG9ydHxleHBvcnQpKCg/IWZyb20pKD8hcmVxdWlyZSkoLnxcXG4pKSo/KGZyb218cmVxdWlyZVxcKClcXHM/KCd8XCIpKC4qKSgnfFwiKVxcKT87PyQvZ21cbiAgLy8gaHR0cHM6Ly9yZWdleDEwMS5jb20vci9oZEVwek8vNlxuICBjb25zdCBlczZJbXBvcnRPbmx5ID0gL2ltcG9ydFxccz8oJ3xcIikoLiopKCd8XCIpXFwpPzs/L2dtXG5cbiAgY29uc3QgZm91bmRNb2R1bGVzID0gbmV3IFNldDxzdHJpbmc+KClcbiAgdmFyIG1hdGNoXG5cbiAgd2hpbGUgKChtYXRjaCA9IGVzNlBhdHRlcm4uZXhlYyhzb3VyY2VDb2RlKSkgIT09IG51bGwpIHtcbiAgICBpZiAobWF0Y2hbNl0pIGZvdW5kTW9kdWxlcy5hZGQobWF0Y2hbNl0pXG4gIH1cblxuICB3aGlsZSAoKG1hdGNoID0gcmVxdWlyZVBhdHRlcm4uZXhlYyhzb3VyY2VDb2RlKSkgIT09IG51bGwpIHtcbiAgICBpZiAobWF0Y2hbNV0pIGZvdW5kTW9kdWxlcy5hZGQobWF0Y2hbNV0pXG4gIH1cblxuICB3aGlsZSAoKG1hdGNoID0gZXM2SW1wb3J0T25seS5leGVjKHNvdXJjZUNvZGUpKSAhPT0gbnVsbCkge1xuICAgIGlmIChtYXRjaFsyXSkgZm91bmRNb2R1bGVzLmFkZChtYXRjaFsyXSlcbiAgfVxuXG4gIHJldHVybiBBcnJheS5mcm9tKGZvdW5kTW9kdWxlcylcbn1cblxuLyoqIENvbnZlcnRzIHNvbWUgb2YgdGhlIGtub3duIGdsb2JhbCBpbXBvcnRzIHRvIG5vZGUgc28gdGhhdCB3ZSBncmFiIHRoZSByaWdodCBpbmZvICovXG5jb25zdCBtYXBNb2R1bGVOYW1lVG9Nb2R1bGUgPSAobmFtZTogc3RyaW5nKSA9PiB7XG4gIC8vIGluIG5vZGUgcmVwbDpcbiAgLy8gPiByZXF1aXJlKFwibW9kdWxlXCIpLmJ1aWx0aW5Nb2R1bGVzXG4gIGNvbnN0IGJ1aWx0SW5Ob2RlTW9kcyA9IFtcbiAgICAnYXNzZXJ0JyxcbiAgICAnYXN5bmNfaG9va3MnLFxuICAgICdiYXNlJyxcbiAgICAnYnVmZmVyJyxcbiAgICAnY2hpbGRfcHJvY2VzcycsXG4gICAgJ2NsdXN0ZXInLFxuICAgICdjb25zb2xlJyxcbiAgICAnY29uc3RhbnRzJyxcbiAgICAnY3J5cHRvJyxcbiAgICAnZGdyYW0nLFxuICAgICdkbnMnLFxuICAgICdkb21haW4nLFxuICAgICdldmVudHMnLFxuICAgICdmcycsXG4gICAgJ2dsb2JhbHMnLFxuICAgICdodHRwJyxcbiAgICAnaHR0cDInLFxuICAgICdodHRwcycsXG4gICAgJ2luZGV4JyxcbiAgICAnaW5zcGVjdG9yJyxcbiAgICAnbW9kdWxlJyxcbiAgICAnbmV0JyxcbiAgICAnb3MnLFxuICAgICdwYXRoJyxcbiAgICAncGVyZl9ob29rcycsXG4gICAgJ3Byb2Nlc3MnLFxuICAgICdwdW55Y29kZScsXG4gICAgJ3F1ZXJ5c3RyaW5nJyxcbiAgICAncmVhZGxpbmUnLFxuICAgICdyZXBsJyxcbiAgICAnc3RyZWFtJyxcbiAgICAnc3RyaW5nX2RlY29kZXInLFxuICAgICd0aW1lcnMnLFxuICAgICd0bHMnLFxuICAgICd0cmFjZV9ldmVudHMnLFxuICAgICd0dHknLFxuICAgICd1cmwnLFxuICAgICd1dGlsJyxcbiAgICAndjgnLFxuICAgICd2bScsXG4gICAgJ3dvcmtlcl90aHJlYWRzJyxcbiAgICAnemxpYicsXG4gIF1cblxuICBpZiAoYnVpbHRJbk5vZGVNb2RzLmluY2x1ZGVzKG5hbWUpKSB7XG4gICAgcmV0dXJuICdub2RlJ1xuICB9XG4gIHJldHVybiBuYW1lXG59XG5cbi8vKiogQSByZWFsbHkgZHVtYiB2ZXJzaW9uIG9mIHBhdGgucmVzb2x2ZSAqL1xuY29uc3QgbWFwUmVsYXRpdmVQYXRoID0gKG1vZHVsZURlY2xhcmF0aW9uOiBzdHJpbmcsIGN1cnJlbnRQYXRoOiBzdHJpbmcpID0+IHtcbiAgLy8gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTQ3ODAzNTAvY29udmVydC1yZWxhdGl2ZS1wYXRoLXRvLWFic29sdXRlLXVzaW5nLWphdmFzY3JpcHRcbiAgZnVuY3Rpb24gYWJzb2x1dGUoYmFzZTogc3RyaW5nLCByZWxhdGl2ZTogc3RyaW5nKSB7XG4gICAgaWYgKCFiYXNlKSByZXR1cm4gcmVsYXRpdmVcblxuICAgIGNvbnN0IHN0YWNrID0gYmFzZS5zcGxpdCgnLycpXG4gICAgY29uc3QgcGFydHMgPSByZWxhdGl2ZS5zcGxpdCgnLycpXG4gICAgc3RhY2sucG9wKCkgLy8gcmVtb3ZlIGN1cnJlbnQgZmlsZSBuYW1lIChvciBlbXB0eSBzdHJpbmcpXG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhcnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAocGFydHNbaV0gPT0gJy4nKSBjb250aW51ZVxuICAgICAgaWYgKHBhcnRzW2ldID09ICcuLicpIHN0YWNrLnBvcCgpXG4gICAgICBlbHNlIHN0YWNrLnB1c2gocGFydHNbaV0pXG4gICAgfVxuICAgIHJldHVybiBzdGFjay5qb2luKCcvJylcbiAgfVxuXG4gIHJldHVybiBhYnNvbHV0ZShjdXJyZW50UGF0aCwgbW9kdWxlRGVjbGFyYXRpb24pXG59XG5cbmNvbnN0IGNvbnZlcnRUb01vZHVsZVJlZmVyZW5jZUlEID0gKG91dGVyTW9kdWxlOiBzdHJpbmcsIG1vZHVsZURlY2xhcmF0aW9uOiBzdHJpbmcsIGN1cnJlbnRQYXRoOiBzdHJpbmcpID0+IHtcbiAgY29uc3QgbW9kSXNTY29wZWRQYWNrYWdlT25seSA9IG1vZHVsZURlY2xhcmF0aW9uLmluZGV4T2YoJ0AnKSA9PT0gMCAmJiBtb2R1bGVEZWNsYXJhdGlvbi5zcGxpdCgnLycpLmxlbmd0aCA9PT0gMlxuICBjb25zdCBtb2RJc1BhY2thZ2VPbmx5ID0gbW9kdWxlRGVjbGFyYXRpb24uaW5kZXhPZignQCcpID09PSAtMSAmJiBtb2R1bGVEZWNsYXJhdGlvbi5zcGxpdCgnLycpLmxlbmd0aCA9PT0gMVxuICBjb25zdCBpc1BhY2thZ2VSb290SW1wb3J0ID0gbW9kSXNQYWNrYWdlT25seSB8fCBtb2RJc1Njb3BlZFBhY2thZ2VPbmx5XG5cbiAgaWYgKGlzUGFja2FnZVJvb3RJbXBvcnQpIHtcbiAgICByZXR1cm4gbW9kdWxlRGVjbGFyYXRpb25cbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gYCR7b3V0ZXJNb2R1bGV9LSR7bWFwUmVsYXRpdmVQYXRoKG1vZHVsZURlY2xhcmF0aW9uLCBjdXJyZW50UGF0aCl9YFxuICB9XG59XG5cbi8qKlxuICogVGFrZXMgYW4gaW5pdGlhbCBtb2R1bGUgYW5kIHRoZSBwYXRoIGZvciB0aGUgcm9vdCBvZiB0aGUgdHlwaW5ncyBhbmQgZ3JhYiBpdCBhbmQgc3RhcnQgZ3JhYmJpbmcgaXRzXG4gKiBkZXBlbmRlbmNpZXMgdGhlbiBhZGQgdGhvc2UgdGhlIHRvIHJ1bnRpbWUuXG4gKi9cbmNvbnN0IGFkZE1vZHVsZVRvUnVudGltZSA9IGFzeW5jIChtb2Q6IHN0cmluZywgcGF0aDogc3RyaW5nLCBjb25maWc6IEFUQUNvbmZpZykgPT4ge1xuICBjb25zdCBpc0Rlbm8gPSBwYXRoICYmIHBhdGguaW5kZXhPZignaHR0cHM6Ly8nKSA9PT0gMFxuXG4gIGNvbnN0IGR0c0ZpbGVVUkwgPSBpc0Rlbm8gPyBwYXRoIDogdW5wa2dVUkwobW9kLCBwYXRoKVxuXG4gIGNvbnN0IGNvbnRlbnQgPSBhd2FpdCBnZXRDYWNoZWREVFNTdHJpbmcoY29uZmlnLCBkdHNGaWxlVVJMKVxuICBpZiAoIWNvbnRlbnQpIHtcbiAgICByZXR1cm4gZXJyb3JNc2coYENvdWxkIG5vdCBnZXQgcm9vdCBkLnRzIGZpbGUgZm9yIHRoZSBtb2R1bGUgJyR7bW9kfScgYXQgJHtwYXRofWAsIHt9LCBjb25maWcpXG4gIH1cblxuICAvLyBOb3cgbG9vayBhbmQgZ3JhYiBkZXBlbmRlbnQgbW9kdWxlcyB3aGVyZSB5b3UgbmVlZCB0aGVcbiAgYXdhaXQgZ2V0RGVwZW5kZW5jaWVzRm9yTW9kdWxlKGNvbnRlbnQsIG1vZCwgcGF0aCwgY29uZmlnKVxuXG4gIGlmIChpc0Rlbm8pIHtcbiAgICBjb25zdCB3cmFwcGVkID0gYGRlY2xhcmUgbW9kdWxlIFwiJHtwYXRofVwiIHsgJHtjb250ZW50fSB9YFxuICAgIGNvbmZpZy5hZGRMaWJyYXJ5VG9SdW50aW1lKHdyYXBwZWQsIHBhdGgpXG4gIH0gZWxzZSB7XG4gICAgY29uc3QgdHlwZWxlc3NNb2R1bGUgPSBtb2Quc3BsaXQoJ0B0eXBlcy8nKS5zbGljZSgtMSlcbiAgICBjb25zdCB3cmFwcGVkID0gYGRlY2xhcmUgbW9kdWxlIFwiJHt0eXBlbGVzc01vZHVsZX1cIiB7ICR7Y29udGVudH0gfWBcbiAgICBjb25maWcuYWRkTGlicmFyeVRvUnVudGltZSh3cmFwcGVkLCBgbm9kZV9tb2R1bGVzLyR7bW9kfS8ke3BhdGh9YClcbiAgfVxufVxuXG4vKipcbiAqIFRha2VzIGEgbW9kdWxlIGltcG9ydCwgdGhlbiB1c2VzIGJvdGggdGhlIGFsZ29saWEgQVBJIGFuZCB0aGUgdGhlIHBhY2thZ2UuanNvbiB0byBkZXJpdmVcbiAqIHRoZSByb290IHR5cGUgZGVmIHBhdGguXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHBhY2thZ2VOYW1lXG4gKiBAcmV0dXJucyB7UHJvbWlzZTx7IG1vZDogc3RyaW5nLCBwYXRoOiBzdHJpbmcsIHBhY2thZ2VKU09OOiBhbnkgfT59XG4gKi9cbmNvbnN0IGdldE1vZHVsZUFuZFJvb3REZWZUeXBlUGF0aCA9IGFzeW5jIChwYWNrYWdlTmFtZTogc3RyaW5nLCBjb25maWc6IEFUQUNvbmZpZykgPT4ge1xuICBjb25zdCB1cmwgPSBtb2R1bGVKU09OVVJMKHBhY2thZ2VOYW1lKVxuXG4gIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgY29uZmlnLmZldGNoZXIodXJsKVxuICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgcmV0dXJuIGVycm9yTXNnKGBDb3VsZCBub3QgZ2V0IEFsZ29saWEgSlNPTiBmb3IgdGhlIG1vZHVsZSAnJHtwYWNrYWdlTmFtZX0nYCwgcmVzcG9uc2UsIGNvbmZpZylcbiAgfVxuXG4gIGNvbnN0IHJlc3BvbnNlSlNPTiA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKVxuICBpZiAoIXJlc3BvbnNlSlNPTikge1xuICAgIHJldHVybiBlcnJvck1zZyhgQ291bGQgdGhlIEFsZ29saWEgSlNPTiB3YXMgdW4tcGFyc2FibGUgZm9yIHRoZSBtb2R1bGUgJyR7cGFja2FnZU5hbWV9J2AsIHJlc3BvbnNlLCBjb25maWcpXG4gIH1cblxuICBpZiAoIXJlc3BvbnNlSlNPTi50eXBlcykge1xuICAgIHJldHVybiBjb25maWcubG9nZ2VyLmxvZyhgVGhlcmUgd2VyZSBubyB0eXBlcyBmb3IgJyR7cGFja2FnZU5hbWV9JyAtIHdpbGwgbm90IHRyeSBhZ2FpbiBpbiB0aGlzIHNlc3Npb25gKVxuICB9XG4gIGlmICghcmVzcG9uc2VKU09OLnR5cGVzLnRzKSB7XG4gICAgcmV0dXJuIGNvbmZpZy5sb2dnZXIubG9nKGBUaGVyZSB3ZXJlIG5vIHR5cGVzIGZvciAnJHtwYWNrYWdlTmFtZX0nIC0gd2lsbCBub3QgdHJ5IGFnYWluIGluIHRoaXMgc2Vzc2lvbmApXG4gIH1cblxuICBhY3F1aXJlZFR5cGVEZWZzW3BhY2thZ2VOYW1lXSA9IHJlc3BvbnNlSlNPTlxuXG4gIGlmIChyZXNwb25zZUpTT04udHlwZXMudHMgPT09ICdpbmNsdWRlZCcpIHtcbiAgICBjb25zdCBtb2RQYWNrYWdlVVJMID0gcGFja2FnZUpTT05VUkwocGFja2FnZU5hbWUpXG5cbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGNvbmZpZy5mZXRjaGVyKG1vZFBhY2thZ2VVUkwpXG4gICAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgICAgcmV0dXJuIGVycm9yTXNnKGBDb3VsZCBub3QgZ2V0IFBhY2thZ2UgSlNPTiBmb3IgdGhlIG1vZHVsZSAnJHtwYWNrYWdlTmFtZX0nYCwgcmVzcG9uc2UsIGNvbmZpZylcbiAgICB9XG5cbiAgICBjb25zdCByZXNwb25zZUpTT04gPSBhd2FpdCByZXNwb25zZS5qc29uKClcbiAgICBpZiAoIXJlc3BvbnNlSlNPTikge1xuICAgICAgcmV0dXJuIGVycm9yTXNnKGBDb3VsZCBub3QgZ2V0IFBhY2thZ2UgSlNPTiBmb3IgdGhlIG1vZHVsZSAnJHtwYWNrYWdlTmFtZX0nYCwgcmVzcG9uc2UsIGNvbmZpZylcbiAgICB9XG5cbiAgICBjb25maWcuYWRkTGlicmFyeVRvUnVudGltZShKU09OLnN0cmluZ2lmeShyZXNwb25zZUpTT04sIG51bGwsICcgICcpLCBgbm9kZV9tb2R1bGVzLyR7cGFja2FnZU5hbWV9L3BhY2thZ2UuanNvbmApXG5cbiAgICAvLyBHZXQgdGhlIHBhdGggb2YgdGhlIHJvb3QgZC50cyBmaWxlXG5cbiAgICAvLyBub24taW5mZXJyZWQgcm91dGVcbiAgICBsZXQgcm9vdFR5cGVQYXRoID0gcmVzcG9uc2VKU09OLnR5cGluZyB8fCByZXNwb25zZUpTT04udHlwaW5ncyB8fCByZXNwb25zZUpTT04udHlwZXNcblxuICAgIC8vIHBhY2thZ2UgbWFpbiBpcyBjdXN0b21cbiAgICBpZiAoIXJvb3RUeXBlUGF0aCAmJiB0eXBlb2YgcmVzcG9uc2VKU09OLm1haW4gPT09ICdzdHJpbmcnICYmIHJlc3BvbnNlSlNPTi5tYWluLmluZGV4T2YoJy5qcycpID4gMCkge1xuICAgICAgcm9vdFR5cGVQYXRoID0gcmVzcG9uc2VKU09OLm1haW4ucmVwbGFjZSgvanMkLywgJ2QudHMnKVxuICAgIH1cblxuICAgIC8vIEZpbmFsIGZhbGxiYWNrLCB0byBoYXZlIGdvdCBoZXJlIGl0IG11c3QgaGF2ZSBwYXNzZWQgaW4gYWxnb2xpYVxuICAgIGlmICghcm9vdFR5cGVQYXRoKSB7XG4gICAgICByb290VHlwZVBhdGggPSAnaW5kZXguZC50cydcbiAgICB9XG5cbiAgICByZXR1cm4geyBtb2Q6IHBhY2thZ2VOYW1lLCBwYXRoOiByb290VHlwZVBhdGgsIHBhY2thZ2VKU09OOiByZXNwb25zZUpTT04gfVxuICB9IGVsc2UgaWYgKHJlc3BvbnNlSlNPTi50eXBlcy50cyA9PT0gJ2RlZmluaXRlbHktdHlwZWQnKSB7XG4gICAgcmV0dXJuIHsgbW9kOiByZXNwb25zZUpTT04udHlwZXMuZGVmaW5pdGVseVR5cGVkLCBwYXRoOiAnaW5kZXguZC50cycsIHBhY2thZ2VKU09OOiByZXNwb25zZUpTT04gfVxuICB9IGVsc2Uge1xuICAgIHRocm93IFwiVGhpcyBzaG91bGRuJ3QgaGFwcGVuXCJcbiAgfVxufVxuXG5jb25zdCBnZXRDYWNoZWREVFNTdHJpbmcgPSBhc3luYyAoY29uZmlnOiBBVEFDb25maWcsIHVybDogc3RyaW5nKSA9PiB7XG4gIGNvbnN0IGNhY2hlZCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKHVybClcbiAgaWYgKGNhY2hlZCkge1xuICAgIGNvbnN0IFtkYXRlU3RyaW5nLCB0ZXh0XSA9IGNhY2hlZC5zcGxpdCgnLT0tXi09LScpXG4gICAgY29uc3QgY2FjaGVkRGF0ZSA9IG5ldyBEYXRlKGRhdGVTdHJpbmcpXG4gICAgY29uc3Qgbm93ID0gbmV3IERhdGUoKVxuXG4gICAgY29uc3QgY2FjaGVUaW1lb3V0ID0gNjA0ODAwMDAwIC8vIDEgd2Vla1xuICAgIC8vIGNvbnN0IGNhY2hlVGltZW91dCA9IDYwMDAwIC8vIDEgbWluXG5cbiAgICBpZiAobm93LmdldFRpbWUoKSAtIGNhY2hlZERhdGUuZ2V0VGltZSgpIDwgY2FjaGVUaW1lb3V0KSB7XG4gICAgICByZXR1cm4gbHpzdHJpbmcuZGVjb21wcmVzc0Zyb21VVEYxNih0ZXh0KVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25maWcubG9nZ2VyLmxvZygnU2tpcHBpbmcgY2FjaGUgZm9yICcsIHVybClcbiAgICB9XG4gIH1cblxuICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGNvbmZpZy5mZXRjaGVyKHVybClcbiAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgIHJldHVybiBlcnJvck1zZyhgQ291bGQgbm90IGdldCBEVFMgcmVzcG9uc2UgZm9yIHRoZSBtb2R1bGUgYXQgJHt1cmx9YCwgcmVzcG9uc2UsIGNvbmZpZylcbiAgfVxuXG4gIC8vIFRPRE86IGhhbmRsZSBjaGVja2luZyBmb3IgYSByZXNvbHZlIHRvIGluZGV4LmQudHMgd2hlbnMgc29tZW9uZSBpbXBvcnRzIHRoZSBmb2xkZXJcbiAgbGV0IGNvbnRlbnQgPSBhd2FpdCByZXNwb25zZS50ZXh0KClcbiAgaWYgKCFjb250ZW50KSB7XG4gICAgcmV0dXJuIGVycm9yTXNnKGBDb3VsZCBub3QgZ2V0IHRleHQgZm9yIERUUyByZXNwb25zZSBhdCAke3VybH1gLCByZXNwb25zZSwgY29uZmlnKVxuICB9XG5cbiAgY29uc3Qgbm93ID0gbmV3IERhdGUoKVxuICBjb25zdCBjYWNoZUNvbnRlbnQgPSBgJHtub3cudG9JU09TdHJpbmcoKX0tPS1eLT0tJHtsenN0cmluZy5jb21wcmVzc1RvVVRGMTYoY29udGVudCl9YFxuICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSh1cmwsIGNhY2hlQ29udGVudClcbiAgcmV0dXJuIGNvbnRlbnRcbn1cblxuY29uc3QgZ2V0UmVmZXJlbmNlRGVwZW5kZW5jaWVzID0gYXN5bmMgKHNvdXJjZUNvZGU6IHN0cmluZywgbW9kOiBzdHJpbmcsIHBhdGg6IHN0cmluZywgY29uZmlnOiBBVEFDb25maWcpID0+IHtcbiAgdmFyIG1hdGNoXG4gIGlmIChzb3VyY2VDb2RlLmluZGV4T2YoJ3JlZmVyZW5jZSBwYXRoJykgPiAwKSB7XG4gICAgLy8gaHR0cHM6Ly9yZWdleDEwMS5jb20vci9EYU9lZ3cvMVxuICAgIGNvbnN0IHJlZmVyZW5jZVBhdGhFeHRyYWN0aW9uUGF0dGVybiA9IC88cmVmZXJlbmNlIHBhdGg9XCIoLiopXCIgXFwvPi9nbVxuICAgIHdoaWxlICgobWF0Y2ggPSByZWZlcmVuY2VQYXRoRXh0cmFjdGlvblBhdHRlcm4uZXhlYyhzb3VyY2VDb2RlKSkgIT09IG51bGwpIHtcbiAgICAgIGNvbnN0IHJlbGF0aXZlUGF0aCA9IG1hdGNoWzFdXG4gICAgICBpZiAocmVsYXRpdmVQYXRoKSB7XG4gICAgICAgIGxldCBuZXdQYXRoID0gbWFwUmVsYXRpdmVQYXRoKHJlbGF0aXZlUGF0aCwgcGF0aClcbiAgICAgICAgaWYgKG5ld1BhdGgpIHtcbiAgICAgICAgICBjb25zdCBkdHNSZWZVUkwgPSB1bnBrZ1VSTChtb2QsIG5ld1BhdGgpXG5cbiAgICAgICAgICBjb25zdCBkdHNSZWZlcmVuY2VSZXNwb25zZVRleHQgPSBhd2FpdCBnZXRDYWNoZWREVFNTdHJpbmcoY29uZmlnLCBkdHNSZWZVUkwpXG4gICAgICAgICAgaWYgKCFkdHNSZWZlcmVuY2VSZXNwb25zZVRleHQpIHtcbiAgICAgICAgICAgIHJldHVybiBlcnJvck1zZyhgQ291bGQgbm90IGdldCByb290IGQudHMgZmlsZSBmb3IgdGhlIG1vZHVsZSAnJHttb2R9JyBhdCAke3BhdGh9YCwge30sIGNvbmZpZylcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBhd2FpdCBnZXREZXBlbmRlbmNpZXNGb3JNb2R1bGUoZHRzUmVmZXJlbmNlUmVzcG9uc2VUZXh0LCBtb2QsIG5ld1BhdGgsIGNvbmZpZylcbiAgICAgICAgICBjb25zdCByZXByZXNlbnRhdGlvbmFsUGF0aCA9IGBub2RlX21vZHVsZXMvJHttb2R9LyR7bmV3UGF0aH1gXG4gICAgICAgICAgY29uZmlnLmFkZExpYnJhcnlUb1J1bnRpbWUoZHRzUmVmZXJlbmNlUmVzcG9uc2VUZXh0LCByZXByZXNlbnRhdGlvbmFsUGF0aClcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5pbnRlcmZhY2UgQVRBQ29uZmlnIHtcbiAgc291cmNlQ29kZTogc3RyaW5nXG4gIGFkZExpYnJhcnlUb1J1bnRpbWU6IEFkZExpYlRvUnVudGltZUZ1bmNcbiAgZmV0Y2hlcjogdHlwZW9mIGZldGNoXG4gIGxvZ2dlcjogUGxheWdyb3VuZENvbmZpZ1snbG9nZ2VyJ11cbn1cblxuLyoqXG4gKiBQc2V1ZG8gaW4tYnJvd3NlciB0eXBlIGFjcXVpc2l0aW9uIHRvb2wsIHVzZXMgYVxuICovXG5leHBvcnQgY29uc3QgZGV0ZWN0TmV3SW1wb3J0c1RvQWNxdWlyZVR5cGVGb3IgPSBhc3luYyAoXG4gIHNvdXJjZUNvZGU6IHN0cmluZyxcbiAgdXNlckFkZExpYnJhcnlUb1J1bnRpbWU6IEFkZExpYlRvUnVudGltZUZ1bmMsXG4gIGZldGNoZXIgPSBmZXRjaCxcbiAgcGxheWdyb3VuZENvbmZpZzogUGxheWdyb3VuZENvbmZpZ1xuKSA9PiB7XG4gIC8vIFdyYXAgdGhlIHJ1bnRpbWUgZnVuYyB3aXRoIG91ciBvd24gc2lkZS1lZmZlY3QgZm9yIHZpc2liaWxpdHlcbiAgY29uc3QgYWRkTGlicmFyeVRvUnVudGltZSA9IChjb2RlOiBzdHJpbmcsIHBhdGg6IHN0cmluZykgPT4ge1xuICAgIGdsb2JhbGlzaE9iai50eXBlRGVmaW5pdGlvbnNbcGF0aF0gPSBjb2RlXG4gICAgdXNlckFkZExpYnJhcnlUb1J1bnRpbWUoY29kZSwgcGF0aClcbiAgfVxuXG4gIC8vIEJhc2ljYWxseSBzdGFydCB0aGUgcmVjdXJzaW9uIHdpdGggYW4gdW5kZWZpbmVkIG1vZHVsZVxuICBjb25zdCBjb25maWc6IEFUQUNvbmZpZyA9IHsgc291cmNlQ29kZSwgYWRkTGlicmFyeVRvUnVudGltZSwgZmV0Y2hlciwgbG9nZ2VyOiBwbGF5Z3JvdW5kQ29uZmlnLmxvZ2dlciB9XG4gIGNvbnN0IHJlc3VsdHMgPSBnZXREZXBlbmRlbmNpZXNGb3JNb2R1bGUoc291cmNlQ29kZSwgdW5kZWZpbmVkLCAncGxheWdyb3VuZC50cycsIGNvbmZpZylcbiAgcmV0dXJuIHJlc3VsdHNcbn1cblxuLyoqXG4gKiBMb29rcyBhdCBhIEpTL0RUUyBmaWxlIGFuZCByZWN1cnNlcyB0aHJvdWdoIGFsbCB0aGUgZGVwZW5kZW5jaWVzLlxuICogSXQgYXZvaWRzXG4gKi9cbmNvbnN0IGdldERlcGVuZGVuY2llc0Zvck1vZHVsZSA9IChcbiAgc291cmNlQ29kZTogc3RyaW5nLFxuICBtb2R1bGVOYW1lOiBzdHJpbmcgfCB1bmRlZmluZWQsXG4gIHBhdGg6IHN0cmluZyxcbiAgY29uZmlnOiBBVEFDb25maWdcbikgPT4ge1xuICAvLyBHZXQgYWxsIHRoZSBpbXBvcnQvcmVxdWlyZXMgZm9yIHRoZSBmaWxlXG4gIGNvbnN0IGZpbHRlcmVkTW9kdWxlc1RvTG9va0F0ID0gcGFyc2VGaWxlRm9yTW9kdWxlUmVmZXJlbmNlcyhzb3VyY2VDb2RlKVxuICBmaWx0ZXJlZE1vZHVsZXNUb0xvb2tBdC5mb3JFYWNoKGFzeW5jIG5hbWUgPT4ge1xuICAgIC8vIFN1cHBvcnQgZ3JhYmJpbmcgdGhlIGhhcmQtY29kZWQgbm9kZSBtb2R1bGVzIGlmIG5lZWRlZFxuICAgIGNvbnN0IG1vZHVsZVRvRG93bmxvYWQgPSBtYXBNb2R1bGVOYW1lVG9Nb2R1bGUobmFtZSlcblxuICAgIGlmICghbW9kdWxlTmFtZSAmJiBtb2R1bGVUb0Rvd25sb2FkLnN0YXJ0c1dpdGgoJy4nKSkge1xuICAgICAgcmV0dXJuIGNvbmZpZy5sb2dnZXIubG9nKFwiW0FUQV0gQ2FuJ3QgcmVzb2x2ZSByZWxhdGl2ZSBkZXBlbmRlbmNpZXMgZnJvbSB0aGUgcGxheWdyb3VuZCByb290XCIpXG4gICAgfVxuXG4gICAgY29uc3QgbW9kdWxlSUQgPSBjb252ZXJ0VG9Nb2R1bGVSZWZlcmVuY2VJRChtb2R1bGVOYW1lISwgbW9kdWxlVG9Eb3dubG9hZCwgbW9kdWxlTmFtZSEpXG4gICAgaWYgKGFjcXVpcmVkVHlwZURlZnNbbW9kdWxlSURdIHx8IGFjcXVpcmVkVHlwZURlZnNbbW9kdWxlSURdID09PSBudWxsKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb25maWcubG9nZ2VyLmxvZyhgW0FUQV0gTG9va2luZyBhdCAke21vZHVsZVRvRG93bmxvYWR9YClcblxuICAgIGNvbnN0IG1vZElzU2NvcGVkUGFja2FnZU9ubHkgPSBtb2R1bGVUb0Rvd25sb2FkLmluZGV4T2YoJ0AnKSA9PT0gMCAmJiBtb2R1bGVUb0Rvd25sb2FkLnNwbGl0KCcvJykubGVuZ3RoID09PSAyXG4gICAgY29uc3QgbW9kSXNQYWNrYWdlT25seSA9IG1vZHVsZVRvRG93bmxvYWQuaW5kZXhPZignQCcpID09PSAtMSAmJiBtb2R1bGVUb0Rvd25sb2FkLnNwbGl0KCcvJykubGVuZ3RoID09PSAxXG4gICAgY29uc3QgaXNQYWNrYWdlUm9vdEltcG9ydCA9IG1vZElzUGFja2FnZU9ubHkgfHwgbW9kSXNTY29wZWRQYWNrYWdlT25seVxuICAgIGNvbnN0IGlzRGVub01vZHVsZSA9IG1vZHVsZVRvRG93bmxvYWQuaW5kZXhPZignaHR0cHM6Ly8nKSA9PT0gMFxuXG4gICAgaWYgKGlzUGFja2FnZVJvb3RJbXBvcnQpIHtcbiAgICAgIC8vIFNvIGl0IGRvZXNuJ3QgcnVuIHR3aWNlIGZvciBhIHBhY2thZ2VcbiAgICAgIGFjcXVpcmVkVHlwZURlZnNbbW9kdWxlSURdID0gbnVsbFxuXG4gICAgICAvLyBFLmcuIGltcG9ydCBkYW5nZXIgZnJvbSBcImRhbmdlclwiXG4gICAgICBjb25zdCBwYWNrYWdlRGVmID0gYXdhaXQgZ2V0TW9kdWxlQW5kUm9vdERlZlR5cGVQYXRoKG1vZHVsZVRvRG93bmxvYWQsIGNvbmZpZylcblxuICAgICAgaWYgKHBhY2thZ2VEZWYpIHtcbiAgICAgICAgYWNxdWlyZWRUeXBlRGVmc1ttb2R1bGVJRF0gPSBwYWNrYWdlRGVmLnBhY2thZ2VKU09OXG4gICAgICAgIGF3YWl0IGFkZE1vZHVsZVRvUnVudGltZShwYWNrYWdlRGVmLm1vZCwgcGFja2FnZURlZi5wYXRoLCBjb25maWcpXG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChpc0Rlbm9Nb2R1bGUpIHtcbiAgICAgIC8vIEUuZy4gaW1wb3J0IHsgc2VydmUgfSBmcm9tIFwiaHR0cHM6Ly9kZW5vLmxhbmQvc3RkQHYwLjEyL2h0dHAvc2VydmVyLnRzXCI7XG4gICAgICBhd2FpdCBhZGRNb2R1bGVUb1J1bnRpbWUobW9kdWxlVG9Eb3dubG9hZCwgbW9kdWxlVG9Eb3dubG9hZCwgY29uZmlnKVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBFLmcuIGltcG9ydCB7Q29tcG9uZW50fSBmcm9tIFwiLi9NeVRoaW5nXCJcbiAgICAgIGlmICghbW9kdWxlVG9Eb3dubG9hZCB8fCAhcGF0aCkgdGhyb3cgYE5vIG91dGVyIG1vZHVsZSBvciBwYXRoIGZvciBhIHJlbGF0aXZlIGltcG9ydDogJHttb2R1bGVUb0Rvd25sb2FkfWBcblxuICAgICAgY29uc3QgYWJzb2x1dGVQYXRoRm9yTW9kdWxlID0gbWFwUmVsYXRpdmVQYXRoKG1vZHVsZVRvRG93bmxvYWQsIHBhdGgpXG5cbiAgICAgIC8vIFNvIGl0IGRvZXNuJ3QgcnVuIHR3aWNlIGZvciBhIHBhY2thZ2VcbiAgICAgIGFjcXVpcmVkVHlwZURlZnNbbW9kdWxlSURdID0gbnVsbFxuXG4gICAgICBjb25zdCByZXNvbHZlZEZpbGVwYXRoID0gYWJzb2x1dGVQYXRoRm9yTW9kdWxlLmVuZHNXaXRoKCcudHMnKVxuICAgICAgICA/IGFic29sdXRlUGF0aEZvck1vZHVsZVxuICAgICAgICA6IGFic29sdXRlUGF0aEZvck1vZHVsZSArICcuZC50cydcblxuICAgICAgYXdhaXQgYWRkTW9kdWxlVG9SdW50aW1lKG1vZHVsZU5hbWUhLCByZXNvbHZlZEZpbGVwYXRoLCBjb25maWcpXG4gICAgfVxuICB9KVxuXG4gIC8vIEFsc28gc3VwcG9ydCB0aGVcbiAgZ2V0UmVmZXJlbmNlRGVwZW5kZW5jaWVzKHNvdXJjZUNvZGUsIG1vZHVsZU5hbWUhLCBwYXRoISwgY29uZmlnKVxufVxuIl19