const safeParse = (data, fallback) => {
  try {
    return data ? data : fallback;
  } catch {
    return fallback;
  }
};


module.exports = safeParse