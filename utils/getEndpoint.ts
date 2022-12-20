export function getEndpoint(url: string) {
    const inURL = new URL(url);

    if (inURL.pathname.includes("gateaway")) return inURL.pathname;

    const splittedURL = inURL.pathname.split("/");

    splittedURL.shift();
    splittedURL.shift();

    return `/${splittedURL.join("/")}`;
}

export function getServiceEndpoint(url: string) {
    const URLL = new URL(url);
    return `/${URLL.pathname.split("/")[1]}`
}