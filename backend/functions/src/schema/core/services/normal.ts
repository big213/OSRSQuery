import * as errorHelper from "../helpers/error";
import { BaseService } from ".";
import {
  countTableRows,
  fetchTableRows,
  SqlOrderByObject,
  SqlSelectQuery,
  SqlSelectQueryObject,
  SqlWhereFieldOperator,
  SqlWhereObject,
} from "../helpers/sql";
import { permissionsCheck } from "../helpers/permissions";

import * as Resolver from "../helpers/resolver";

import {
  GiraffeqlObjectType,
  GiraffeqlRootResolverType,
  GiraffeqlObjectTypeLookup,
  objectTypeDefs,
  GiraffeqlInputType,
  GiraffeqlArgsError,
  GiraffeqlInputTypeLookup,
  GiraffeqlInputFieldType,
  GiraffeqlInitializationError,
  GiraffeqlScalarType,
  GiraffeqlBaseError,
} from "giraffeql";

import { ServiceFunctionInputs } from "../../../types";

import { btoa, escapeRegExp, generateId, isObject } from "../helpers/shared";

export type FieldObject = {
  field?: string;
};

export type FieldMap = {
  [x: string]: FieldObject;
};

export type ExternalQuery = {
  [x: string]: any;
};

export type KeyMap = {
  [x: string]: string[];
};

export class NormalService extends BaseService {
  typeDef!: GiraffeqlObjectType;

  typeDefLookup: GiraffeqlObjectTypeLookup;

  inputTypeDef!: GiraffeqlInputType;

  inputTypeDefLookup: GiraffeqlInputTypeLookup;

  rootResolvers!: { [x: string]: GiraffeqlRootResolverType };

  filterFieldsMap: FieldMap = {};

  // some combination of these fields need to be able to identify a unique record
  uniqueKeyMap: KeyMap = {
    primary: ["id"],
  };

  primaryKeyLength: number = 8;

  sortFieldsMap: FieldMap = {};

  groupByFieldsMap: FieldMap = {};

  searchFieldsMap: FieldMap = {};

  constructor(typename?: string) {
    super(typename);

    this.typeDefLookup = new GiraffeqlObjectTypeLookup(this.typename);

    this.inputTypeDefLookup = new GiraffeqlInputTypeLookup(this.typename);

    process.nextTick(() => {
      const uniqueKeyMap = {};
      Object.entries(this.uniqueKeyMap).forEach(([uniqueKeyName, entry]) => {
        entry.forEach((key) => {
          const typeDefField = this.getTypeDef().definition.fields[key];
          if (!typeDefField) {
            throw new GiraffeqlInitializationError({
              message: `Unique key map field not found. Nested values not allowed`,
            });
          }

          this.getTypeDef().definition.fields[key].allowNull;
          uniqueKeyMap[key] = new GiraffeqlInputFieldType({
            type:
              typeDefField.type instanceof GiraffeqlScalarType
                ? typeDefField.type
                : new GiraffeqlInputTypeLookup(key),
            allowNull: typeDefField.allowNull,
          });
        });
      });

      this.inputTypeDef = new GiraffeqlInputType({
        name: this.typename,

        fields: uniqueKeyMap,
        inputsValidator: (args, fieldPath) => {
          // check if a valid combination of key args exist
          let validKeyCombination = false;
          if (isObject(args)) {
            const argsArray = Object.keys(args);
            for (const keyName in this.uniqueKeyMap) {
              if (
                this.uniqueKeyMap[keyName].every((ele) =>
                  argsArray.includes(ele)
                ) &&
                argsArray.every((ele) =>
                  this.uniqueKeyMap[keyName].includes(ele)
                )
              ) {
                validKeyCombination = true;
                break;
              }
            }
          }

          if (!validKeyCombination) {
            throw new GiraffeqlArgsError({
              message: `Invalid combination of args`,
              fieldPath,
            });
          }
        },
      });
    });
  }

  // set typeDef
  setTypeDef(typeDef: GiraffeqlObjectType) {
    this.typeDef = typeDef;
  }

  getTypeDef() {
    if (this.typeDef) return this.typeDef;

    const typeDefLookup = objectTypeDefs.get(this.typeDefLookup.name);

    if (!typeDefLookup)
      throw new Error(`TypeDef not found '${this.typeDefLookup.name}'`);

    return typeDefLookup;
  }

