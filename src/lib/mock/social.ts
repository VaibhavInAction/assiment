import { CATEGORIES, type Category, type ContentItem } from '@/lib/types';
import { demoImage, matchesQuery, paginate, pick, seededRandom } from './random';

/**
 * Mock social media API. The assignment allows a mock for social posts, so
 * posts are generated deterministically from templates per category.
 */
const AUTHORS = [
  { name: 'Tara Singh', handle: '@techie_tara' },
  { name: 'Dev Daily', handle: '@devdaily' },
  { name: 'Maya Chen', handle: '@mayabuilds' },
  { name: 'Arjun Rao', handle: '@arjun_on_air' },
  { name: 'Sofia Lopez', handle: '@sofiawrites' },
  { name: 'Kabir Mehta', handle: '@kabir_kicks' },
  { name: 'Lena Park', handle: '@stargazer_lena' },
  { name: 'Omar Haddad', handle: '@omar_markets' },
  { name: 'Priya Nair', handle: '@fitwithpriya' },
  { name: 'Leo Martin', handle: '@cinephile_leo' },
] as const;

const TOPICS: Record<Category, { hashtags: string[]; posts: string[] }> = {
  technology: {
    hashtags: ['#AI', '#WebDev', '#NextJS', '#OpenSource', '#Gadgets', '#TypeScript'],
    posts: [
      'Shipped a side project this weekend with Next.js and Redux Toolkit. Infinite scroll finally feels smooth!',
      'Hot take: the best feature of any app is a fast search box with a good debounce.',
      'Spent the morning reading about WebGPU. The browser is slowly turning into a game engine.',
      'Reminder: rotate your API keys and never commit your .env files.',
      'Accessibility is not a feature, it is a requirement. Try using your app with only a keyboard today.',
      'Dark mode with CSS custom properties is so much cleaner than duplicating every colour.',
      'Open-source maintainers deserve more thanks. Sponsor a library you use every day.',
      'My new mechanical keyboard did not make me faster, but it made me happier.',
    ],
  },
  business: {
    hashtags: ['#Markets', '#Startups', '#Finance', '#Investing', '#SmallBusiness'],
    posts: [
      'Markets opened green today. Long-term investing still beats trying to time the dip.',
      'Our startup just hit 1,000 paying customers. Bootstrapped and profitable!',
      'Index funds plus patience is still the most underrated money advice out there.',
      'Every small business owner should automate invoicing. It saved me a day every week.',
      'Interest rates explained in one sentence: money gets cheaper or more expensive to borrow.',
      'The best pitch decks are short: problem, solution, traction, ask.',
      'Watching the EV sector closely this quarter. Battery prices keep falling.',
      'Remote teams need clear writing more than they need more meetings.',
    ],
  },
  sports: {
    hashtags: ['#Cricket', '#Football', '#F1', '#Tennis', '#Olympics'],
    posts: [
      'What a finish! Last-ball six to win the match. Cricket never stops surprising me.',
      'That free kick deserves a goal-of-the-season award already.',
      'Strategy call of the year: switching to slicks two laps early in the rain.',
      'Morning run done: 10 km in under 50 minutes for the first time!',
      'The underdog story of this season is better than any movie script.',
      'Respect to the goalkeeper who saved three penalties in the shootout.',
      'Tennis rallies like that are why I stay up past midnight.',
      'Local club training session today. Grassroots sport is where legends start.',
    ],
  },
  entertainment: {
    hashtags: ['#Movies', '#Music', '#Streaming', '#Concerts', '#Anime'],
    posts: [
      'Just watched the new animated musical. The soundtrack is stuck in my head.',
      'Unpopular opinion: the book was better, but the movie’s visuals were stunning.',
      'Concert last night was unreal. The whole stadium sang the final song together.',
      'Need recommendations: what is the best series you binged this month?',
      'Rewatched Interstellar and the docking scene still gives me chills.',
      'That indie album recorded in a bedroom is better than most studio releases.',
      'Movie night lineup: one comedy, one thriller, and lots of popcorn.',
      'The trailer dropped and the internet is already arguing about the ending.',
    ],
  },
  science: {
    hashtags: ['#Space', '#Science', '#Climate', '#Physics', '#Astronomy'],
    posts: [
      'Clear skies tonight and I spotted Jupiter and four of its moons with binoculars.',
      'Space fact: a day on Venus is longer than its year.',
      'Fusion research is making real progress. Clean energy feels closer every year.',
      'Visited the science museum with my niece. Her favourite was the dinosaur skeleton.',
      'Reading about water vapour on exoplanets. Are we alone? Probably not.',
      'Coral reefs are recovering in protected areas. Conservation works when we commit.',
      'The James Webb images still look like paintings to me.',
      'Science communicators who explain hard topics simply are heroes.',
    ],
  },
  health: {
    hashtags: ['#Fitness', '#Wellness', '#Nutrition', '#MentalHealth', '#Sleep'],
    posts: [
      'Day 30 of my daily 20-minute walk. More energy and better sleep already.',
      'Meal prep Sunday: lentils, roasted vegetables and plenty of greens.',
      'Your mental health matters. Taking a rest day is productive too.',
      'Swapped my evening scrolling for reading and I fall asleep faster now.',
      'Drink water, stretch, and step outside. Small habits add up.',
      'Strength training twice a week changed how I feel, not just how I look.',
      'Breathing exercise that helps me: in for 4, hold for 4, out for 6.',
      'Doctors visit done. Regular check-ups catch problems early.',
    ],
  },
  general: {
    hashtags: ['#Today', '#Community', '#Travel', '#Weekend', '#GoodNews'],
    posts: [
      'Our neighbourhood planted 200 trees this weekend. Community spirit is alive!',
      'Took the new high-speed train today. The journey flew by.',
      'Free coding classes at the local library are a brilliant idea.',
      'Sunday plan: farmers market, long walk, and a good book.',
      'Small act of kindness today: a stranger paid for my coffee. Passing it on.',
      'Travel tip: pack half the clothes and twice the snacks.',
      'Good news thread: share one positive thing that happened to you this week.',
      'Rainy day, warm tea and a playlist. Perfect.',
    ],
  },
};

