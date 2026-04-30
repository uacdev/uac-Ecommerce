// Cloudinary URL helpers. The seed script stores raw upload URLs (no transforms),
// which means a 4 MB Zuri PNG actually downloads as 4 MB. Inserting `f_auto,q_auto`
// after `/upload/` makes Cloudinary serve a webp/avif variant at ~50 KB instead.
//
// Idempotent — if the URL already has transforms, we don't double them up.

const CDN_HOST = 'res.cloudinary.com'

const isCloudinary = (url) => typeof url === 'string' && url.includes(CDN_HOST)

const hasTransforms = (url) => /\/upload\/[a-z]_[^/]+\//.test(url)

export const cdn = (url, extra = '') => {
    if (!isCloudinary(url) || hasTransforms(url)) return url
    const transforms = ['f_auto', 'q_auto', extra].filter(Boolean).join(',')
    return url.replace('/upload/', `/upload/${transforms}/`)
}

// Card-sized variant: hard-cap width so we don't ship a 2000px image to a 400px card.
export const cdnCard = (url) => cdn(url, 'w_800,c_limit')

// Hero-sized variant for the home page.
export const cdnHero = (url) => cdn(url, 'w_1600,c_limit')
