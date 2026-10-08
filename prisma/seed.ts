import { PrismaClient, RoleType, SellerStatus, ListingStatus, AccessType, OrderStatus, TransactionType, TransactionStatus } from '@prisma/client';
import * as crypto from 'crypto';
import { encryptData } from './crypto';

const prisma = new PrismaClient();

// Hash function using PBKDF2 or bcrypt for seed
function hashPassword(password: string): string {
  // We will store bcrypt hash format or standard salt:hash compatible with our AuthModule
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `pbkdf2:${salt}:${hash}`;
}

async function main() {
  console.log('🌱 Starting SubVault seed process...');

  // 1. System Settings
  const settings = [
    { key: 'PLATFORM_COMMISSION_PERCENT', value: '10', description: 'Platform commission percentage charged to sellers' },
    { key: 'BUYER_FEE_PERCENT', value: '0', description: 'Buyer transaction fee percentage' },
    { key: 'MIN_WALLET_DEPOSIT', value: '50', description: 'Minimum wallet deposit amount in INR' },
    { key: 'MAX_WALLET_DEPOSIT', value: '25000', description: 'Maximum wallet deposit amount in INR' },
    { key: 'MIN_WITHDRAWAL_AMOUNT', value: '200', description: 'Minimum seller withdrawal amount in INR' },
    { key: 'MAX_WITHDRAWAL_AMOUNT', value: '50000', description: 'Maximum seller withdrawal amount in INR' },
    { key: 'REFUND_WINDOW_HOURS', value: '48', description: 'Hours buyer has to claim dispute after purchase' },
    { key: 'AUTO_APPROVE_LISTINGS', value: 'true', description: 'Whether new seller listings are auto-activated' },
    { key: 'PLATFORM_NAME', value: 'SubVault', description: 'Public marketplace platform brand name' },
  ];

  for (const s of settings) {
    await prisma.systemSetting.upsert({
      where: { key: s.key },
      update: { value: s.value, description: s.description },
      create: s,
    });
  }
  console.log('✅ System settings seeded');

  // 2. Users & Roles
  // Admin User
  const adminPasswordHash = hashPassword('Admin@SubVault2026!');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@subvault.com' },
    update: {
      passwordHash: adminPasswordHash,
      role: RoleType.ADMIN,
      isEmailVerified: true,
    },
    create: {
      email: 'admin@subvault.com',
      passwordHash: adminPasswordHash,
      fullName: 'SubVault Admin Director',
      phone: '+919876543210',
      role: RoleType.ADMIN,
      isEmailVerified: true,
    },
  });

  // Seller 1: CloudPass Hub
  const seller1PasswordHash = hashPassword('Seller@SubVault2026!');
  const seller1User = await prisma.user.upsert({
    where: { email: 'seller@subvault.com' },
    update: {
      passwordHash: seller1PasswordHash,
      role: RoleType.SELLER,
      isEmailVerified: true,
    },
    create: {
      email: 'seller@subvault.com',
      passwordHash: seller1PasswordHash,
      fullName: 'Aarav Sharma',
      phone: '+919811223344',
      role: RoleType.SELLER,
      isEmailVerified: true,
    },
  });

  const seller1Profile = await prisma.sellerProfile.upsert({
    where: { userId: seller1User.id },
    update: {
      displayName: 'CloudPass Hub',
      bio: 'Verified OTT & AI subscription distributor. 24x7 instant delivery with 100% replacement warranty.',
      isVerified: true,
      rating: 4.9,
      totalRatingsCount: 142,
      totalSales: 380,
      completedOrdersCount: 375,
      payoutMethod: 'UPI',
      upiId: 'cloudpass@okhdfcbank',
    },
    create: {
      userId: seller1User.id,
      displayName: 'CloudPass Hub',
      bio: 'Verified OTT & AI subscription distributor. 24x7 instant delivery with 100% replacement warranty.',
      isVerified: true,
      rating: 4.9,
      totalRatingsCount: 142,
      totalSales: 380,
      completedOrdersCount: 375,
      payoutMethod: 'UPI',
      upiId: 'cloudpass@okhdfcbank',
    },
  });

  // Seller 1 Wallet
  await prisma.sellerWallet.upsert({
    where: { sellerProfileId: seller1Profile.id },
    update: {
      availableEarnings: 4250.0,
      totalEarnings: 28400.0,
      withdrawnAmount: 24150.0,
    },
    create: {
      sellerProfileId: seller1Profile.id,
      availableEarnings: 4250.0,
      totalEarnings: 28400.0,
      withdrawnAmount: 24150.0,
    },
  });

  // Seller 2: PrimeStream Pro
  const seller2PasswordHash = hashPassword('Seller@SubVault2026!');
  const seller2User = await prisma.user.upsert({
    where: { email: 'primestream@subvault.com' },
    update: {
      passwordHash: seller2PasswordHash,
      role: RoleType.SELLER,
      isEmailVerified: true,
    },
    create: {
      email: 'primestream@subvault.com',
      passwordHash: seller2PasswordHash,
      fullName: 'Rohan Mehra',
      phone: '+919822334455',
      role: RoleType.SELLER,
      isEmailVerified: true,
    },
  });

  const seller2Profile = await prisma.sellerProfile.upsert({
    where: { userId: seller2User.id },
    update: {
      displayName: 'PrimeStream Pro',
      bio: 'Top tier digital access reseller. Specializing in 4K UHD screens and student/family licenses.',
      isVerified: true,
      rating: 4.8,
      totalRatingsCount: 88,
      totalSales: 210,
      completedOrdersCount: 205,
      payoutMethod: 'UPI',
      upiId: 'primestream@icici',
    },
    create: {
      userId: seller2User.id,
      displayName: 'PrimeStream Pro',
      bio: 'Top tier digital access reseller. Specializing in 4K UHD screens and student/family licenses.',
      isVerified: true,
      rating: 4.8,
      totalRatingsCount: 88,
      totalSales: 210,
      completedOrdersCount: 205,
      payoutMethod: 'UPI',
      upiId: 'primestream@icici',
    },
  });

  await prisma.sellerWallet.upsert({
    where: { sellerProfileId: seller2Profile.id },
    update: {
      availableEarnings: 1800.0,
      totalEarnings: 15600.0,
      withdrawnAmount: 13800.0,
    },
    create: {
      sellerProfileId: seller2Profile.id,
      availableEarnings: 1800.0,
      totalEarnings: 15600.0,
      withdrawnAmount: 13800.0,
    },
  });

  // Buyer 1: Pre-funded user
  const buyerPasswordHash = hashPassword('Buyer@SubVault2026!');
  const buyer = await prisma.user.upsert({
    where: { email: 'buyer@subvault.com' },
    update: {
      passwordHash: buyerPasswordHash,
      role: RoleType.USER,
      isEmailVerified: true,
    },
    create: {
      email: 'buyer@subvault.com',
      passwordHash: buyerPasswordHash,
      fullName: 'Vikram Patel',
      phone: '+919700112233',
      role: RoleType.USER,
      isEmailVerified: true,
    },
  });

  // Buyer Wallet with ₹1500 balance for instant test purchases
  const buyerWallet = await prisma.wallet.upsert({
    where: { userId: buyer.id },
    update: {
      balance: 1500.0,
      totalAdded: 2000.0,
      totalSpent: 500.0,
    },
    create: {
      userId: buyer.id,
      balance: 1500.0,
      totalAdded: 2000.0,
      totalSpent: 500.0,
    },
  });

  // Initial wallet ledger entry
  await prisma.walletTransaction.create({
    data: {
      walletId: buyerWallet.id,
      userId: buyer.id,
      amount: 1500.0,
      balanceAfter: 1500.0,
      type: TransactionType.CREDIT,
      status: TransactionStatus.SUCCESS,
      description: 'Initial wallet balance top-up via Razorpay UPI',
      referenceId: 'pay_init_seed_001',
    },
  });

  console.log('✅ Users, sellers, and wallets seeded');

  // 3. Categories
  const categoriesData = [
    { name: 'OTT & Streaming', slug: 'ott-streaming', icon: 'Tv', description: 'Movies, Series, Live TV & Anime', sortOrder: 1 },
    { name: 'AI & Machine Learning', slug: 'ai-tools', icon: 'Bot', description: 'ChatGPT Plus, Claude, Midjourney', sortOrder: 2 },
    { name: 'Design & Creative', slug: 'design-creative', icon: 'Palette', description: 'Canva Pro, Adobe Creative Cloud', sortOrder: 3 },
    { name: 'Music & Audio', slug: 'music-audio', icon: 'Headphones', description: 'Spotify, YouTube Music, Apple Music', sortOrder: 4 },
    { name: 'VPN & Privacy', slug: 'vpn-cloud', icon: 'Shield', description: 'NordVPN, ExpressVPN, Surfshark', sortOrder: 5 },
    { name: 'Education & Learning', slug: 'education', icon: 'GraduationCap', description: 'Coursera, Udemy, Duolingo Super', sortOrder: 6 },
    { name: 'Productivity & Office', slug: 'productivity', icon: 'Briefcase', description: 'Notion Plus, MS 365, Google Workspace', sortOrder: 7 },
  ];

  const catMap = new Map<string, string>();
  for (const c of categoriesData) {
    const record = await prisma.category.upsert({
      where: { slug: c.slug },
      update: c,
      create: c,
    });
    catMap.set(c.slug, record.id);
  }

  // 4. Platforms
  const platformsData = [
    {
      categoryId: catMap.get('ott-streaming')!,
      name: 'Netflix',
      slug: 'netflix',
      logoUrl: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=160&auto=format&fit=crop&q=80',
      description: 'Stream unlimited movies, TV shows, and original series in 4K UHD.',
    },
    {
      categoryId: catMap.get('ott-streaming')!,
      name: 'Amazon Prime Video',
      slug: 'prime-video',
      logoUrl: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=160&auto=format&fit=crop&q=80',
      description: 'Exclusive Amazon Originals, blockbuster movies and sports.',
    },
    {
      categoryId: catMap.get('ott-streaming')!,
      name: 'Disney+ Hotstar',
      slug: 'hotstar',
      logoUrl: 'https://images.unsplash.com/photo-1585951237318-9ea5e175b891?w=160&auto=format&fit=crop&q=80',
      description: 'Live Cricket, Disney, Marvel, Pixar, and HBO specials.',
    },
    {
      categoryId: catMap.get('ott-streaming')!,
      name: 'Sony LIV',
      slug: 'sony-liv',
      logoUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=160&auto=format&fit=crop&q=80',
      description: 'Original web series, UEFA Champions League, Sony entertainment.',
    },
    {
      categoryId: catMap.get('ai-tools')!,
      name: 'ChatGPT Plus',
      slug: 'chatgpt-plus',
      logoUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=160&auto=format&fit=crop&q=80',
      description: 'OpenAI GPT-4o, Advanced Voice Mode, DALL-E, Canvas & custom GPTs.',
    },
    {
      categoryId: catMap.get('ai-tools')!,
      name: 'Claude Pro',
      slug: 'claude-pro',
      logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=160&auto=format&fit=crop&q=80',
      description: 'Anthropic Claude 3.5 Sonnet, 200k context window and Projects.',
    },
    {
      categoryId: catMap.get('design-creative')!,
      name: 'Canva Pro',
      slug: 'canva-pro',
      logoUrl: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=160&auto=format&fit=crop&q=80',
      description: '100M+ premium stock assets, Brand Kit, Background Remover, Magic Studio.',
    },
    {
      categoryId: catMap.get('music-audio')!,
      name: 'Spotify Premium',
      slug: 'spotify-premium',
      logoUrl: 'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?w=160&auto=format&fit=crop&q=80',
      description: 'Ad-free high fidelity music listening with offline downloads.',
    },
    {
      categoryId: catMap.get('music-audio')!,
      name: 'YouTube Premium',
      slug: 'youtube-premium',
      logoUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=160&auto=format&fit=crop&q=80',
      description: 'Ad-free videos, background play, and YouTube Music Premium included.',
    },
    {
      categoryId: catMap.get('vpn-cloud')!,
      name: 'NordVPN',
      slug: 'nordvpn',
      logoUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=160&auto=format&fit=crop&q=80',
      description: 'Military-grade encryption, double VPN, Threat Protection and 6000+ servers.',
    },
    {
      categoryId: catMap.get('education')!,
      name: 'Coursera Plus',
      slug: 'coursera-plus',
      logoUrl: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=160&auto=format&fit=crop&q=80',
      description: 'Unlimited access to 7000+ courses and certifications from top universities.',
    },
  ];

  const platMap = new Map<string, string>();
  for (const p of platformsData) {
    const record = await prisma.platform.upsert({
      where: { slug: p.slug },
      update: p,
      create: p,
    });
    platMap.set(p.slug, record.id);
  }
  console.log('✅ Categories and platforms seeded');

  // 5. Listings and Inventory with Real Encrypted Credentials
  const listingsData = [
    {
      sellerId: seller1Profile.id,
      platformId: platMap.get('netflix')!,
      categoryId: catMap.get('ott-streaming')!,
      title: 'Netflix Premium 4K UHD - Private Profile (PIN Protected)',
      slug: 'netflix-4k-uhd-private-profile',
      planName: 'Ultra HD 4K Premium',
      description: 'Dedicated personal profile with your own name and 4-digit PIN lock. Watch in crystal clear 4K HDR on TV, Laptop, Phone or Tablet. No interference, uninterrupted streaming with 30 days replacement warranty.',
      durationMonths: 1,
      price: 189.0,
      originalPrice: 649.0,
      accessType: AccessType.PRIVATE_PROFILE,
      accountType: 'Private Profile',
      deviceLimit: '1 Screen at a time',
      quality: '4K UHD + HDR',
      region: 'India / Global',
      terms: 'Do not change main account password or master email. Use only your allocated PIN protected profile.',
      instructions: 'Log in with the credentials provided below. Select Profile "Slot #3 - VIP". Enter your 4-digit PIN to access.',
      availableStock: 4,
      totalStock: 5,
      status: ListingStatus.ACTIVE,
      isFeatured: true,
      credentials: [
        { email: 'vip.netf.user1@cloudpass.me', cred: 'Pass: NetfVip#2026! | Profile: VIP 1 | PIN: 1407' },
        { email: 'vip.netf.user2@cloudpass.me', cred: 'Pass: NetfVip#2026! | Profile: VIP 2 | PIN: 8821' },
        { email: 'vip.netf.user3@cloudpass.me', cred: 'Pass: NetfVip#2026! | Profile: VIP 3 | PIN: 3942' },
        { email: 'vip.netf.user4@cloudpass.me', cred: 'Pass: NetfVip#2026! | Profile: VIP 4 | PIN: 6201' },
      ],
    },
    {
      sellerId: seller1Profile.id,
      platformId: platMap.get('chatgpt-plus')!,
      categoryId: catMap.get('ai-tools')!,
      title: 'ChatGPT Plus (GPT-4o & Advanced Voice) - Shared Workspace',
      slug: 'chatgpt-plus-shared-access',
      planName: 'ChatGPT Plus Monthly',
      description: 'Get full access to GPT-4o, DALL-E 3 image generation, Web Browsing, Code Interpreter, and Custom GPT store. High rate limits with seamless 1-click access.',
      durationMonths: 1,
      price: 349.0,
      originalPrice: 1999.0,
      accessType: AccessType.SHARED_SCREEN,
      accountType: 'Shared Workspace',
      deviceLimit: '1 Device',
      quality: 'GPT-4o Turbo',
      region: 'Global',
      terms: 'Do not share credentials outside. Clear your chat history if sensitive data is entered.',
      instructions: 'Login at chatgpt.com using the account credentials. Do not attempt password changes.',
      availableStock: 3,
      totalStock: 4,
      status: ListingStatus.ACTIVE,
      isFeatured: true,
      credentials: [
        { email: 'ai.vault.sub1@cloudpass.me', cred: 'Pass: GptPro#2026$OpenAI | 2FA: Instant Session' },
        { email: 'ai.vault.sub2@cloudpass.me', cred: 'Pass: GptPro#2026$OpenAI | 2FA: Instant Session' },
        { email: 'ai.vault.sub3@cloudpass.me', cred: 'Pass: GptPro#2026$OpenAI | 2FA: Instant Session' },
      ],
    },
    {
      sellerId: seller2Profile.id,
      platformId: platMap.get('spotify-premium')!,
      categoryId: catMap.get('music-audio')!,
      title: 'Spotify Premium - 3 Months Family Invite to Your Own Account',
      slug: 'spotify-premium-3-months-invite',
      planName: 'Family Plan Invite (3 Months)',
      description: 'Upgrades your personal Spotify account to Spotify Premium! Keep all your existing playlists, liked songs, and algorithmic recommendations. Ad-free music with Very High 320kbps audio quality.',
      durationMonths: 3,
      price: 199.0,
      originalPrice: 599.0,
      accessType: AccessType.FAMILY_INVITE,
      accountType: 'Personal Account Upgrade',
      deviceLimit: 'Unlimited Personal Devices',
      quality: '320kbps Extreme Audio',
      region: 'India',
      terms: 'Requires a standard free Spotify account not part of another family in the last 12 months.',
      instructions: 'Open the invite link provided, enter the family home address given in the delivery details, and click accept.',
      availableStock: 5,
      totalStock: 5,
      status: ListingStatus.ACTIVE,
      isFeatured: true,
      credentials: [
        { email: 'spot.inv.family1@primestream.me', cred: 'Invite URL: https://spotify.com/family/join/invite/cp981x | Address: 42 MG Road, Bengaluru 560001' },
        { email: 'spot.inv.family2@primestream.me', cred: 'Invite URL: https://spotify.com/family/join/invite/cp982x | Address: 42 MG Road, Bengaluru 560001' },
        { email: 'spot.inv.family3@primestream.me', cred: 'Invite URL: https://spotify.com/family/join/invite/cp983x | Address: 42 MG Road, Bengaluru 560001' },
        { email: 'spot.inv.family4@primestream.me', cred: 'Invite URL: https://spotify.com/family/join/invite/cp984x | Address: 42 MG Road, Bengaluru 560001' },
        { email: 'spot.inv.family5@primestream.me', cred: 'Invite URL: https://spotify.com/family/join/invite/cp985x | Address: 42 MG Road, Bengaluru 560001' },
      ],
    },
    {
      sellerId: seller1Profile.id,
      platformId: platMap.get('canva-pro')!,
      categoryId: catMap.get('design-creative')!,
      title: 'Canva Pro 1 Year - Edu/Team Brand Invite to Your Email',
      slug: 'canva-pro-1-year-brand-team',
      planName: 'Canva Pro 12 Months',
      description: 'Full Canva Pro unlocked on your personal email! Access 100M+ premium stock photos, graphics, brand kits, background remover, and all Magic AI features.',
      durationMonths: 12,
      price: 249.0,
      originalPrice: 3999.0,
      accessType: AccessType.FAMILY_INVITE,
      accountType: 'Personal Email Invite',
      deviceLimit: 'All Devices (Web, iOS, Android)',
      quality: 'Vector SVG & Ultra 4K Export',
      region: 'Global',
      terms: 'Invite link binds to your personal existing or new Canva account.',
      instructions: 'Click the invitation link, accept join team, and switch team dropdown to "Canva Pro VIP Team".',
      availableStock: 10,
      totalStock: 10,
      status: ListingStatus.ACTIVE,
      isFeatured: true,
      credentials: [
        { email: 'canva.team.slot1@cloudpass.me', cred: 'Invite Link: https://www.canva.com/brand/join?token=canva_vip_tk881920' },
        { email: 'canva.team.slot2@cloudpass.me', cred: 'Invite Link: https://www.canva.com/brand/join?token=canva_vip_tk881921' },
        { email: 'canva.team.slot3@cloudpass.me', cred: 'Invite Link: https://www.canva.com/brand/join?token=canva_vip_tk881922' },
      ],
    },
    {
      sellerId: seller2Profile.id,
      platformId: platMap.get('youtube-premium')!,
      categoryId: catMap.get('music-audio')!,
      title: 'YouTube Premium + YT Music - 6 Months Family Group',
      slug: 'youtube-premium-6-months-family',
      planName: 'Family Group Invite (6 Months)',
      description: 'Zero ads on all videos, background playback on mobile when locked, picture-in-picture mode, and full YouTube Music Premium app access.',
      durationMonths: 6,
      price: 299.0,
      originalPrice: 1134.0,
      accessType: AccessType.FAMILY_INVITE,
      accountType: 'Google Account Upgrade',
      deviceLimit: 'Smart TV, Mobile, Desktop',
      quality: 'Enhanced 1080p Premium Bitrate',
      region: 'India',
      terms: 'Google account must not be currently in any active Google Family group.',
      instructions: 'Open the Google Family link sent to your email or delivery box, click Accept, and enjoy ad-free YouTube.',
      availableStock: 6,
      totalStock: 6,
      status: ListingStatus.ACTIVE,
      isFeatured: false,
      credentials: [
        { email: 'yt.fam.group1@primestream.me', cred: 'Google Family Invite URL: https://families.google.com/join/yt_sub_9921a' },
        { email: 'yt.fam.group2@primestream.me', cred: 'Google Family Invite URL: https://families.google.com/join/yt_sub_9922b' },
      ],
    },
    {
      sellerId: seller1Profile.id,
      platformId: platMap.get('prime-video')!,
      categoryId: catMap.get('ott-streaming')!,
      title: 'Amazon Prime Video - 3 Months Private Profile with PIN',
      slug: 'amazon-prime-video-3-months-private',
      planName: 'Prime Video 3 Months',
      description: 'Stream top movies, web series, and sports in Full HD and 4K UHD. Your own private profile with locked PIN.',
      durationMonths: 3,
      price: 220.0,
      originalPrice: 450.0,
      accessType: AccessType.PRIVATE_PROFILE,
      accountType: 'Private Screen',
      deviceLimit: '1 Device',
      quality: '4K UHD',
      region: 'India',
      terms: 'Use only the allocated profile.',
      instructions: 'Login at primevideo.com with email & password. Select Profile 2 with PIN 2026.',
      availableStock: 4,
      totalStock: 4,
      status: ListingStatus.ACTIVE,
      isFeatured: false,
      credentials: [
        { email: 'prime.pass1@cloudpass.me', cred: 'Pass: PrimeStream#99 | Profile: Screen 2 | PIN: 2026' },
      ],
    },
    {
      sellerId: seller2Profile.id,
      platformId: platMap.get('nordvpn')!,
      categoryId: catMap.get('vpn-cloud')!,
      title: 'NordVPN Premium - 1 Year Private License Key',
      slug: 'nordvpn-premium-1-year-license',
      planName: 'NordVPN 1 Year',
      description: 'Protect your browsing with superfast 10Gbps servers across 111 countries. Threat protection blocks malware and ads automatically.',
      durationMonths: 12,
      price: 549.0,
      originalPrice: 4200.0,
      accessType: AccessType.PRIVATE_ACCOUNT,
      accountType: 'Dedicated Account',
      deviceLimit: '6 Simultaneous Devices',
      quality: 'NordLynx Ultra Fast Protocol',
      region: 'Global',
      terms: 'Full warranty for 365 days. Direct login.',
      instructions: 'Download NordVPN app on your PC or phone and enter the credentials.',
      availableStock: 2,
      totalStock: 3,
      status: ListingStatus.ACTIVE,
      isFeatured: true,
      credentials: [
        { email: 'vpn.nord.sec1@primestream.me', cred: 'Pass: NordShield#2026! | Dedicated License 1Y' },
      ],
    },
  ];

  for (const l of listingsData) {
    const { credentials, ...listingFields } = l;
    const listing = await prisma.listing.upsert({
      where: { slug: listingFields.slug },
      update: listingFields,
      create: listingFields,
    });

    // Seed inventory slots for listing
    for (const cred of credentials) {
      const encrypted = encryptData(cred.cred);
      await prisma.listingInventory.create({
        data: {
          listingId: listing.id,
          accountEmailOrId: cred.email,
          encryptedCredentials: encrypted,
          notes: 'Auto-seeded encrypted inventory slot',
          isAssigned: false,
        },
      });
    }
  }

  console.log('✅ Listings and encrypted inventory slots seeded');

  // 6. Seed a sample completed order for buyer so order history, seller reviews, and ratings are live
  const sampleListing = await prisma.listing.findUnique({
    where: { slug: 'netflix-4k-uhd-private-profile' },
  });

  if (sampleListing) {
    const orderNumber = 'SUB-ORD-10029';
    const encryptedDelivery = encryptData('Pass: NetfVip#2026! | Profile: VIP 5 | PIN: 9012');
    
    const existingOrder = await prisma.order.findUnique({
      where: { orderNumber },
    });

    if (!existingOrder) {
      const order = await prisma.order.create({
        data: {
          orderNumber,
          buyerId: buyer.id,
          sellerId: seller1Profile.id,
          totalAmount: 189.0,
          platformFee: 18.9, // 10% fee
          sellerEarning: 170.1,
          status: OrderStatus.COMPLETED,
          deliveryNotes: 'Instant digital delivery completed. Enjoy your 4K UHD profile!',
          encryptedDeliveryData: encryptedDelivery,
          items: {
            create: {
              listingId: sampleListing.id,
              listingTitle: sampleListing.title,
              planName: sampleListing.planName,
              durationMonths: sampleListing.durationMonths,
              unitPrice: 189.0,
              quantity: 1,
              encryptedSlotData: encryptedDelivery,
            },
          },
        },
      });

      // Seller earning record
      await prisma.sellerEarning.create({
        data: {
          sellerWalletId: (await prisma.sellerWallet.findUnique({ where: { sellerProfileId: seller1Profile.id } }))!.id,
          sellerProfileId: seller1Profile.id,
          orderId: order.id,
          grossAmount: 189.0,
          platformFee: 18.9,
          netEarning: 170.1,
          isReleased: true,
        },
      });

      // Review
      await prisma.review.create({
        data: {
          orderId: order.id,
          listingId: sampleListing.id,
          buyerId: buyer.id,
          sellerProfileId: seller1Profile.id,
          rating: 5,
          title: 'Super fast delivery and working 4K Netflix!',
          comment: 'Received PIN and credentials instantly right after paying with my wallet. Profile is completely personal and 4K works without any buffering. Highly recommended seller!',
        },
      });

      // Initial Chat thread between buyer & seller for this order
      const chat = await prisma.chat.create({
        data: {
          orderId: order.id,
          buyerId: buyer.id,
          sellerId: seller1User.id,
          lastMessageAt: new Date(),
        },
      });

      await prisma.chatParticipant.createMany({
        data: [
          { chatId: chat.id, userId: buyer.id },
          { chatId: chat.id, userId: seller1User.id },
        ],
      });

      await prisma.message.createMany({
        data: [
          {
            chatId: chat.id,
            senderId: seller1User.id,
            text: 'Hello Vikram! Your Netflix 4K profile has been activated with PIN 9012. Please let me know if you need any assistance!',
          },
          {
            chatId: chat.id,
            senderId: buyer.id,
            text: 'Thank you Aarav! Logged in and testing on my Smart TV now. Working perfectly in 4K HDR!',
          },
        ],
      });

      // Sample notifications
      await prisma.notification.createMany({
        data: [
          {
            userId: buyer.id,
            type: 'ORDER_DELIVERED',
            title: 'Order Delivered Successfully',
            message: `Your order #${orderNumber} for Netflix Premium 4K has been delivered. Access credentials are now visible in your dashboard.`,
            linkUrl: `/orders/${order.id}`,
          },
          {
            userId: seller1User.id,
            type: 'ORDER_CREATED',
            title: 'New Order Received',
            message: `New purchase for Netflix Premium 4K by Vikram Patel (₹189.00).`,
            linkUrl: `/seller/orders/${order.id}`,
          },
        ],
      });

      // Audit Log for order
      await prisma.auditLog.create({
        data: {
          actorId: buyer.id,
          actorEmail: buyer.email,
          action: 'ORDER_CREATED',
          entity: 'Order',
          entityId: order.id,
          metadata: JSON.stringify({ orderNumber, amount: 189.0, seller: seller1Profile.displayName }),
        },
      });
    }
  }

  console.log('✅ Sample completed order, reviews, chats, and notifications seeded');
  console.log('🎉 SubVault seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
