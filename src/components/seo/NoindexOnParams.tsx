import { Helmet } from "react-helmet";
import { useLocation } from "react-router-dom";

/**
 * SEO guard for query-parameter URLs.
 *
 * Search/filter/sort/tracking permutations (e.g. `/flights?originLocationCode=DFW`,
 * `/deals?airline=lao-airlines`, `?utm_source=…`) generate infinite crawlable
 * variants that Google reports as "Crawled – currently not indexed". When any
 * query string is present we mark the variant `noindex, follow` so crawl signals
 * consolidate on the page's clean self-referencing canonical (which each page
 * declares in its own <Helmet>).
 *
 * Render this AFTER a page's own <Helmet> so its robots meta overrides the
 * default `index, follow` when — and only when — query params are present.
 */
const NoindexOnParams = () => {
  const { search } = useLocation();
  const hasParams = search.length > 1;

  if (!hasParams) return null;

  return (
    <Helmet>
      <meta name="robots" content="noindex, follow" />
    </Helmet>
  );
};

export default NoindexOnParams;
