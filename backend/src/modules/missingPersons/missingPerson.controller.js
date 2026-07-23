import {
  createMissingPersonSchema,
  updateMissingPersonSchema,
} from './missingPerson.validation.js';
import {
  createMissingPerson,
  listMissingPersons,
  getMissingPersonById,
  updateMissingPerson,
  softDeleteMissingPerson,
} from './missingPerson.service.js';
import { AppError } from '../../utils/AppError.js';

export async function create(req, res, next) {
  try {
    const parsed = createMissingPersonSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(
        parsed.error.errors[0]?.message || 'Invalid input',
        422,
        'VALIDATION_ERROR'
      );
    }

    const missingPerson = await createMissingPerson(req.user.id, parsed.data);

    res.status(201).json({
      success: true,
      data: { missingPerson },
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
    const { items, total, page: pageNum, limit: limitNum } = await listMissingPersons(
      req.user,
      { page, limit }
    );

    res.status(200).json({
      success: true,
      data: { missingPersons: items },
      error: null,
      meta: { page: pageNum, limit: limitNum, total },
    });
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const missingPerson = await getMissingPersonById(req.params.id, req.user);
    res.status(200).json({
      success: true,
      data: { missingPerson },
      error: null,
      meta: {},
    });
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const parsed = updateMissingPersonSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(
        parsed.error.errors[0]?.message || 'Invalid input',
        422,
        'VALIDATION_ERROR'
      );
    }

    const missingPerson = await updateMissingPerson(req.params.id, req.user, parsed.data);

    res.status(200).json({
      success: true,
      data: { missingPerson },
      error: null,
      meta: {},
    });
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    await softDeleteMissingPerson(req.params.id, req.user);
    res.status(200).json({
      success: true,
      data: { deleted: true },
      error: null,
      meta: {},
    });
  } catch (err) {
    next(err);
  }
}