  @permissionsCheck("get")
  // not currently working
  async subscribeToSingleItem(
    operationName: string,
    {
      req,
      fieldPath,
      args,
      query,
      data = {},
      isAdmin = false,
    }: ServiceFunctionInputs
  ) {
    // args should be validated already
    const validatedArgs = <any>args;
    const selectQuery = query || Object.assign({}, this.presets.default);

    //check if the record and query is fetchable
    const results = await Resolver.getObjectType({
      typename: this.typename,
      req,
      fieldPath,
      externalQuery: selectQuery,
      sqlParams: {
        where: {
          fields: [{ field: "id", value: validatedArgs.id }],
        },
      },
      data,
    });

    if (results.length < 1) {
      throw errorHelper.itemNotFoundError(fieldPath);
    }

    const subscriptionFilterableArgs = {
      id: validatedArgs.id,
    };

    /*
    const channel = await handleJqlSubscription(
      req,
      operationName,
      subscriptionFilterableArgs,
      query || Object.assign({}, this.presets.default)
    );

    return {
      channel_name: channel,
    };
    */
  }

  @permissionsCheck("getMultiple")
  // not currently working
  async subscribeToMultipleItem(
    operationName: string,
    {
      req,
      fieldPath,
      args,
      query,
      data = {},
      isAdmin = false,
    }: ServiceFunctionInputs
  ) {
    // args should be validated already
    const validatedArgs = <any>args;

    const selectQuery = query || Object.assign({}, this.presets.default);

    //check if the query is valid (no need to actually run it)
    /*     if (this.typeDef)
      generateGiraffeqlResolverTreeFromTypeDefinition(
        selectQuery,
        this.typeDef,
        this.typename,
        fieldPath,
        true
      ); */

    // only allowed to filter subscriptions based on these limited args
    const subscriptionFilterableArgs = {
      createdBy: validatedArgs.createdBy,
    };

    /*
    const channel = await handleJqlSubscription(
      req,
      operationName,
      subscriptionFilterableArgs,
      selectQuery
    );

    return {
      channel_name: channel,
    };
    */
  }

  @permissionsCheck("get")
  async getRecord({
    req,
    fieldPath,
    args,
    query,
    data = {},
    isAdmin = false,
  }: ServiceFunctionInputs) {
    // args should be validated already
    const validatedArgs = <any>args;
    await this.handleLookupArgs(args, fieldPath);

    const selectQuery = query ?? Object.assign({}, this.presets.default);

    const whereObject: SqlWhereObject = {
      connective: "AND",
      fields: [],
    };

    data.rootArgs = args;

    whereObject.fields.push(
      ...Object.entries(validatedArgs).map(([field, value]) => ({
        field,
        value,
      }))
    );

    const results = await Resolver.getObjectType({
      typename: this.typename,
      req,
      fieldPath,
      externalQuery: selectQuery,
      sqlParams: {
        where: whereObject,
        limit: 1,
        specialParams: await this.getSpecialParams({
          req,
          fieldPath,
          args,
          query,
          data,
          isAdmin,
        }),
      },
      data,
    });

    if (results.length < 1) {
      throw errorHelper.itemNotFoundError(fieldPath);
    }

    return results[0];
  }

  @permissionsCheck("getMultiple")
  async countRecords({
    req,
    fieldPath,
    args,
    query,
    data = {},
    isAdmin = false,
  }: ServiceFunctionInputs) {
    // args should be validated already
    const validatedArgs = <any>args;

    const whereObject: SqlWhereObject = {
      connective: "AND",
      fields: [],
    };

    if (Array.isArray(validatedArgs.filterBy)) {
      const filterByOrObject: SqlWhereObject = {
        connective: "OR",
        fields: [],
      };
      whereObject.fields.push(filterByOrObject);

      validatedArgs.filterBy.forEach((filterByObject) => {
        const filterByAndObject: SqlWhereObject = {
          connective: "AND",
          fields: [],
        };
        filterByOrObject.fields.push(filterByAndObject);
        Object.entries(filterByObject).forEach(
          ([filterKey, filterKeyObject]) => {
            Object.entries(<any>filterKeyObject).forEach(
              ([operationKey, operationValue]) => {
                filterByAndObject.fields.push({
                  field: this.filterFieldsMap[filterKey].field ?? filterKey,
                  operator: <SqlWhereFieldOperator>operationKey,
                  value: operationValue,
                });
              }
            );
          }
        );
      });
    }

    //handle search fields
    if (validatedArgs.search) {
      const whereSubObject: SqlWhereObject = {
        connective: "OR",
        fields: [],
      };

      for (const prop in this.searchFieldsMap) {
        whereSubObject.fields.push({
          field: this.searchFieldsMap[prop].field ?? prop,
          value: new RegExp(escapeRegExp(validatedArgs.search), "i"),
          operator: "regex",
        });
      }

      whereObject.fields.push(whereSubObject);
    }

    const resultsCount = await Resolver.countObjectType(
      this.typename,
      fieldPath,
      whereObject,
      true
    );

    return resultsCount;
  }

