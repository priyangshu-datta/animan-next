import Joi from 'joi';

const getReviewSchema = Joi.object({
  media_id: Joi.number().required(),
  media_id_from: Joi.string().valid('anilist', 'mal', 'kitsu'),

  id_or_all: Joi.string(),
});

const deleteReviewSchema = Joi.object({
  review_id: Joi.string().required(),
});

const createReviewSchema = Joi.object({
  media_id: Joi.number().required(),
  // media_id_from: Joi.string().valid('anilist', 'mal', 'kitsu'),
  episode: Joi.number().required(),

  review: Joi.string().min(10).required(),
  rating: Joi.number().max(10.0).min(0.0),
  favourite: Joi.bool(),
  emotions: Joi.array().items(Joi.string()),
});

const updateReviewSchema = Joi.object({
  review_id: Joi.string().required(),
  episode: Joi.number().required(),
  review: Joi.string().min(10).required(),
  rating: Joi.number().max(10.0).min(0.0).precision(2),
  favourite: Joi.bool(),
  emotions: Joi.array().items(Joi.string()),
});

export {
  getReviewSchema,
  deleteReviewSchema,
  createReviewSchema,
  updateReviewSchema,
};
