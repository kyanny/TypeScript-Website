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
    exports.getExampleSourceCode = (prefix, lang, exampleID) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const site = `${document.location.protocol}//${document.location.host}${prefix}`;
            const examplesTOCHref = `${site}/js/examples/${lang}.json`;
            const res = yield fetch(examplesTOCHref);
            if (!res.ok) {
                console.error('Could not fetch example TOC for lang: ' + lang);
                return {};
            }
            const toc = yield res.json();
            const example = toc.examples.find((e) => e.id === exampleID);
            if (!example) {
                // prettier-ignore
                console.error(`Could not find example with id: ${exampleID} in\n// ${document.location.protocol}//${document.location.host}${examplesTOCHref}`);
                return {};
            }
            const exampleCodePath = `${site}/js/examples/${example.lang}/${example.path.join('/')}/${example.name}`;
            const codeRes = yield fetch(exampleCodePath);
            let code = yield codeRes.text();
            // Handle removing the compiler settings stuff
            if (code.startsWith('//// {')) {
                code = code
                    .split('\n')
                    .slice(1)
                    .join('\n')
                    .trim();
            }
            // @ts-ignore
            window.appInsights.trackEvent({ name: 'Read Playground Example', properties: { id: exampleID, lang } });
            return {
                example,
                code,
            };
        }
        catch (e) {
            console.log(e);
            return {};
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0RXhhbXBsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BsYXlncm91bmQvc3JjL2dldEV4YW1wbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBQWEsUUFBQSxvQkFBb0IsR0FBRyxDQUFPLE1BQWMsRUFBRSxJQUFZLEVBQUUsU0FBaUIsRUFBRSxFQUFFO1FBQzVGLElBQUk7WUFDRixNQUFNLElBQUksR0FBRyxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsUUFBUSxLQUFLLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLE1BQU0sRUFBRSxDQUFBO1lBQ2hGLE1BQU0sZUFBZSxHQUFHLEdBQUcsSUFBSSxnQkFBZ0IsSUFBSSxPQUFPLENBQUE7WUFDMUQsTUFBTSxHQUFHLEdBQUcsTUFBTSxLQUFLLENBQUMsZUFBZSxDQUFDLENBQUE7WUFDeEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUU7Z0JBQ1gsT0FBTyxDQUFDLEtBQUssQ0FBQyx3Q0FBd0MsR0FBRyxJQUFJLENBQUMsQ0FBQTtnQkFDOUQsT0FBTyxFQUFFLENBQUE7YUFDVjtZQUVELE1BQU0sR0FBRyxHQUFHLE1BQU0sR0FBRyxDQUFDLElBQUksRUFBRSxDQUFBO1lBQzVCLE1BQU0sT0FBTyxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLFNBQVMsQ0FBQyxDQUFBO1lBQ2pFLElBQUksQ0FBQyxPQUFPLEVBQUU7Z0JBQ1osa0JBQWtCO2dCQUNsQixPQUFPLENBQUMsS0FBSyxDQUFDLG1DQUFtQyxTQUFTLFdBQVcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEtBQUssUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsZUFBZSxFQUFFLENBQUMsQ0FBQTtnQkFDL0ksT0FBTyxFQUFFLENBQUE7YUFDVjtZQUVELE1BQU0sZUFBZSxHQUFHLEdBQUcsSUFBSSxnQkFBZ0IsT0FBTyxDQUFDLElBQUksSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUE7WUFDdkcsTUFBTSxPQUFPLEdBQUcsTUFBTSxLQUFLLENBQUMsZUFBZSxDQUFDLENBQUE7WUFDNUMsSUFBSSxJQUFJLEdBQUcsTUFBTSxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUE7WUFFL0IsOENBQThDO1lBQzlDLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsRUFBRTtnQkFDN0IsSUFBSSxHQUFHLElBQUk7cUJBQ1IsS0FBSyxDQUFDLElBQUksQ0FBQztxQkFDWCxLQUFLLENBQUMsQ0FBQyxDQUFDO3FCQUNSLElBQUksQ0FBQyxJQUFJLENBQUM7cUJBQ1YsSUFBSSxFQUFFLENBQUE7YUFDVjtZQUVELGFBQWE7WUFDYixNQUFNLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxFQUFFLElBQUksRUFBRSx5QkFBeUIsRUFBRSxVQUFVLEVBQUUsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQTtZQUV2RyxPQUFPO2dCQUNMLE9BQU87Z0JBQ1AsSUFBSTthQUNMLENBQUE7U0FDRjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNkLE9BQU8sRUFBRSxDQUFBO1NBQ1Y7SUFDSCxDQUFDLENBQUEsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjb25zdCBnZXRFeGFtcGxlU291cmNlQ29kZSA9IGFzeW5jIChwcmVmaXg6IHN0cmluZywgbGFuZzogc3RyaW5nLCBleGFtcGxlSUQ6IHN0cmluZykgPT4ge1xuICB0cnkge1xuICAgIGNvbnN0IHNpdGUgPSBgJHtkb2N1bWVudC5sb2NhdGlvbi5wcm90b2NvbH0vLyR7ZG9jdW1lbnQubG9jYXRpb24uaG9zdH0ke3ByZWZpeH1gXG4gICAgY29uc3QgZXhhbXBsZXNUT0NIcmVmID0gYCR7c2l0ZX0vanMvZXhhbXBsZXMvJHtsYW5nfS5qc29uYFxuICAgIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKGV4YW1wbGVzVE9DSHJlZilcbiAgICBpZiAoIXJlcy5vaykge1xuICAgICAgY29uc29sZS5lcnJvcignQ291bGQgbm90IGZldGNoIGV4YW1wbGUgVE9DIGZvciBsYW5nOiAnICsgbGFuZylcbiAgICAgIHJldHVybiB7fVxuICAgIH1cblxuICAgIGNvbnN0IHRvYyA9IGF3YWl0IHJlcy5qc29uKClcbiAgICBjb25zdCBleGFtcGxlID0gdG9jLmV4YW1wbGVzLmZpbmQoKGU6IGFueSkgPT4gZS5pZCA9PT0gZXhhbXBsZUlEKVxuICAgIGlmICghZXhhbXBsZSkge1xuICAgICAgLy8gcHJldHRpZXItaWdub3JlXG4gICAgICBjb25zb2xlLmVycm9yKGBDb3VsZCBub3QgZmluZCBleGFtcGxlIHdpdGggaWQ6ICR7ZXhhbXBsZUlEfSBpblxcbi8vICR7ZG9jdW1lbnQubG9jYXRpb24ucHJvdG9jb2x9Ly8ke2RvY3VtZW50LmxvY2F0aW9uLmhvc3R9JHtleGFtcGxlc1RPQ0hyZWZ9YClcbiAgICAgIHJldHVybiB7fVxuICAgIH1cblxuICAgIGNvbnN0IGV4YW1wbGVDb2RlUGF0aCA9IGAke3NpdGV9L2pzL2V4YW1wbGVzLyR7ZXhhbXBsZS5sYW5nfS8ke2V4YW1wbGUucGF0aC5qb2luKCcvJyl9LyR7ZXhhbXBsZS5uYW1lfWBcbiAgICBjb25zdCBjb2RlUmVzID0gYXdhaXQgZmV0Y2goZXhhbXBsZUNvZGVQYXRoKVxuICAgIGxldCBjb2RlID0gYXdhaXQgY29kZVJlcy50ZXh0KClcblxuICAgIC8vIEhhbmRsZSByZW1vdmluZyB0aGUgY29tcGlsZXIgc2V0dGluZ3Mgc3R1ZmZcbiAgICBpZiAoY29kZS5zdGFydHNXaXRoKCcvLy8vIHsnKSkge1xuICAgICAgY29kZSA9IGNvZGVcbiAgICAgICAgLnNwbGl0KCdcXG4nKVxuICAgICAgICAuc2xpY2UoMSlcbiAgICAgICAgLmpvaW4oJ1xcbicpXG4gICAgICAgIC50cmltKClcbiAgICB9XG5cbiAgICAvLyBAdHMtaWdub3JlXG4gICAgd2luZG93LmFwcEluc2lnaHRzLnRyYWNrRXZlbnQoeyBuYW1lOiAnUmVhZCBQbGF5Z3JvdW5kIEV4YW1wbGUnLCBwcm9wZXJ0aWVzOiB7IGlkOiBleGFtcGxlSUQsIGxhbmcgfSB9KVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGV4YW1wbGUsXG4gICAgICBjb2RlLFxuICAgIH1cbiAgfSBjYXRjaCAoZSkge1xuICAgIGNvbnNvbGUubG9nKGUpXG4gICAgcmV0dXJuIHt9XG4gIH1cbn1cbiJdfQ==