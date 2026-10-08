export const PLATFORM_CONFIG = {
  appName: 'SubVault',
  appTagline: 'Premium Digital Subscriptions at Smarter Prices',
  defaultPlatformCommissionPercent: 10, // 10% marketplace fee
  defaultBuyerFeePercent: 0,
  minWalletDeposit: 50, // ₹50
  maxWalletDeposit: 25000, // ₹25,000
  minWithdrawalAmount: 200, // ₹200
  maxWithdrawalAmount: 50000, // ₹50,000
  refundWindowHours: 48, // 48 hours to claim refund after delivery
  autoApproveListings: false,
};

export const POPULAR_CATEGORIES = [
  { name: 'OTT & Streaming', slug: 'ott-streaming', icon: 'Tv', description: 'Movies, Series, TV & Anime' },
  { name: 'AI & Machine Learning', slug: 'ai-tools', icon: 'Bot', description: 'ChatGPT, Claude, Midjourney' },
  { name: 'Design & Creative', slug: 'design-creative', icon: 'Palette', description: 'Canva, Adobe, Figma' },
  { name: 'Education & Learning', slug: 'education', icon: 'GraduationCap', description: 'Coursera, Udemy, Duolingo' },
  { name: 'VPN & Privacy', slug: 'vpn-cloud', icon: 'Shield', description: 'NordVPN, ExpressVPN, Surfshark' },
  { name: 'Music & Audio', slug: 'music-audio', icon: 'Headphones', description: 'Spotify, YouTube Music, Apple Music' },
  { name: 'Productivity & Office', slug: 'productivity', icon: 'Briefcase', description: 'Notion, MS Office 365, Slack' },
  { name: 'Developer Tools', slug: 'developer-tools', icon: 'Code', description: 'GitHub Copilot, Cursor, JetBrains' },
];
