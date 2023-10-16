// ./utils/cacheFunctions.ts

const DEFAULT_TTL = 60 * 60 * 1000; // 1 hour in milliseconds
const cache: Record<string, { data: any; timestamp: number }> = {};

// Store data in cache
export const storeInCache = async (key: string, data: any) => {
  cache[key] = {
    data,
    timestamp: Date.now(),
  };
  deleteOldCacheEntries();
};

// Retrieve data from cache
export const retrieveFromCache = async (key: string) => {
  const cachedData = cache[key];
  if (!cachedData) {
    return null;
  }

  const currentTime = Date.now();
  const isExpired = currentTime - cachedData.timestamp > DEFAULT_TTL;

  if (isExpired) {
    delete cache[key];
    return null;
  }

  return cachedData.data;
};

// Flush cache by key
export const flushCache = async (key: string) => {
  delete cache[key];
  deleteOldCacheEntries();
};

export const deleteOldCacheEntries = async () => {
  const currentTime = Date.now();
  Object.keys(cache).forEach((key) => {
    const cachedData = cache[key];
    const isExpired = currentTime - cachedData.timestamp > DEFAULT_TTL;
    if (isExpired) {
      delete cache[key];
    }
  });
}
