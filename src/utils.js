export const calculateAverageRating = (ratings) => {
  if (!ratings || ratings.length === 0) return 0;
  const sum = ratings.reduce((acc, r) => acc + r.stars, 0);
  return (sum / ratings.length).toFixed(1);
};
