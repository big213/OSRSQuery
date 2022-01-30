import { PaginatedService } from "../../core/services";

import { User } from "../../services";

import * as Resolver from "../../core/helpers/resolver";
import * as sqlHelper from "../../core/helpers/sql";
import * as errorHelper from "../../core/helpers/error";
import * as admin from "firebase-admin";
import { AccessControlMap, ServiceFunctionInputs } from "../../../types";
import { lookupSymbol, StringKeyObject } from "giraffeql";

import { permissionsCheck } from "../../core/helpers/permissions";
import { userRoleKenum } from "../../enums";
import { Root } from "../../../types/schema";
import { isObject } from "giraffeql/lib/helpers/base";
import {
  filterPassesTest,
  isCurrentUser,
  isUserLoggedIn,
} from "../../helpers/permissions";
import { objectOnlyHasFields } from "../../core/helpers/shared";

export class UserService extends PaginatedService {
  defaultTypename = "user";

  presets = {
    default: {
      id: lookupSymbol,
      name: lookupSymbol,
      email: lookupSymbol,
      avatar: lookupSymbol,
      role: lookupSymbol,
      permissions: lookupSymbol,
      createdAt: lookupSymbol,
      updatedAt: lookupSymbol,
      createdBy: {
        id: lookupSymbol,
        name: lookupSymbol,
      },
    },
  };

  filterFieldsMap = {
    id: {},
    "createdBy.name": {},
    isPublic: {},
    role: {},
  };

  sortFieldsMap = {
    id: {},
    createdAt: {},
    updatedAt: {},
  };

  searchFieldsMap = {
    name: {},
  };

  accessControl: AccessControlMap = {
    /*
    Allow if:
    - item isPublic === true
    - OR, item was created by currentUser
    - OR, if requested fields are id, name, avatar ONLY
    */
    get: async ({ req, args, query, fieldPath }) => {
      const record = await this.lookupRecord(
        ["createdBy.id", "isPublic"],
        args,
        fieldPath
      );

      if (record.isPublic) return true;

      if (isCurrentUser(req, record["createdBy.id"])) return true;

      if (
        isObject(query) &&
        objectOnlyHasFields(query, ["id", "name", "avatar"])
      ) {
        return true;
      }

      return false;
    },

    /*
    Allow if:
    - filtering by isPublic === true
    - if requested fields are id, name, avatar ONLY, or NO query
    */
    getMultiple: async ({ req, args, query, fieldPath }) => {
      if (
        (isObject(query) &&
          objectOnlyHasFields(query, ["id", "name", "avatar"])) ||
        !query
      ) {
        return true;
      }

      if (
        filterPassesTest(args.filterBy, (filterObject) => {
          return filterObject["isPublic"]?.eq === true;
        })
      ) {
        return true;
      }

      return false;
    },

    /*
    Allow if:
    - user is currentUser AND update fields ONLY avatar, name, isPublic, pinnedWorkspaces
    */
    update: async ({ req, args }) => {
      if (
        isUserLoggedIn(req) &&
        isCurrentUser(req, req.user!.id) &&
        objectOnlyHasFields(args.fields, [
          "avatar",
          "name",
          "isPublic",
          "pinnedWorkspaces",
        ])
      ) {
        return true;
      }

      return false;
    },
    "*": () => false,
  };

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

    // create firebase user
    const firebaseUser = await admin.auth().createUser({
      email: validatedArgs.email,
      emailVerified: false,
      password: validatedArgs.password,
      displayName: validatedArgs.name,
      disabled: false,
      photoURL: validatedArgs.avatar,
    });

    const addResults = await Resolver.createObjectType({
      typename: this.typename,
      addFields: {
        id: await this.generateRecordId(fieldPath),
        ...validatedArgs,
        firebaseUid: firebaseUser.uid,
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

  // syncs the user record with the firebase auth record
  async syncRecord({
    req,
    fieldPath,
    args,
    query,
    data,
    isAdmin = false,
  }: ServiceFunctionInputs) {
    // args should be validated already
    const validatedArgs = <any>args;
    //check if record exists
    const results = await sqlHelper.fetchTableRows({
      select: [{ field: "id" }, { field: "role" }, { field: "firebaseUid" }],
      from: User.typename,
      where: {
        fields: [{ field: "id", value: data!.id }],
      },
    });

    if (results.length < 1) {
      throw errorHelper.itemNotFoundError(fieldPath);
    }

    const item = results[0];

    // make sure email field, if provided, matches the firebase user email
    if ("email" in validatedArgs) {
      const userRecord = await admin.auth().getUser(item.firebaseUid);
      validatedArgs.email = userRecord.email;
    }

    await Resolver.updateObjectType({
      typename: this.typename,
      id: <number>validatedArgs.id,
      updateFields: {
        ...validatedArgs,
        updatedAt: 1,
      },
      req,
      fieldPath,
    });

    return this.getRecord({
      req,
      args: { id: validatedArgs.id },
      query,
      fieldPath,
    });
  }

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
    // check if record exists, get ID
    const records = await sqlHelper.fetchTableRows({
      select: [{ field: "id" }, { field: "firebaseUid" }, { field: "role" }],
      from: this.typename,
      where: {
        connective: "AND",
        fields: Object.entries(validatedArgs.item).map(([field, value]) => ({
          field,
          value,
        })),
      },
    });

    if (records.length < 1) {
      throw errorHelper.itemNotFoundError(fieldPath);
    }

    const item = records[0];

    // convert any lookup/joined fields into IDs
    await this.handleLookupArgs(validatedArgs.fields, fieldPath);

    //check if target user is more senior admin
    if (
      userRoleKenum[records[0].role] === "ADMIN" &&
      records[0].id < req.user!.id
    ) {
      throw errorHelper.generateError(
        "Cannot update more senior admin user",
        fieldPath,
        401
      );
    }

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

    // update firebase user fields
    const firebaseUserFields = {
      ...("name" in validatedArgs.fields && {
        displayName: validatedArgs.fields.name,
      }),
      ...("avatar" in validatedArgs.fields && {
        photoURL: validatedArgs.fields.avatar,
      }),
      ...("email" in validatedArgs.fields && {
        email: validatedArgs.fields.email,
      }),
      ...("password" in validatedArgs.fields && {
        password: validatedArgs.fields.password,
      }),
    };

    if (Object.keys(firebaseUserFields).length > 0) {
      await admin.auth().updateUser(item.firebaseUid, firebaseUserFields);
    }

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

  @permissionsCheck("delete")
  async deleteRecord({
    req,
    fieldPath,
    args,
    query,
    data,
    isAdmin = false,
  }: ServiceFunctionInputs) {
    // args should be validated already
    const validatedArgs = <Root["deleteUser"]["Args"]>args;

    // confirm existence of item and get ID
    const results = await sqlHelper.fetchTableRows({
      select: [{ field: "id" }, { field: "firebaseUid" }],
      from: this.typename,
      where: {
        connective: "AND",
        fields: Object.entries(validatedArgs).map(([field, value]) => ({
          field,
          value,
        })),
      },
    });

    if (results.length < 1) {
      throw new Error(`${this.typename} not found`);
    }

    const item = results[0];

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

    // remove firebase auth user
    await admin.auth().deleteUser(item.firebaseUid);

    return requestedResults;
  }
}
