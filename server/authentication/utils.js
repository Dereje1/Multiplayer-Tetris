const getApiKeys = (authType) => {
    const {
        GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET,
        GOOGLE_CALLBACK,
    } = process.env;
    if (authType === 'google' && GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET && GOOGLE_CALLBACK) {
        return {
            clientID: GOOGLE_CLIENT_ID,
            clientSecret: GOOGLE_CLIENT_SECRET,
            callbackURL: GOOGLE_CALLBACK,
        };
    }
    console.log(`Missing API keys for --> ${authType}`);
    return null;
};

module.exports = { getApiKeys };