const POST_GAP_MS = 23 * 60 * 1000;

function buildPost(category: Category, round: number, key: string, publishedAt: number): ContentItem {
  const random = seededRandom(key);
  const topic = TOPICS[category];
  const author = pick(AUTHORS, random);
  const first = pick(topic.hashtags, random);
  const second = pick(topic.hashtags.filter((tag) => tag !== first), random);
  const id = `social-${key}`;

  return {
    id,
    type: 'social',
    title: topic.posts[round % topic.posts.length],
    description: '',
    imageUrl: random() < 0.45 ? demoImage(id) : null,
    url: `https://x.com/search?q=${encodeURIComponent(first)}`,
    source: author.name,
    author: author.handle,
    category,
    publishedAt: new Date(publishedAt).toISOString(),
    likes: Math.floor(random() * 4800) + 20,
    hashtags: [first, second],
  };
}

/** Number of distinct posts available for a category selection before templates repeat. */
export function socialPoolSize(categories: Category[]): number {
  return categories.reduce((total, category) => total + TOPICS[category].posts.length, 0);
}

export function getMockSocialPosts(options: {
  categories: Category[];
  page: number;
  pageSize: number;
  now?: number;
}) {
  const { categories, page, pageSize, now = Date.now() } = options;
  const limit = socialPoolSize(categories);
  const start = (page - 1) * pageSize;
  const items: ContentItem[] = [];

  for (let position = start; position < Math.min(start + pageSize, limit); position += 1) {
    const category = categories[position % categories.length];
    const round = Math.floor(position / categories.length);
    if (round >= TOPICS[category].posts.length) continue;
    items.push(buildPost(category, round, `${category}-${round}`, now - position * POST_GAP_MS));
  }

  return { items, hasMore: start + pageSize < limit };
}

export function searchMockSocialPosts(options: { query: string; page: number; pageSize: number; now?: number }) {
  const { query, page, pageSize, now = Date.now() } = options;
  const all = getMockSocialPosts({ categories: [...CATEGORIES], page: 1, pageSize: 1000, now }).items;
  const matches = all.filter((post) =>
    matchesQuery(query, post.title, post.source, post.author, ...(post.hashtags ?? [])),
  );
  return paginate(matches, page, pageSize);
}

export function getMockTrendingSocial(categories: Category[], limit: number, now = Date.now()) {
  const { items } = getMockSocialPosts({ categories, page: 1, pageSize: 1000, now });
  return items.sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0)).slice(0, limit);
}

/** A brand-new post for the real-time stream. */
export function createLivePost(categories: Category[], now = Date.now()): ContentItem {
  const nonce = `${now.toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  const random = seededRandom(nonce);
  const category = pick(categories.length ? categories : CATEGORIES, random);
  const round = Math.floor(random() * TOPICS[category].posts.length);
  return { ...buildPost(category, round, `live-${nonce}`, now), likes: Math.floor(random() * 40) };
}
