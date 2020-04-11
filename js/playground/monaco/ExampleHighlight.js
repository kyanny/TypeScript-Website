define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Allows inline clicking on internal URLs to get different example code
     */
    class ExampleHighlighter {
        provideLinks(model) {
            const text = model.getValue();
            // https://regex101.com/r/3uM4Fa/1
            const docRegexLink = /example:([^\s]+)/g;
            const links = [];
            let match;
            while ((match = docRegexLink.exec(text)) !== null) {
                const start = match.index;
                const end = match.index + match[0].length;
                const startPos = model.getPositionAt(start);
                const endPos = model.getPositionAt(end);
                const range = {
                    startLineNumber: startPos.lineNumber,
                    startColumn: startPos.column,
                    endLineNumber: endPos.lineNumber,
                    endColumn: endPos.column,
                };
                const url = document.location.href.split('#')[0];
                links.push({
                    url: url + '#example/' + match[1],
                    range,
                });
            }
            return { links };
        }
    }
    exports.ExampleHighlighter = ExampleHighlighter;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXhhbXBsZUhpZ2hsaWdodC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BsYXlncm91bmQvc3JjL21vbmFjby9FeGFtcGxlSGlnaGxpZ2h0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQUFBOztPQUVHO0lBQ0gsTUFBYSxrQkFBa0I7UUFDN0IsWUFBWSxDQUFDLEtBQTRDO1lBQ3ZELE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQTtZQUU3QixrQ0FBa0M7WUFDbEMsTUFBTSxZQUFZLEdBQUcsbUJBQW1CLENBQUE7WUFFeEMsTUFBTSxLQUFLLEdBQUcsRUFBRSxDQUFBO1lBRWhCLElBQUksS0FBSyxDQUFBO1lBQ1QsT0FBTyxDQUFDLEtBQUssR0FBRyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssSUFBSSxFQUFFO2dCQUNqRCxNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFBO2dCQUN6QixNQUFNLEdBQUcsR0FBRyxLQUFLLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUE7Z0JBQ3pDLE1BQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUE7Z0JBQzNDLE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUE7Z0JBRXZDLE1BQU0sS0FBSyxHQUFHO29CQUNaLGVBQWUsRUFBRSxRQUFRLENBQUMsVUFBVTtvQkFDcEMsV0FBVyxFQUFFLFFBQVEsQ0FBQyxNQUFNO29CQUM1QixhQUFhLEVBQUUsTUFBTSxDQUFDLFVBQVU7b0JBQ2hDLFNBQVMsRUFBRSxNQUFNLENBQUMsTUFBTTtpQkFDekIsQ0FBQTtnQkFFRCxNQUFNLEdBQUcsR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7Z0JBQ2hELEtBQUssQ0FBQyxJQUFJLENBQUM7b0JBQ1QsR0FBRyxFQUFFLEdBQUcsR0FBRyxXQUFXLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQztvQkFDakMsS0FBSztpQkFDTixDQUFDLENBQUE7YUFDSDtZQUVELE9BQU8sRUFBRSxLQUFLLEVBQUUsQ0FBQTtRQUNsQixDQUFDO0tBQ0Y7SUFoQ0QsZ0RBZ0NDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBBbGxvd3MgaW5saW5lIGNsaWNraW5nIG9uIGludGVybmFsIFVSTHMgdG8gZ2V0IGRpZmZlcmVudCBleGFtcGxlIGNvZGVcbiAqL1xuZXhwb3J0IGNsYXNzIEV4YW1wbGVIaWdobGlnaHRlciB7XG4gIHByb3ZpZGVMaW5rcyhtb2RlbDogaW1wb3J0KCdtb25hY28tZWRpdG9yJykuZWRpdG9yLklNb2RlbCkge1xuICAgIGNvbnN0IHRleHQgPSBtb2RlbC5nZXRWYWx1ZSgpXG5cbiAgICAvLyBodHRwczovL3JlZ2V4MTAxLmNvbS9yLzN1TTRGYS8xXG4gICAgY29uc3QgZG9jUmVnZXhMaW5rID0gL2V4YW1wbGU6KFteXFxzXSspL2dcblxuICAgIGNvbnN0IGxpbmtzID0gW11cblxuICAgIGxldCBtYXRjaFxuICAgIHdoaWxlICgobWF0Y2ggPSBkb2NSZWdleExpbmsuZXhlYyh0ZXh0KSkgIT09IG51bGwpIHtcbiAgICAgIGNvbnN0IHN0YXJ0ID0gbWF0Y2guaW5kZXhcbiAgICAgIGNvbnN0IGVuZCA9IG1hdGNoLmluZGV4ICsgbWF0Y2hbMF0ubGVuZ3RoXG4gICAgICBjb25zdCBzdGFydFBvcyA9IG1vZGVsLmdldFBvc2l0aW9uQXQoc3RhcnQpXG4gICAgICBjb25zdCBlbmRQb3MgPSBtb2RlbC5nZXRQb3NpdGlvbkF0KGVuZClcblxuICAgICAgY29uc3QgcmFuZ2UgPSB7XG4gICAgICAgIHN0YXJ0TGluZU51bWJlcjogc3RhcnRQb3MubGluZU51bWJlcixcbiAgICAgICAgc3RhcnRDb2x1bW46IHN0YXJ0UG9zLmNvbHVtbixcbiAgICAgICAgZW5kTGluZU51bWJlcjogZW5kUG9zLmxpbmVOdW1iZXIsXG4gICAgICAgIGVuZENvbHVtbjogZW5kUG9zLmNvbHVtbixcbiAgICAgIH1cblxuICAgICAgY29uc3QgdXJsID0gZG9jdW1lbnQubG9jYXRpb24uaHJlZi5zcGxpdCgnIycpWzBdXG4gICAgICBsaW5rcy5wdXNoKHtcbiAgICAgICAgdXJsOiB1cmwgKyAnI2V4YW1wbGUvJyArIG1hdGNoWzFdLFxuICAgICAgICByYW5nZSxcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgcmV0dXJuIHsgbGlua3MgfVxuICB9XG59XG4iXX0=