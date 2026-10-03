import type { Category, ContentItem } from '@/lib/types';
import { demoImage, matchesQuery, paginate } from './random';

interface MockMovie {
  title: string;
  year: number;
  rating: number;
  category: Category;
  overview: string;
}

/** Demo movie list used when no TMDB key is set. Ratings are approximate. */
const MOCK_MOVIES: MockMovie[] = [
  { title: 'Interstellar', year: 2014, rating: 8.4, category: 'science', overview: 'Explorers travel through a wormhole near Saturn to find a new home for humanity.' },
  { title: 'The Martian', year: 2015, rating: 7.7, category: 'science', overview: 'An astronaut stranded on Mars uses science and humour to survive until rescue.' },
  { title: 'Hidden Figures', year: 2016, rating: 8.1, category: 'science', overview: 'Three mathematicians help launch the space race from behind the scenes at NASA.' },
  { title: 'Arrival', year: 2016, rating: 7.6, category: 'science', overview: 'A linguist races to understand alien visitors before the world turns to war.' },
  { title: 'Gravity', year: 2013, rating: 7.2, category: 'science', overview: 'Two astronauts fight to get home after debris destroys their space shuttle.' },
  { title: 'The Matrix', year: 1999, rating: 8.2, category: 'technology', overview: 'A hacker learns that his reality is a simulation and joins the fight to free humanity.' },
  { title: 'Ex Machina', year: 2014, rating: 7.6, category: 'technology', overview: 'A programmer tests whether a humanoid robot is truly conscious.' },
  { title: 'Her', year: 2013, rating: 7.9, category: 'technology', overview: 'A lonely writer falls in love with an intelligent operating system.' },
  { title: 'Blade Runner 2049', year: 2017, rating: 7.5, category: 'technology', overview: 'A young blade runner uncovers a secret that could change society forever.' },
  { title: 'The Social Network', year: 2010, rating: 7.4, category: 'technology', overview: 'The story of how a college project became a global social media giant.' },
  { title: 'The Big Short', year: 2015, rating: 7.4, category: 'business', overview: 'A few outsiders predict the 2008 housing crash and bet against the banks.' },
  { title: 'The Wolf of Wall Street', year: 2013, rating: 8.0, category: 'business', overview: 'A stockbroker’s rise to wealth through fraud and excess, and his fall.' },
  { title: 'Margin Call', year: 2011, rating: 6.9, category: 'business', overview: 'One night inside an investment bank at the start of a financial crisis.' },
  { title: 'Steve Jobs', year: 2015, rating: 6.9, category: 'business', overview: 'Three product launches reveal the man behind the personal computer revolution.' },
  { title: 'Moneyball', year: 2011, rating: 7.2, category: 'sports', overview: 'A baseball manager uses statistics to build a winning team on a tiny budget.' },
  { title: 'Ford v Ferrari', year: 2019, rating: 8.0, category: 'sports', overview: 'Engineers and a fearless driver take on Ferrari at the 24 Hours of Le Mans.' },
  { title: 'Rush', year: 2013, rating: 7.7, category: 'sports', overview: 'The rivalry between two Formula 1 drivers during the 1976 season.' },
  { title: 'Dangal', year: 2016, rating: 8.0, category: 'sports', overview: 'A former wrestler trains his daughters to become world-class champions.' },
  { title: 'Creed', year: 2015, rating: 7.4, category: 'sports', overview: 'The son of a boxing legend asks Rocky Balboa to train him.' },
  { title: 'Lagaan', year: 2001, rating: 7.7, category: 'sports', overview: 'Villagers challenge colonial officers to a cricket match to escape a heavy tax.' },
  { title: 'Spider-Man: Into the Spider-Verse', year: 2018, rating: 8.4, category: 'entertainment', overview: 'Teenager Miles Morales meets Spider-heroes from other dimensions.' },
  { title: 'La La Land', year: 2016, rating: 7.9, category: 'entertainment', overview: 'A jazz pianist and an actress chase their dreams in Los Angeles.' },
  { title: 'Coco', year: 2017, rating: 8.2, category: 'entertainment', overview: 'A boy who loves music journeys to the Land of the Dead to learn his family’s story.' },
  { title: 'Paddington 2', year: 2017, rating: 7.6, category: 'entertainment', overview: 'A polite bear is framed for theft and must prove his innocence.' },
  { title: 'Inside Out', year: 2015, rating: 7.9, category: 'entertainment', overview: 'The emotions inside a young girl’s mind help her through a big move.' },
  { title: 'Contagion', year: 2011, rating: 6.8, category: 'health', overview: 'Doctors and officials race to contain a fast-spreading new virus.' },
  { title: 'Awakenings', year: 1990, rating: 7.6, category: 'health', overview: 'A doctor discovers a drug that wakes patients from decades of catatonia.' },
  { title: 'Patch Adams', year: 1998, rating: 7.1, category: 'health', overview: 'A medical student uses humour to heal patients, against the rules.' },
  { title: 'Inception', year: 2010, rating: 8.4, category: 'general', overview: 'A thief who steals secrets through dreams is asked to plant an idea instead.' },
  { title: 'Mad Max: Fury Road', year: 2015, rating: 7.6, category: 'general', overview: 'A desperate chase across a desert wasteland in a war rig.' },
  { title: 'The Dark Knight', year: 2008, rating: 8.5, category: 'general', overview: 'Batman faces the Joker, a criminal who wants to watch Gotham burn.' },
  { title: 'Parasite', year: 2019, rating: 8.5, category: 'general', overview: 'A poor family schemes its way into the lives of a wealthy household.' },
];

function toItem(movie: MockMovie, index: number): ContentItem {
  const id = `movie-demo-${index}`;
  return {
    id,
    type: 'movie',
    title: movie.title,
    description: movie.overview,
    imageUrl: demoImage(id),
    url: `https://www.themoviedb.org/search?query=${encodeURIComponent(movie.title)}`,
    source: 'Demo catalogue',
    category: movie.category,
    publishedAt: new Date(Date.UTC(movie.year, 0, 1)).toISOString(),
    rating: movie.rating,
  };
}

const ALL_MOVIES = MOCK_MOVIES.map(toItem);

export function getMockMovies(options: {
  categories: Category[];
  page: number;
  pageSize: number;
  query?: string;
}) {
  const { categories, page, pageSize, query } = options;
  const pool = query
    ? ALL_MOVIES.filter((movie) => matchesQuery(query, movie.title, movie.description))
    : ALL_MOVIES.filter((movie) => categories.includes(movie.category));
  return paginate(pool, page, pageSize);
}

export function getMockTrendingMovies(limit: number): ContentItem[] {
  return [...ALL_MOVIES].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, limit);
}
