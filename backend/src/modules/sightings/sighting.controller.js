import { createSightingSchema } from './sighting.validation.js';
import { createSighting, listSightings, verifySighting } from './sighting.service.js';
import { AppError } from '../../utils/AppError.js';

export async function create(req, res, next) {
  try {
    const parsed = createSightingSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(
        parsed.error.errors[0]?.message || 'Invalid input',
        422,
        'VALIDATION_ERROR'
      );
    }

    // req.user is optional here — optionalAuthenticate lets this route
    // accept anonymous citizen reports per the API Specification.
    const sighting = await createSighting(req.user, parsed.data);

    res.status(201).json({
      success: true,
      data: { sighting },
      error: null,
      meta: {},
    });
  } catch (err) {
    next(err);
  }
}

export async function list(req, res, next) {
  try {
    const { page, limit } = req.query;
    const { items, total, page: pageNum, limit: limitNum } = await listSightings(req.user, {
      page,
      limit,
    });

    res.status(200).json({
      success: true,
      data: { sightings: items },
      error: null,
      meta: { page: pageNum, limit: limitNum, total },
    });
  } catch (err) {
    next(err);
  }
}

export async function verify(req, res, next) {
  try {
    const sighting = await verifySighting(req.params.id, req.user, 'verified');
    res.status(200).json({ success: true, data: { sighting }, error: null, meta: {} });
  } catch (err) {
    next(err);
  }
}

export async function markFalse(req, res, next) {
  try {
    const sighting = await verifySighting(req.params.id, req.user, 'false_report');
    res.status(200).json({ success: true, data: { sighting }, error: null, meta: {} });
  } catch (err) {
    next(err);
  }
}