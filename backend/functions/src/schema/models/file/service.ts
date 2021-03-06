import { PaginatedService } from "../../core/services";
import * as Resolver from "../../core/helpers/resolver";
import { permissionsCheck } from "../../core/helpers/permissions";
import { ServiceFunctionInputs, AccessControlMap } from "../../../types";
import * as admin from "firebase-admin";
import { updateTableRow } from "../../core/helpers/sql";

export class FileService extends PaginatedService {
  defaultTypename = "file";

  filterFieldsMap = {
    id: {},
    "createdBy.id": {},
    parentKey: {},
  };

  uniqueKeyMap = {
    primary: ["id"],
  };

  sortFieldsMap = {
    id: {},
    createdAt: {},
  };

  searchFieldsMap = {
    name: {},
  };

  groupByFieldsMap = {};

  accessControl: AccessControlMap = {};

  async updateFileParentKeys(
    userId: string,
    typename: string,
    itemId: string,
    inputsArray: unknown[],
    fieldPath: string[]
  ) {
    const fileIdsArray: Set<number> = new Set();

    inputsArray.forEach((input) => {
      if (Array.isArray(input)) input.forEach((id) => fileIdsArray.add(id));
    });

    // must associate them with the parent item
    if (fileIdsArray.size) {
      // ensure all the files belong to the currentUser
      await updateTableRow(
        {
          fields: {
            parentKey: `${typename}_${itemId}`,
          },
          table: this.typename,
          where: {
            fields: [
              {
                field: "createdBy",
                value: userId,
              },
              {
                field: "id",
                operator: "in",
                value: [...fileIdsArray],
              },
            ],
          },
        },
        fieldPath
      );
    }
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

    // verify location exists and move it into /source folder
    const bucket = admin.storage().bucket();
    const file = bucket.file("temp/" + validatedArgs.location);
    const [metadata] = await file.getMetadata();

    await file.move("source/" + validatedArgs.location);

    const addResults = await Resolver.createObjectType({
      typename: this.typename,
      addFields: {
        id: await this.generateRecordId(fieldPath),
        ...validatedArgs,
        size: metadata.size,
        contentType: metadata.contentType,
        createdBy: req.user!.id,
      },
      req,
      fieldPath,
    });

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
    const item = await this.lookupRecord(
      ["id", "location"],
      validatedArgs,
      fieldPath
    );

    // verify location exists and delete it
    const bucket = admin.storage().bucket();
    const file = bucket.file("source/" + item.location);

    await file.delete();

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
