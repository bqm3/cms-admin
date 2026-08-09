export function getAffiliateUrl(post: any, moduleContent?: any): string | null {
  if (!post && !moduleContent) return null;

  // 1. moduleContent.affiliateUrl
  if (moduleContent?.affiliateUrl && typeof moduleContent.affiliateUrl === "string") {
    const trimmed = moduleContent.affiliateUrl.trim();
    if (trimmed.length > 0) return trimmed;
  }

  // 2. post.affiliate_url
  if (post?.affiliate_url && typeof post.affiliate_url === "string") {
    const trimmed = post.affiliate_url.trim();
    if (trimmed.length > 0) return trimmed;
  }

  // 3. First valid link in post.links
  if (Array.isArray(post?.links)) {
    for (const link of post.links) {
      if (link && typeof link.href === "string") {
        const trimmed = link.href.trim();
        if (trimmed.length > 0) return trimmed;
      }
    }
  }

  return null;
}
