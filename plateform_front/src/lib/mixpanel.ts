import mixpanel from "mixpanel-browser";

mixpanel.init("759498d829f6a0cbcca9e1d80cef1c36", {
    debug: process.env.NODE_ENV !== "production",
    track_pageview: false,
    persistence: "localStorage",
    api_host: "https://api-eu.mixpanel.com",
});

mixpanel.opt_in_tracking();

export default mixpanel;
