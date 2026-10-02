// CloudFront Function (cloudfront-js-2.0), viewer-request.
// Maps clean URLs to the prerendered file: /flights -> /flights/index.html,
// /flights/ -> /flights/index.html. Paths with a file extension (assets,
// sitemap.xml, robots.txt) pass through unchanged. Routes without a
// prerendered file still fall back to the SPA via the distribution's
// existing error responses.
function handler(event) {
  var request = event.request;
  var uri = request.uri;
  if (uri === "/" || uri === "") return request;
  if (uri.endsWith("/")) {
    request.uri = uri + "index.html";
    return request;
  }
  var last = uri.substring(uri.lastIndexOf("/") + 1);
  if (last.indexOf(".") === -1) {
    request.uri = uri + "/index.html";
  }
  return request;
}
