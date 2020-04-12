define(["require", "exports", "./releases"], function (require, exports, releases_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * The versions of monaco-typescript which we can use
     * for backwards compatibility with older versions
     * of TS in the playground.
     */
    exports.monacoTSVersions = [...releases_1.supportedReleases, 'Latest'];
    /** Returns the latest TypeScript version supported by the sandbox */
    exports.latestSupportedTypeScriptVersion = Object.keys(exports.monacoTSVersions)
        .filter(key => key !== 'Nightly' && !key.includes('-'))
        .sort()
        .pop();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9uYWNvVFNWZXJzaW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NhbmRib3gvc3JjL21vbmFjb1RTVmVyc2lvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBS0E7Ozs7T0FJRztJQUNVLFFBQUEsZ0JBQWdCLEdBQTBCLENBQUMsR0FBRyw0QkFBaUIsRUFBRSxRQUFRLENBQUMsQ0FBQTtJQUV2RixxRUFBcUU7SUFDeEQsUUFBQSxnQ0FBZ0MsR0FBVyxNQUFNLENBQUMsSUFBSSxDQUFDLHdCQUFnQixDQUFDO1NBQ2xGLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxTQUFTLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQ3RELElBQUksRUFBRTtTQUNOLEdBQUcsRUFBRyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgc3VwcG9ydGVkUmVsZWFzZXMsIFJlbGVhc2VWZXJzaW9ucyB9IGZyb20gJy4vcmVsZWFzZXMnXG5cbi8qKiBUaGUgdmVyc2lvbnMgeW91IGNhbiBnZXQgZm9yIHRoZSBzYW5kYm94ICovXG5leHBvcnQgdHlwZSBTdXBwb3J0ZWRUU1ZlcnNpb25zID0gUmVsZWFzZVZlcnNpb25zIHwgJ0xhdGVzdCdcblxuLyoqXG4gKiBUaGUgdmVyc2lvbnMgb2YgbW9uYWNvLXR5cGVzY3JpcHQgd2hpY2ggd2UgY2FuIHVzZVxuICogZm9yIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5IHdpdGggb2xkZXIgdmVyc2lvbnNcbiAqIG9mIFRTIGluIHRoZSBwbGF5Z3JvdW5kLlxuICovXG5leHBvcnQgY29uc3QgbW9uYWNvVFNWZXJzaW9uczogU3VwcG9ydGVkVFNWZXJzaW9uc1tdID0gWy4uLnN1cHBvcnRlZFJlbGVhc2VzLCAnTGF0ZXN0J11cblxuLyoqIFJldHVybnMgdGhlIGxhdGVzdCBUeXBlU2NyaXB0IHZlcnNpb24gc3VwcG9ydGVkIGJ5IHRoZSBzYW5kYm94ICovXG5leHBvcnQgY29uc3QgbGF0ZXN0U3VwcG9ydGVkVHlwZVNjcmlwdFZlcnNpb246IHN0cmluZyA9IE9iamVjdC5rZXlzKG1vbmFjb1RTVmVyc2lvbnMpXG4gIC5maWx0ZXIoa2V5ID0+IGtleSAhPT0gJ05pZ2h0bHknICYmICFrZXkuaW5jbHVkZXMoJy0nKSlcbiAgLnNvcnQoKVxuICAucG9wKCkhXG4iXX0=