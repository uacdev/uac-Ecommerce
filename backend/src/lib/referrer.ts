// Map a Referer URL → categorised source. Goes into Visit.referrerSource
// so the analytics dashboard can group "all instagram traffic" without
// splitting by /reel /story /direct etc.

const HOST_RULES: Array<[RegExp, string]> = [
    [/(^|\.)instagram\.com$/i, 'instagram'],
    [/(^|\.)twitter\.com$/i, 'twitter'],
    [/(^|\.)x\.com$/i, 'twitter'],
    [/(^|\.)t\.co$/i, 'twitter'],
    [/(^|\.)facebook\.com$/i, 'facebook'],
    [/(^|\.)fb\.me$/i, 'facebook'],
    [/(^|\.)m\.facebook\.com$/i, 'facebook'],
    [/(^|\.)l\.facebook\.com$/i, 'facebook'],
    [/(^|\.)whatsapp\.com$/i, 'whatsapp'],
    [/(^|\.)wa\.me$/i, 'whatsapp'],
    [/(^|\.)tiktok\.com$/i, 'tiktok'],
    [/(^|\.)youtube\.com$/i, 'youtube'],
    [/(^|\.)youtu\.be$/i, 'youtube'],
    [/(^|\.)google\./i, 'google'],
    [/(^|\.)bing\.com$/i, 'bing'],
    // Common email webmail clients — count as "email" rather than "google".
    [/(^|\.)mail\.google\.com$/i, 'email'],
    [/(^|\.)outlook\.live\.com$/i, 'email'],
    [/(^|\.)mail\.yahoo\.com$/i, 'email']
];

export const classifyReferrer = (referer: string | undefined, ownHost: string | undefined = undefined): string => {
    if (!referer) return 'direct';
    let host = '';
    try {
        host = new URL(referer).hostname.toLowerCase();
    } catch {
        return 'other';
    }
    if (!host) return 'direct';
    // Self-referral (storefront → product page) is direct, not other.
    if (ownHost && host === ownHost.toLowerCase()) return 'direct';
    for (const [rx, label] of HOST_RULES) {
        if (rx.test(host)) return label;
    }
    return 'other';
};
