module.exports = {
    filesystemSafe(text) {
        text = text.replace(/[^a-zA-Z0-9.-]/, "_").replace(/__/g, "_").replace(/_+$/g, "");
        if (text.length > 100) {
            text = text.substring(0, 99);
        }

        return text;
    },
    filesystemSanitized(text) {
        return text.replace(/[^a-zA-Z0-9.-]/g, "_");
    }
}