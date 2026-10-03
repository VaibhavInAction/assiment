import type { Category, ContentItem } from '@/lib/types';
import { demoImage, matchesQuery, paginate } from './random';

interface MockArticle {
  title: string;
  description: string;
  source: string;
}

/** Demo headlines from fictional outlets, used when no NewsAPI key is set. */
const MOCK_ARTICLES: Record<Category, MockArticle[]> = {
  technology: [
    { title: 'Open-source AI models close the gap with commercial assistants', description: 'Community-built language models now match paid tools on coding and reasoning benchmarks, and they run on a laptop.', source: 'Byte Ledger' },
    { title: 'Browsers ship WebGPU everywhere, unlocking console-quality web games', description: 'With every major engine supporting the new graphics API, studios are porting 3D titles straight to the browser.', source: 'Pixel Post' },
    { title: 'Why frontend teams are betting on server components', description: 'Smaller bundles and faster first paint are pushing large apps to move data fetching back to the server.', source: 'Dev Dispatch' },
    { title: 'Smartphone makers race to put on-device AI in mid-range phones', description: 'New chips bring offline translation and photo editing to devices that cost under $300.', source: 'Gadget Wire' },
    { title: 'Passkeys pass one billion users as passwords fade out', description: 'Phishing-resistant sign-in is now the default for most major apps, security researchers report.', source: 'Byte Ledger' },
    { title: 'Space startups use satellite internet to connect remote schools', description: 'Low-orbit constellations bring broadband to villages that never had a wired connection.', source: 'Orbit Journal' },
  ],
  business: [
    { title: 'Markets rally as inflation cools for the third straight month', description: 'Investors cheered softer price data, sending technology and consumer stocks higher.', source: 'Market Brief' },
    { title: 'Small businesses turn to AI bookkeeping to cut admin time', description: 'Owners say automated invoicing saves them a full day of paperwork every week.', source: 'Ledger Daily' },
    { title: 'Electric vehicle sales hit a record share of new cars', description: 'Cheaper batteries and new charging networks pushed EVs past a key milestone this quarter.', source: 'Motor Markets' },
    { title: 'Startup funding rebounds, led by climate and health tech', description: 'Venture investment climbed for the first time in two years as founders target real-world problems.', source: 'Founders Weekly' },
    { title: 'What the four-day work week trial taught 60 companies', description: 'Most participants kept the schedule after productivity held steady and sick days fell.', source: 'Work Life Review' },
    { title: 'UPI-style instant payments spread to new countries', description: 'Real-time bank transfers are reshaping how millions of people pay for everyday goods.', source: 'Fintech Today' },
  ],
  sports: [
    { title: 'Last-ball thriller seals the series in a packed stadium', description: 'A calm final over from the young pacer turned a likely defeat into a famous win.', source: 'Boundary Line' },
    { title: 'Underdogs reach their first football cup final in 40 years', description: 'A late header in extra time sent the travelling fans into wild celebrations.', source: 'Pitch Report' },
    { title: 'Rookie driver claims a surprise pole position in the rain', description: 'Bold tyre choices paid off as the 20-year-old out-qualified both championship leaders.', source: 'Grid Talk' },
    { title: 'Marathon world record falls on a cool, windless morning', description: 'Pacing teams and new shoe technology helped the winner break the mark by 30 seconds.', source: 'Running Times Demo' },
    { title: 'Inside the analytics revolution changing how teams scout talent', description: 'Clubs now rely on tracking data to find undervalued players in smaller leagues.', source: 'Stat Sheet' },
    { title: 'Chess prodigy, 14, becomes the youngest grandmaster this year', description: 'The teenager clinched the title with a precise endgame after six hours of play.', source: 'Board Battles' },
  ],
  entertainment: [
    { title: 'Animated musical becomes the surprise hit of the summer', description: 'Word-of-mouth turned a modest release into the season’s biggest family film.', source: 'Screen Scene' },
    { title: 'Streaming services bet on live events to keep subscribers', description: 'Concerts, award shows and sports are replacing binge drops as the new growth strategy.', source: 'Stream Watch' },
    { title: 'Indie band’s bedroom recording tops global charts', description: 'A song recorded on a laptop for $200 has been streamed over 500 million times.', source: 'Track Record' },
    { title: 'Film festival lineup highlights first-time directors', description: 'Half the competition slate comes from filmmakers presenting their debut features.', source: 'Reel Review' },
    { title: 'Video game adaptations are finally winning over critics', description: 'Faithful storytelling and strong casts are breaking the genre’s long losing streak.', source: 'Pixel Post' },
    { title: 'Theatres report the busiest weekend since 2019', description: 'Three big releases on one weekend brought audiences back to cinemas in large numbers.', source: 'Box Office Daily' },
  ],
  science: [
    { title: 'Space telescope spots water vapour on a distant rocky planet', description: 'The finding makes the world one of the most promising targets in the search for habitable planets.', source: 'Orbit Journal' },
    { title: 'Researchers grow drought-resistant wheat with gene editing', description: 'Field trials show yields held steady even after weeks without rain.', source: 'Lab Notes' },
    { title: 'Fusion experiment sustains plasma for a record six minutes', description: 'Engineers say the result is a key step towards practical fusion power plants.', source: 'Energy Frontier' },
    { title: 'Ancient footprints rewrite the timeline of human migration', description: 'Footprints preserved in volcanic ash are thousands of years older than expected.', source: 'Deep Time' },
    { title: 'Ocean robots map coral reefs in record detail', description: 'Autonomous submarines are creating 3D maps that help scientists track reef recovery.', source: 'Blue Planet Wire' },
    { title: 'Moon mission returns the first samples from the far side', description: 'Space agencies will study the rocks to understand how the Moon formed.', source: 'Orbit Journal' },
  ],
  health: [
    { title: 'A 20-minute daily walk lowers heart risk, large study finds', description: 'Researchers followed 90,000 adults for a decade and saw clear benefits from light activity.', source: 'Wellness Wire' },
    { title: 'New malaria vaccine rollout expands to twelve countries', description: 'Health workers expect the programme to protect millions of children each year.', source: 'Global Health Desk' },
    { title: 'Why sleep matters more than you think for memory', description: 'Brain scans show deep sleep helps move new memories into long-term storage.', source: 'Mind Matters' },
    { title: 'Doctors embrace AI tools to spot skin cancer earlier', description: 'Image-recognition apps flagged suspicious moles with accuracy close to specialists.', source: 'MedTech Today' },
    { title: 'Plant-forward diets linked to longer, healthier lives', description: 'You don’t need to go fully vegetarian to see benefits, nutrition experts say.', source: 'Wellness Wire' },
    { title: 'Workplaces add mental health days to standard leave', description: 'Employers report lower burnout and turnover after making rest days easier to take.', source: 'Work Life Review' },
  ],
  general: [
    { title: 'Cities plant a million trees to fight extreme summer heat', description: 'Urban forests can cool streets by several degrees, and residents are joining in.', source: 'Civic Today' },
    { title: 'High-speed rail line cuts a five-hour trip to ninety minutes', description: 'The new route is expected to take thousands of cars off the road each day.', source: 'Transit Times' },
    { title: 'Volunteers restore a historic library destroyed by floods', description: 'More than 20,000 books were dried, repaired and returned to the shelves.', source: 'Community Herald' },
    { title: 'Record turnout as young voters head to the polls', description: 'Organisers credit social media campaigns and easier registration.', source: 'Civic Today' },
    { title: 'World’s largest solar farm comes fully online in the desert', description: 'The plant can power two million homes during the day.', source: 'Energy Frontier' },
    { title: 'Free coding clubs open in public libraries nationwide', description: 'Kids and adults can learn web development on weekends at no cost.', source: 'Community Herald' },
  ],
};

const HOUR = 60 * 60 * 1000;

function toItem(category: Category, article: MockArticle, index: number, now: number): ContentItem {
  const id = `news-demo-${category}-${index}`;
  return {
    id,
    type: 'news',
    title: article.title,
    description: article.description,
    imageUrl: demoImage(id),
    url: `https://news.google.com/search?q=${encodeURIComponent(article.title)}`,
    source: article.source,
    category,
    // Stagger categories so a mixed feed does not show identical timestamps.
    publishedAt: new Date(now - (index * 3 + category.length) * HOUR).toISOString(),
  };
}

export function getMockNewsByCategory(category: Category, now = Date.now()): ContentItem[] {
  return MOCK_ARTICLES[category].map((article, index) => toItem(category, article, index, now));
}

export function getMockNews(options: {
  categories: Category[];
  page: number;
  pageSize: number;
  query?: string;
  now?: number;
}) {
  const { categories, page, pageSize, query, now = Date.now() } = options;
  const pool = categories
    .flatMap((category) => getMockNewsByCategory(category, now))
    .filter((item) => !query || matchesQuery(query, item.title, item.description, item.source))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  return paginate(pool, page, pageSize);
}