  @permissionsCheck("getMultiple")
  async getRecords({
    req,
    fieldPath,
    args,
    query,
    data = {},
    isAdmin = false,
  }: ServiceFunctionInputs) {
    // args should be validated already
    const validatedArgs = <any>args;
    const selectQuery = query || Object.assign({}, this.presets.default);

    const whereObject: SqlWhereObject = {
      connective: "AND",
      fields: [],
    };

    if (Array.isArray(validatedArgs.filterBy)) {
      const filterByOrObject: SqlWhereObject = {
        connective: "OR",
        fields: [],
      };
      whereObject.fields.push(filterByOrObject);

      validatedArgs.filterBy.forEach((filterByObject) => {
        const filterByAndObject: SqlWhereObject = {
          connective: "AND",
          fields: [],
        };
        filterByOrObject.fields.push(filterByAndObject);
        Object.entries(filterByObject).forEach(
          ([filterKey, filterKeyObject]) => {
            Object.entries(<any>filterKeyObject).forEach(
              ([operationKey, operationValue]) => {
                filterByAndObject.fields.push({
                  field: this.filterFieldsMap[filterKey].field ?? filterKey,
                  operator: <SqlWhereFieldOperator>operationKey,
                  value: operationValue,
                });
              }
            );
          }
        );
      });
    }

    //handle search fields
    if (validatedArgs.search) {
      const whereSubObject: SqlWhereObject = {
        connective: "OR",
        fields: [],
      };

      for (const prop in this.searchFieldsMap) {
        whereSubObject.fields.push({
          field: this.searchFieldsMap[prop].field ?? prop,
          value: new RegExp(escapeRegExp(validatedArgs.search), "i"),
          operator: "regex",
        });
      }

      whereObject.fields.push(whereSubObject);
    }

    let isBeforeQuery = false;

    // set the primary sort params, which must be handled specially. falls back to "id" asc.
    // the sortBy field should be pre-validated through giraffeql validation
    const primarySortByObject =
      Array.isArray(validatedArgs.sortBy) && validatedArgs.sortBy.length
        ? validatedArgs.sortBy[0]
        : {
            field: "id",
            desc: false,
          };

    // process the "after" constraint, if provided
    if (validatedArgs.after) {
      // parse cursor
      const parsedCursor = JSON.parse(btoa(validatedArgs.after));

      const isNullLastValue = parsedCursor.last_value === null;

      const operator = primarySortByObject.desc ? "lte" : "gte";

      const whereAndObject: SqlWhereObject = {
        connective: "AND",
        fields: [
          {
            field: primarySortByObject.field,
            value: parsedCursor.last_value,
            operator: isNullLastValue ? "eq" : operator,
          },
        ],
      };

      const whereOrObject: SqlWhereObject = {
        connective: "OR",
        fields: [whereAndObject],
      };

      // id must be different from the last_id

      whereAndObject.fields.push({
        field: "id",
        value: parsedCursor.last_id,
        operator: "neq",
      });

      if (isNullLastValue) {
        // if operator is > and is null last value, must allow not null
        if (operator === "gte") {
          whereOrObject.fields.push({
            field: primarySortByObject.field,
            value: null,
            operator: "neq",
          });
        }
      } else {
        // if operator is < and not null last value, must allow null
        if (operator === "lte") {
          whereOrObject.fields.push({
            field: primarySortByObject.field,
            value: null,
            operator: "eq",
          });
        }
      }

      whereObject.fields.push(whereOrObject);
    }

    // handle the before constraints, basically the reverse of the args.after case
    if (validatedArgs.before) {
      isBeforeQuery = true;
      // parse cursor
      const parsedCursor = JSON.parse(btoa(validatedArgs.before));

      const isNullLastValue = parsedCursor.last_value === null;

      const operator = primarySortByObject.desc ? "gte" : "lte";

      const whereAndObject: SqlWhereObject = {
        connective: "AND",
        fields: [
          {
            field: primarySortByObject.field,
            value: parsedCursor.last_value,
            operator: isNullLastValue ? "eq" : operator,
          },
        ],
      };

      const whereOrObject: SqlWhereObject = {
        connective: "OR",
        fields: [whereAndObject],
      };

      // id must be neq than the last_id

      whereAndObject.fields.push({
        field: "id",
        value: parsedCursor.last_id,
        operator: "neq",
      });

      if (isNullLastValue) {
        // if operator is > and is null last value, must allow not null
        if (operator === "gte") {
          whereOrObject.fields.push({
            field: primarySortByObject.field,
            value: null,
            operator: "neq",
          });
        }
      } else {
        // if operator is < and not null last value, must allow null
        if (operator === "lte") {
          whereOrObject.fields.push({
            field: primarySortByObject.field,
            value: null,
            operator: "eq",
          });
        }
      }

      whereObject.fields.push(whereOrObject);
    }

    // set limit to args.first or args.last, one of which must be provided
    const limit = Number(validatedArgs.first ?? validatedArgs.last);

    // process sort fields
    const orderBy: SqlOrderByObject[] = [];
    const rawSelect: SqlSelectQueryObject[] = [{ field: "id", as: "last_id" }];

    if (primarySortByObject.field) {
      rawSelect.push({
        field: primarySortByObject.field,
        as: "last_value",
      });

      orderBy.push({
        field: primarySortByObject.field,
        desc: isBeforeQuery
          ? !primarySortByObject.desc
          : primarySortByObject.desc,
      });

      // add secondary, etc. sort parameters
      if (Array.isArray(validatedArgs.sortBy)) {
        orderBy.push(...validatedArgs.sortBy.slice(1));
      }
    }

    const sqlParams: Omit<SqlSelectQuery, "from" | "select"> = {
      where: whereObject,
      orderBy,
      limit,
      specialParams: await this.getSpecialParams({
        req,
        fieldPath,
        args,
        query,
        data,
        isAdmin,
      }),
      distinctOn: undefined,
      groupBy: Array.isArray(validatedArgs.groupBy)
        ? validatedArgs.groupBy.reduce((total, item, index) => {
            if (item in this.groupByFieldsMap) {
              total.push({
                field: this.groupByFieldsMap[item].field ?? item,
              });
            }
            return total;
          }, [])
        : null,
    };

    this.sqlParamsModifier && this.sqlParamsModifier(sqlParams);

    // populate the distinctOn, in case the sqlParamsModifier modified the orderBy
    sqlParams.distinctOn = orderBy.map((ele) => ele.field).concat("id");

    const results = await Resolver.getObjectType({
      typename: this.typename,
      req,
      fieldPath,
      externalQuery: selectQuery,
      rawSelect,
      sqlParams,
      data,
    });

    return validatedArgs.reverse
      ? isBeforeQuery
        ? results
        : results.reverse()
      : isBeforeQuery
      ? results.reverse()
      : results;
  }

