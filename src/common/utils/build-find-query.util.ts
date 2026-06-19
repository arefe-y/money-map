// src/common/utils/build-find-query.util.ts
import { BadRequestException } from '@nestjs/common';
import {
  Between,
  FindOperator,
  FindOptionsOrder,
  FindOptionsSelectByString,
  ILike,
  In,
  IsNull,
  LessThan,
  LessThanOrEqual,
  MoreThan,
  MoreThanOrEqual,
  Not,
} from 'typeorm';
import { FilterOperators } from '../enums/filter-operators.enum';
import {
  IValidParams,
  FindQueryDto,
  FindQuery,
} from '../interfaces/query-params.interface';

type NestedObject = Record<string, any>;

export default function buildFindQuery<T>(
  queryDto: FindQueryDto,
  validParams: IValidParams,
): FindQuery<T> {
  const { where, sort, relations, select, skip = 0, take = 20 } = queryDto;

  const result: FindQuery<T> = {
    skip: skip * take,
    take: take,
  };

  // Process WHERE filters
  if (where) {
    result.where = processFilters(where, validParams.filters);
  }

  // Process sorting
  if (sort) {
    result.order = processSort(sort, validParams.sort) as FindOptionsOrder<T>;
  }

  // Process relations
  if (relations) {
    result.relations = processRelations(relations, validParams.relations);
  }

  // Process field selection
  if (select) {
    result.select = processSelect(select) as FindOptionsSelectByString<T>;
  }

  return result;
}

function processFilters(
  where: string | string[],
  validFilters: string[],
): Record<string, any> {
  if (typeof validFilters !== 'object') {
    throw new BadRequestException('Invalid filter parameters configuration');
  }

  const filtersArray = Array.isArray(where) ? where : [where];

  // Validate all filters
  const validationResult = filtersArray.every((filter) =>
    validateFilterFormat(filter),
  );
  if (!validationResult) {
    throw new BadRequestException(
      'Invalid filter format. Expected format: property::operator::value',
    );
  }

  const filterData = filtersArray.map((filter) => {
    const parts = filter.split('::');
    if (parts.length < 2) {
      throw new BadRequestException(`Invalid filter structure: ${filter}`);
    }

    const [property, rule, value] = parts;

    // Validate property
    if (validFilters.length > 0 && !validFilters.includes(property)) {
      throw new BadRequestException(`Invalid filter property: ${property}`);
    }

    // Validate operator
    if (!Object.values(FilterOperators).includes(rule as FilterOperators)) {
      throw new BadRequestException(`Invalid filter operator: ${rule}`);
    }

    // Special handling for null operators (no value needed)
    if (
      (rule === FilterOperators.IS_NULL ||
        rule === FilterOperators.IS_NOT_NULL) &&
      value
    ) {
      throw new BadRequestException(`${rule} operator should not have a value`);
    }

    return { property, rule, value: value || undefined };
  });

  return generateWhere(filterData);
}

function validateFilterFormat(filter: string): boolean {
  const generalPattern =
    /^[a-zA-Z0-9_\u06F0-\u06F9._]+::(eq|neq|gt|gte|lt|lte|like|nlike|in|nin|between)::[a-zA-Z\u0621-\u064A0-9\u06F0-\u06F9_: ,-/)()]+$/;
  const nullPattern = /^[a-zA-Z0-9_]+::(isnull|isnotnull)$/;

  return generalPattern.test(filter) || nullPattern.test(filter);
}

function processSort(
  sort: string,
  validSorts: string[],
): Record<string, 'ASC' | 'DESC'> {
  if (typeof validSorts !== 'object') {
    throw new BadRequestException('Invalid sort parameters configuration');
  }

  const sortPattern = /^([a-zA-Z0-9._]+)::(asc|desc)$/i;
  const match = sort.match(sortPattern);

  if (!match) {
    throw new BadRequestException(
      'Invalid sort format. Expected: property::direction',
    );
  }

  const [property, direction] = sort.split('::');

  if (validSorts.length > 0 && !validSorts.includes(property)) {
    throw new BadRequestException(`Invalid sort property: ${property}`);
  }

  return createNestedStructure({
    [property]: direction.toUpperCase() as 'ASC' | 'DESC',
  });
}

