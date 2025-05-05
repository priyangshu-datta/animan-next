import Joi from 'joi';

const deleteReviewSchema = Joi.object({
  reviewId: Joi.string().required(),
});

const baseSchema = {
  rating: Joi.number().precision(2).max(10).min(0),
  reviewText: Joi.string().min(10),
  favourite: Joi.boolean(),
  emotions: Joi.array().items(Joi.string()),
  mediaId: Joi.number(),
  mediaType: Joi.string().valid('ANIME', 'MANGA'),
};

const createAnimeReviewSchema = Joi.object({
  subjectType: Joi.string().valid('anime', 'episode', 'season'),
  episodeNumber: Joi.number(),
  season: Joi.string().valid('winter', 'spring', 'summer', 'fall'),
  year: Joi.number(),
  ...baseSchema,
});

const createMangaReviewSchema = Joi.object({
  subjectType: Joi.string().valid('manga', 'chapter', 'volume'),
  chapterNumber: Joi.number(),
  volume: Joi.number(),
  ...baseSchema,
});

const updateAnimeReviewSchema = Joi.object({
  subjectType: Joi.string().valid('anime', 'episode', 'season'),
  episodeNumber: Joi.number().optional(),
  season: Joi.string().valid('winter', 'spring', 'summer', 'fall'),
  year: Joi.number().optional(),
  ...baseSchema,
  reviewId: Joi.string(),
});

const updateMangaReviewSchema = Joi.object({
  subjectType: Joi.string().valid('manga', 'chapter', 'volume'),
  chapterNumber: Joi.number().optional(),
  volume: Joi.number().allow(null),
  ...baseSchema,
  reviewId: Joi.string(),
});

const createCharacterReviewSchema = Joi.object({
  characterId: Joi.number(),
  rating: Joi.number().precision(2).min(0).max(10.0),
  reviewText: Joi.string().min(10),
  favourite: Joi.boolean(),
  emotions: Joi.array().items(Joi.string()),
  associatedMediaId: Joi.number().allow(null),
  associatedMediaType: Joi.string().valid('ANIME', 'MANGA').allow(null),
  role: Joi.string(),
});

const updateCharacterReviewSchema = Joi.object({
  reviewId: Joi.string(),
  rating: Joi.number().precision(2).min(0).max(10.0),
  reviewText: Joi.string().min(10),
  favourite: Joi.boolean(),
  emotions: Joi.array().items(Joi.string()),
  associatedMediaId: Joi.number().allow(null),
  associatedMediaType: Joi.string().valid('ANIME', 'MANGA').allow(null),
  role: Joi.string(),
});

export {
  createAnimeReviewSchema,
  createMangaReviewSchema,
  createCharacterReviewSchema,
  updateAnimeReviewSchema,
  updateMangaReviewSchema,
  updateCharacterReviewSchema,
  deleteReviewSchema,
};