  // convert any lookup/joined fields into IDs, in place.
  async handleLookupArgs(args: any, fieldPath: string[]): Promise<void> {
    for (const key in args) {
      const typeField = this.getTypeDef().definition.fields[key]?.type;
      if (
        typeField instanceof GiraffeqlObjectTypeLookup &&
        isObject(args[key])
      ) {
        // get record ID of type, replace object with the ID
        const results = await fetchTableRows({
          select: [{ field: "id" }],
          from: typeField.name,
          where: {
            connective: "AND",
            fields: Object.entries(args[key]).map(([field, value]) => ({
              field,
              value,
            })),
          },
        });

        if (results.length < 1) {
          throw new GiraffeqlBaseError({
            message: `${typeField.name} not found`,
            fieldPath,
          });
        }

        // replace args[key] with the item ID
        args[key] = results[0].id;
      }
    }
  }

  getSpecialParams(inputs: ServiceFunctionInputs): any {
    return undefined;
  }

  sqlParamsModifier(sqlParams: Omit<SqlSelectQuery, "from" | "select">) {}

  // looks up a record using its keys
  async lookupRecord(
    selectFields: string[],
    args: any,
    fieldPath: string[],
    throwError = true
  ): Promise<any> {
    const results = await fetchTableRows({
      select:
        selectFields.length > 0
          ? selectFields.map((field) => ({ field }))
          : [{ field: "id" }],
      from: this.typename,
      where: {
        connective: "AND",
        fields: Object.entries(args).map(([field, value]) => ({
          field,
          value,
        })),
      },
    });

    if (results.length < 1 && throwError) {
      throw new GiraffeqlBaseError({
        message: `${this.typename} not found`,
        fieldPath,
      });
    }

    return results[0] ?? null;
  }

