define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /** Creates a set of util functions which is exposed to Plugins to make it easier to build consistent UIs */
    exports.createUtils = (sb, react) => {
        const sandbox = sb;
        const ts = sandbox.ts;
        const requireURL = (path) => {
            // https://unpkg.com/browse/typescript-playground-presentation-mode@0.0.1/dist/x.js => unpkg/browse/typescript-playground-presentation-mode@0.0.1/dist/x
            const isDev = document.location.host.includes('localhost');
            const prefix = isDev ? 'local/' : 'unpkg/typescript-playground-presentation-mode/dist/';
            return prefix + path;
        };
        const el = (str, el, container) => {
            const para = document.createElement(el);
            para.innerHTML = str;
            container.appendChild(para);
        };
        const createASTTree = (node) => {
            const div = document.createElement('div');
            div.className = "ast";
            const infoForNode = (node) => {
                const name = ts.SyntaxKind[node.kind];
                return {
                    name,
                };
            };
            const renderLiteralField = (key, value) => {
                const li = document.createElement('li');
                li.innerHTML = `${key}: ${value}`;
                return li;
            };
            const renderSingleChild = (key, value) => {
                const li = document.createElement('li');
                li.innerHTML = `${key}: <strong>${ts.SyntaxKind[value.kind]}</strong>`;
                return li;
            };
            const renderManyChildren = (key, value) => {
                const li = document.createElement('li');
                const nodes = value.map(n => "<strong>&nbsp;&nbsp;" + ts.SyntaxKind[n.kind] + "<strong>").join("<br/>");
                li.innerHTML = `${key}: [<br/>${nodes}</br>]`;
                return li;
            };
            const renderItem = (parentElement, node) => {
                const ul = document.createElement('ul');
                parentElement.appendChild(ul);
                ul.className = 'ast-tree';
                const info = infoForNode(node);
                const li = document.createElement('li');
                ul.appendChild(li);
                const a = document.createElement('a');
                a.textContent = info.name;
                li.appendChild(a);
                const properties = document.createElement('ul');
                properties.className = 'ast-tree';
                li.appendChild(properties);
                Object.keys(node).forEach(field => {
                    if (typeof field === "function")
                        return;
                    if (field === "parent" || field === "flowNode")
                        return;
                    const value = node[field];
                    if (typeof value === "object" && Array.isArray(value) && "pos" in value[0] && "end" in value[0]) {
                        //  Is an array of Nodes
                        properties.appendChild(renderManyChildren(field, value));
                    }
                    else if (typeof value === "object" && "pos" in value && "end" in value) {
                        // Is a single child property
                        properties.appendChild(renderSingleChild(field, value));
                    }
                    else {
                        properties.appendChild(renderLiteralField(field, value));
                    }
                });
            };
            renderItem(div, node);
            return div;
        };
        return {
            /** Use this to make a few dumb element generation funcs */
            el,
            /** Get a relative URL for something in your dist folder depending on if you're in dev mode or not */
            requireURL,
            /** Returns a div which has an interactive AST a TypeScript AST by passing in the root node */
            createASTTree,
            /** The Gatsby copy of React */
            react
        };
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGx1Z2luVXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wbGF5Z3JvdW5kL3NyYy9wbHVnaW5VdGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFJQSw0R0FBNEc7SUFDL0YsUUFBQSxXQUFXLEdBQUcsQ0FBQyxFQUFPLEVBQUUsS0FBbUIsRUFBRSxFQUFFO1FBQzFELE1BQU0sT0FBTyxHQUFZLEVBQUUsQ0FBQTtRQUMzQixNQUFNLEVBQUUsR0FBRyxPQUFPLENBQUMsRUFBRSxDQUFBO1FBRXJCLE1BQU0sVUFBVSxHQUFHLENBQUMsSUFBWSxFQUFFLEVBQUU7WUFDbEMsd0pBQXdKO1lBQ3hKLE1BQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQTtZQUMxRCxNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMscURBQXFELENBQUE7WUFDdkYsT0FBTyxNQUFNLEdBQUcsSUFBSSxDQUFBO1FBQ3RCLENBQUMsQ0FBQTtRQUVELE1BQU0sRUFBRSxHQUFHLENBQUMsR0FBVyxFQUFFLEVBQVUsRUFBRSxTQUFrQixFQUFFLEVBQUU7WUFDekQsTUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUMsQ0FBQTtZQUN2QyxJQUFJLENBQUMsU0FBUyxHQUFHLEdBQUcsQ0FBQTtZQUNwQixTQUFTLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFBO1FBQzdCLENBQUMsQ0FBQTtRQUVELE1BQU0sYUFBYSxHQUFHLENBQUMsSUFBVSxFQUFFLEVBQUU7WUFDbkMsTUFBTSxHQUFHLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQTtZQUN6QyxHQUFHLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQTtZQUVyQixNQUFNLFdBQVcsR0FBRyxDQUFDLElBQVUsRUFBRSxF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T0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLEtBQUssSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRTt3QkFDL0Ysd0JBQXdCO3dCQUN4QixVQUFVLENBQUMsV0FBVyxDQUFDLGtCQUFrQixDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFBO3FCQUN6RDt5QkFBTSxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLEVBQUU7d0JBQ3hFLDZCQUE2Qjt3QkFDN0IsVUFBVSxDQUFDLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQTtxQkFDeEQ7eUJBQU07d0JBQ0wsVUFBVSxDQUFDLFdBQVcsQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQTtxQkFDekQ7Z0JBQ0gsQ0FBQyxDQUFDLENBQUE7WUFDSixDQUFDLENBQUE7WUFFRCxVQUFVLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFBO1lBQ3JCLE9BQU8sR0FBRyxDQUFBO1FBQ1osQ0FBQyxDQUFBO1FBR0QsT0FBTztZQUNMLDJEQUEyRDtZQUMzRCxFQUFFO1lBQ0YscUdBQXFHO1lBQ3JHLFVBQVU7WUFDViw4RkFBOEY7WUFDOUYsYUFBYTtZQUNiLCtCQUErQjtZQUMvQixLQUFLO1NBQ04sQ0FBQTtJQUNILENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgU2FuZGJveCB9IGZyb20gJ3R5cGVzY3JpcHQtc2FuZGJveCdcbmltcG9ydCB0eXBlIHsgTm9kZSB9IGZyb20gXCJ0eXBlc2NyaXB0XCJcbmltcG9ydCB0eXBlIFJlYWN0IGZyb20gJ3JlYWN0J1xuXG4vKiogQ3JlYXRlcyBhIHNldCBvZiB1dGlsIGZ1bmN0aW9ucyB3aGljaCBpcyBleHBvc2VkIHRvIFBsdWdpbnMgdG8gbWFrZSBpdCBlYXNpZXIgdG8gYnVpbGQgY29uc2lzdGVudCBVSXMgKi9cbmV4cG9ydCBjb25zdCBjcmVhdGVVdGlscyA9IChzYjogYW55LCByZWFjdDogdHlwZW9mIFJlYWN0KSA9PiB7XG4gIGNvbnN0IHNhbmRib3g6IFNhbmRib3ggPSBzYiBcbiAgY29uc3QgdHMgPSBzYW5kYm94LnRzXG5cbiAgY29uc3QgcmVxdWlyZVVSTCA9IChwYXRoOiBzdHJpbmcpID0+IHtcbiAgICAvLyBodHRwczovL3VucGtnLmNvbS9icm93c2UvdHlwZXNjcmlwdC1wbGF5Z3JvdW5kLXByZXNlbnRhdGlvbi1tb2RlQDAuMC4xL2Rpc3QveC5qcyA9PiB1bnBrZy9icm93c2UvdHlwZXNjcmlwdC1wbGF5Z3JvdW5kLXByZXNlbnRhdGlvbi1tb2RlQDAuMC4xL2Rpc3QveFxuICAgIGNvbnN0IGlzRGV2ID0gZG9jdW1lbnQubG9jYXRpb24uaG9zdC5pbmNsdWRlcygnbG9jYWxob3N0JylcbiAgICBjb25zdCBwcmVmaXggPSBpc0RldiA/ICdsb2NhbC8nIDogJ3VucGtnL3R5cGVzY3JpcHQtcGxheWdyb3VuZC1wcmVzZW50YXRpb24tbW9kZS9kaXN0LydcbiAgICByZXR1cm4gcHJlZml4ICsgcGF0aFxuICB9XG5cbiAgY29uc3QgZWwgPSAoc3RyOiBzdHJpbmcsIGVsOiBzdHJpbmcsIGNvbnRhaW5lcjogRWxlbWVudCkgPT4ge1xuICAgIGNvbnN0IHBhcmEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KGVsKVxuICAgIHBhcmEuaW5uZXJIVE1MID0gc3RyXG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKHBhcmEpXG4gIH1cblxuICBjb25zdCBjcmVhdGVBU1RUcmVlID0gKG5vZGU6IE5vZGUpID0+IHtcbiAgICBjb25zdCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIGRpdi5jbGFzc05hbWUgPSBcImFzdFwiXG5cbiAgICBjb25zdCBpbmZvRm9yTm9kZSA9IChub2RlOiBOb2RlKSA9PiB7XG4gICAgICBjb25zdCBuYW1lID0gdHMuU3ludGF4S2luZFtub2RlLmtpbmRdXG4gICAgICByZXR1cm4ge1xuICAgICAgICBuYW1lLFxuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHJlbmRlckxpdGVyYWxGaWVsZCA9IChrZXk6IHN0cmluZywgdmFsdWU6IHN0cmluZykgPT4ge1xuICAgICAgY29uc3QgbGkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpXG4gICAgICBsaS5pbm5lckhUTUwgPSBgJHtrZXl9OiAke3ZhbHVlfWBcbiAgICAgIHJldHVybiBsaVxuICAgIH1cblxuICAgIGNvbnN0IHJlbmRlclNpbmdsZUNoaWxkID0gKGtleTogc3RyaW5nLCB2YWx1ZTogTm9kZSkgPT4ge1xuICAgICAgY29uc3QgbGkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpXG4gICAgICBsaS5pbm5lckhUTUwgPSBgJHtrZXl9OiA8c3Ryb25nPiR7dHMuU3ludGF4S2luZFt2YWx1ZS5raW5kXX08L3N0cm9uZz5gXG4gICAgICByZXR1cm4gbGlcbiAgICB9XG5cbiAgICBjb25zdCByZW5kZXJNYW55Q2hpbGRyZW4gPSAoa2V5OiBzdHJpbmcsIHZhbHVlOiBOb2RlW10pID0+IHtcbiAgICAgIGNvbnN0IGxpID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKVxuICAgICAgY29uc3Qgbm9kZXMgPSB2YWx1ZS5tYXAobiA9PiBcIjxzdHJvbmc+Jm5ic3A7Jm5ic3A7XCIgKyB0cy5TeW50YXhLaW5kW24ua2luZF0gKyBcIjxzdHJvbmc+XCIpLmpvaW4oXCI8YnIvPlwiKSBcbiAgICAgIGxpLmlubmVySFRNTCA9IGAke2tleX06IFs8YnIvPiR7bm9kZXN9PC9icj5dYFxuICAgICAgcmV0dXJuIGxpXG4gICAgfVxuICBcbiAgICBjb25zdCByZW5kZXJJdGVtID0gKHBhcmVudEVsZW1lbnQ6IEVsZW1lbnQsIG5vZGU6IE5vZGUpID0+IHtcbiAgICAgIGNvbnN0IHVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndWwnKVxuICAgICAgcGFyZW50RWxlbWVudC5hcHBlbmRDaGlsZCh1bClcbiAgICAgIHVsLmNsYXNzTmFtZSA9ICdhc3QtdHJlZSdcblxuICAgICAgY29uc3QgaW5mbyA9IGluZm9Gb3JOb2RlKG5vZGUpXG4gIFxuICAgICAgY29uc3QgbGkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpXG4gICAgICB1bC5hcHBlbmRDaGlsZChsaSlcbiAgXG4gICAgICBjb25zdCBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpXG4gICAgICBhLnRleHRDb250ZW50ID0gaW5mby5uYW1lIFxuICAgICAgbGkuYXBwZW5kQ2hpbGQoYSlcbiAgXG4gICAgICBjb25zdCBwcm9wZXJ0aWVzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndWwnKVxuICAgICAgcHJvcGVydGllcy5jbGFzc05hbWUgPSAnYXN0LXRyZWUnXG4gICAgICBsaS5hcHBlbmRDaGlsZChwcm9wZXJ0aWVzKVxuXG4gICAgICBPYmplY3Qua2V5cyhub2RlKS5mb3JFYWNoKGZpZWxkID0+IHtcbiAgICAgICAgaWYgKHR5cGVvZiBmaWVsZCA9PT0gXCJmdW5jdGlvblwiKSByZXR1cm5cbiAgICAgICAgaWYgKGZpZWxkID09PSBcInBhcmVudFwiIHx8IGZpZWxkID09PSBcImZsb3dOb2RlXCIpIHJldHVyblxuXG4gICAgICAgIGNvbnN0IHZhbHVlID0gKG5vZGUgYXMgYW55KVtmaWVsZF0gXG4gICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIgJiYgQXJyYXkuaXNBcnJheSh2YWx1ZSkgJiYgXCJwb3NcIiBpbiB2YWx1ZVswXSAmJiBcImVuZFwiIGluIHZhbHVlWzBdKSB7XG4gICAgICAgICAgLy8gIElzIGFuIGFycmF5IG9mIE5vZGVzXG4gICAgICAgICAgcHJvcGVydGllcy5hcHBlbmRDaGlsZChyZW5kZXJNYW55Q2hpbGRyZW4oZmllbGQsIHZhbHVlKSlcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIgJiYgXCJwb3NcIiBpbiB2YWx1ZSAmJiBcImVuZFwiIGluIHZhbHVlKSB7XG4gICAgICAgICAgLy8gSXMgYSBzaW5nbGUgY2hpbGQgcHJvcGVydHlcbiAgICAgICAgICBwcm9wZXJ0aWVzLmFwcGVuZENoaWxkKHJlbmRlclNpbmdsZUNoaWxkKGZpZWxkLCB2YWx1ZSkpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcHJvcGVydGllcy5hcHBlbmRDaGlsZChyZW5kZXJMaXRlcmFsRmllbGQoZmllbGQsIHZhbHVlKSlcbiAgICAgICAgfVxuICAgICAgfSkgIFxuICAgIH1cbiAgXG4gICAgcmVuZGVySXRlbShkaXYsIG5vZGUpXG4gICAgcmV0dXJuIGRpdlxuICB9XG5cblxuICByZXR1cm4ge1xuICAgIC8qKiBVc2UgdGhpcyB0byBtYWtlIGEgZmV3IGR1bWIgZWxlbWVudCBnZW5lcmF0aW9uIGZ1bmNzICovICAgIFxuICAgIGVsLFxuICAgIC8qKiBHZXQgYSByZWxhdGl2ZSBVUkwgZm9yIHNvbWV0aGluZyBpbiB5b3VyIGRpc3QgZm9sZGVyIGRlcGVuZGluZyBvbiBpZiB5b3UncmUgaW4gZGV2IG1vZGUgb3Igbm90ICovXG4gICAgcmVxdWlyZVVSTCxcbiAgICAvKiogUmV0dXJucyBhIGRpdiB3aGljaCBoYXMgYW4gaW50ZXJhY3RpdmUgQVNUIGEgVHlwZVNjcmlwdCBBU1QgYnkgcGFzc2luZyBpbiB0aGUgcm9vdCBub2RlICovXG4gICAgY3JlYXRlQVNUVHJlZSxcbiAgICAvKiogVGhlIEdhdHNieSBjb3B5IG9mIFJlYWN0ICovXG4gICAgcmVhY3RcbiAgfVxufVxuXG5leHBvcnQgdHlwZSBQbHVnaW5VdGlscyA9IFJldHVyblR5cGU8dHlwZW9mIGNyZWF0ZVV0aWxzPlxuIl19