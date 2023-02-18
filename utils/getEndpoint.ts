export function getEndpoint(url: string | URL) {
  const inURL = (url instanceof URL) ? url : new URL(url);

  if (inURL.pathname.includes("gateaway")) return inURL.pathname;

  const splittedURL = inURL.pathname.split("/");

  splittedURL.shift();
  splittedURL.shift();

  const isSearchParanExist = Array.from(inURL.searchParams.keys()).length > 0;

  return `/${splittedURL.join("/")}${
    isSearchParanExist ? "?" + inURL.searchParams.toString() : ""
  }`;
}

export function getServiceEndpoint(url: string | URL) {
  const inURL = (url instanceof URL) ? url : new URL(url);

  if (inURL.pathname.includes("gateaway")) return inURL.pathname;

  return `/${inURL.pathname.split("/")[1]}`;
}