  // look up multiple records
  async lookupMultipleRecord(
    selectFields: string[],
    whereObject: SqlWhereObject,
    fieldPath: string[]
  ): Promise<any> {
    const results = await fetchTableRows({
      select:
        selectFields.length > 0
          ? selectFields.map((field) => ({ field }))
          : [{ field: "id" }],
      from: this.typename,
      where: whereObject,
    });

    return results;
  }

  // count the records matching the criteria
  async getRecordCount(
    whereObject: SqlWhereObject,
    fieldPath: string[]
  ): Promise<any> {
    const recordsCount = await countTableRows({
      from: this.typename,
      where: whereObject,
    });

    return recordsCount;
  }

  isEmptyQuery(query: unknown) {
    return isObject(query) && Object.keys(query).length < 1;
  }

  // generates a valid unique ID for this record
  // will try 3 times before calling it quits
  async generateRecordId(fieldPath: string[], attempt = 0) {
    // if 3 or more tries, throw err
    if (attempt > 2) {
      throw new Error(
        "Unable to generate unique ID for this record after 3 tries"
      );
    }

    const id = await generateId(this.primaryKeyLength);
    // check if the id already is in use
    const recordsCount = await this.getRecordCount(
      {
        fields: [
          {
            field: "id",
            value: id,
          },
        ],
      },
      fieldPath
    );

    if (recordsCount < 1) {
      return id;
    }

    return this.generateRecordId(fieldPath, ++attempt);
  }

  @permissionsCheck("create")
  async createRecord({
    req,
    fieldPath,
    args,
    query,
    data = {},
    isAdmin = false,
  }: ServiceFunctionInputs) {
    // args should be validated already
    const validatedArgs = <any>args;
    await this.handleLookupArgs(args, fieldPath);

    const addResults = await Resolver.createObjectType({
      typename: this.typename,
      addFields: {
        id: await this.generateRecordId(fieldPath),
        ...validatedArgs,
        createdBy: req.user!.id,
      },
      req,
      fieldPath,
    });

    // do post-create fn, if any
    await this.afterCreateProcess(
      {
        req,
        fieldPath,
        args,
        query,
        data,
        isAdmin,
      },
      addResults.id
    );

    return this.isEmptyQuery(query)
      ? {}
      : await this.getRecord({
          req,
          args: { id: addResults.id },
          query,
          fieldPath,
          isAdmin,
          data,
        });
  }

  async afterCreateProcess(inputs: ServiceFunctionInputs, itemId: string) {}

  @permissionsCheck("update")
  async updateRecord({
    req,
    fieldPath,
    args,
    query,
    data = {},
    isAdmin = false,
  }: ServiceFunctionInputs) {
    // args should be validated already
    const validatedArgs = <any>args;

    const item = await this.lookupRecord(["id"], validatedArgs.item, fieldPath);

    // convert any lookup/joined fields into IDs
    await this.handleLookupArgs(validatedArgs.fields, fieldPath);

    await Resolver.updateObjectType({
      typename: this.typename,
      id: item.id,
      updateFields: {
        ...validatedArgs.fields,
        updatedAt: 1,
      },
      req,
      fieldPath,
    });

    // do post-update fn, if any
    await this.afterUpdateProcess(
      {
        req,
        fieldPath,
        args,
        query,
        data,
        isAdmin,
      },
      item.id
    );

    return this.isEmptyQuery(query)
      ? {}
      : await this.getRecord({
          req,
          args: { id: item.id },
          query,
          fieldPath,
          isAdmin,
          data,
        });
  }

  async afterUpdateProcess(inputs: ServiceFunctionInputs, itemId: string) {}

  @permissionsCheck("delete")
  async deleteRecord({
    req,
    fieldPath,
    args,
    query,
    data = {},
    isAdmin = false,
  }: ServiceFunctionInputs) {
    // args should be validated already
    const validatedArgs = <any>args;
    // confirm existence of item and get ID
    const item = await this.lookupRecord(["id"], validatedArgs, fieldPath);

    // first, fetch the requested query, if any
    const requestedResults = this.isEmptyQuery(query)
      ? {}
      : await this.getRecord({
          req,
          args,
          query,
          fieldPath,
          isAdmin,
          data,
        });

    await Resolver.deleteObjectType({
      typename: this.typename,
      id: item.id,
      req,
      fieldPath,
    });

    return requestedResults;
  }
}