function processRelations(
  relations: string,
  validRelations: string[],
): string[] | Record<string, any> {
  if (typeof validRelations !== 'object') {
    throw new BadRequestException('Invalid relations parameters configuration');
  }

  const relationKeys = relations.split(',').map((r) => r.trim());

  relationKeys.forEach((relation) => {
    if (validRelations.length > 0 && !validRelations.includes(relation)) {
      throw new BadRequestException(`Invalid relation: ${relation}`);
    }
  });

  return relationKeys;
}

function processSelect(select: string): string[] {
  return select.split(',').map((s) => s.trim());
}

function generateWhere(
  filters: Array<{ property: string; rule: string; value?: string }>,
): Record<string, any> {
  return filters.reduce((acc, f) => {
    if (!f) return acc;

    let condition: Record<string, any> = {};

    switch (f.rule) {
      case FilterOperators.IS_NULL:
        condition = { [f.property]: IsNull() };
        break;
      case FilterOperators.IS_NOT_NULL:
        condition = { [f.property]: Not(IsNull()) };
        break;
      case FilterOperators.EQUALS:
        condition = { [f.property]: f.value };
        break;
      case FilterOperators.NOT_EQUALS:
        condition = { [f.property]: Not(f.value) };
        break;
      case FilterOperators.GREATER_THAN:
        condition = { [f.property]: MoreThan(f.value) };
        break;
      case FilterOperators.GREATER_THAN_OR_EQUALS:
        condition = { [f.property]: MoreThanOrEqual(f.value) };
        break;
      case FilterOperators.LESS_THAN:
        condition = { [f.property]: LessThan(f.value) };
        break;
      case FilterOperators.LESS_THAN_OR_EQUALS:
        condition = { [f.property]: LessThanOrEqual(f.value) };
        break;
      case FilterOperators.LIKE:
        condition = { [f.property]: ILike(`%${f.value}%`) };
        break;
      case FilterOperators.NOT_LIKE:
        condition = { [f.property]: Not(ILike(`%${f.value}%`)) };
        break;
      case FilterOperators.IN:
        condition = { [f.property]: In(f.value.split(',')) };
        break;
      case FilterOperators.NOT_IN:
        condition = { [f.property]: Not(In(f.value.split(','))) };
        break;
      case FilterOperators.BETWEEN:
        const [start, end] = f.value.split(',');
        if (!start || !end) {
          throw new BadRequestException(
            'BETWEEN operator requires two values separated by comma',
          );
        }
        condition = { [f.property]: Between(start, end) };
        break;
      default:
        return acc;
    }

    return iterativeDeepMerge(acc, createNestedStructure(condition));
  }, {});
}

function createNestedStructure(flatObject: Record<string, any>): NestedObject {
  const result: NestedObject = {};

  Object.entries(flatObject).forEach(([key, value]) => {
    const parts = key.split('.');
    let currentPart = result;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];

      if (i === parts.length - 1) {
        currentPart[part] = value;
      } else {
        if (!currentPart[part]) {
          currentPart[part] = {};
        }
        currentPart = currentPart[part];
      }
    }
  });

  return result;
}

function iterativeDeepMerge(
  target: Record<string, any>,
  source: Record<string, any>,
): Record<string, any> {
  const stack = [{ target, source }];

  while (stack.length > 0) {
    const { target, source } = stack.pop();

    if (
      typeof target === 'object' &&
      typeof source === 'object' &&
      !(source instanceof FindOperator)
    ) {
      for (const key in source) {
        if (source[key] instanceof FindOperator) {
          target[key] = source[key];
        } else if (source[key] && typeof source[key] === 'object') {
          if (!target[key] || typeof target[key] !== 'object') {
            target[key] = Array.isArray(source[key]) ? [] : {};
          }
          stack.push({ target: target[key], source: source[key] });
        } else {
          target[key] = source[key];
        }
      }
    } else if (source instanceof FindOperator) {
      Object.assign(target, source);
    }
  }
  return target;
}
