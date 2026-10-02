#!/usr/bin/env bash
# Idempotently create/update + publish the clean-URL CloudFront Function and
# attach it as the viewer-request function on the distribution's default
# cache behavior. Requires CLOUDFRONT_DISTRIBUTION_ID and AWS credentials with:
#   cloudfront:DescribeFunction, CreateFunction, UpdateFunction, PublishFunction,
#   GetDistributionConfig, UpdateDistribution
set -euo pipefail

DIST_ID="${CLOUDFRONT_DISTRIBUTION_ID:?CLOUDFRONT_DISTRIBUTION_ID is required}"
NAME="tripile-clean-urls"
CODE="$(dirname "$0")/clean-urls.js"
CONFIG='Comment="Serve prerendered index.html for clean URLs",Runtime="cloudfront-js-2.0"'

if aws cloudfront describe-function --name "$NAME" --stage DEVELOPMENT >/tmp/fn.json 2>/dev/null; then
  ETAG=$(jq -r '.ETag' /tmp/fn.json)
  aws cloudfront update-function --name "$NAME" --if-match "$ETAG" \
    --function-config "$CONFIG" --function-code "fileb://$CODE" >/tmp/fn.json
else
  aws cloudfront create-function --name "$NAME" \
    --function-config "$CONFIG" --function-code "fileb://$CODE" >/tmp/fn.json
fi
ETAG=$(jq -r '.ETag' /tmp/fn.json)
aws cloudfront publish-function --name "$NAME" --if-match "$ETAG" >/tmp/fn-pub.json
ARN=$(jq -r '.FunctionSummary.FunctionMetadata.FunctionARN' /tmp/fn-pub.json)
echo "published $ARN"

aws cloudfront get-distribution-config --id "$DIST_ID" >/tmp/dist.json
DIST_ETAG=$(jq -r '.ETag' /tmp/dist.json)
CURRENT=$(jq -r '[.DistributionConfig.DefaultCacheBehavior.FunctionAssociations.Items // [] | .[] | select(.EventType=="viewer-request") | .FunctionARN] | first // ""' /tmp/dist.json)

if [ "$CURRENT" = "$ARN" ]; then
  echo "distribution already uses $NAME for viewer-request"
  exit 0
fi

jq --arg arn "$ARN" '
  .DistributionConfig
  | .DefaultCacheBehavior.FunctionAssociations as $fa
  | (($fa.Items // []) | map(select(.EventType != "viewer-request"))) as $others
  | .DefaultCacheBehavior.FunctionAssociations = {
      Quantity: (($others | length) + 1),
      Items: ($others + [{FunctionARN: $arn, EventType: "viewer-request"}])
    }
' /tmp/dist.json >/tmp/dist-new.json

aws cloudfront update-distribution --id "$DIST_ID" --if-match "$DIST_ETAG" \
  --distribution-config file:///tmp/dist-new.json >/dev/null
echo "attached $NAME to distribution $DIST_ID (viewer-request)"
