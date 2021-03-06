// import { env } from "../config";
// import * as jwt from "jsonwebtoken";
import * as sqlHelper from "../schema/core/helpers/sql";
import { ApiKey, User } from "../schema/services";
import * as admin from "firebase-admin";
import { userRoleKenum, userPermissionEnum } from "../schema/enums";
import { userRoleToPermissionsMap } from "../schema/helpers/permissions";
import type { ContextUser } from "../types";

export async function validateToken(auth: string): Promise<ContextUser> {
  if (auth.split(" ")[0] !== "Bearer") {
    throw new Error("Invalid token");
  }

  const token = auth.split(" ")[1];

  try {
    // const decoded: string = await jwt.verify(token, env.general.jwt_secret);
    const decodedToken = await admin.auth().verifyIdToken(token);

    // check if firebase_uid exists
    // fetch role from database
    const userResults = await sqlHelper.fetchTableRows({
      select: [{ field: "id" }, { field: "role" }, { field: "permissions" }],
      from: User.typename,
      where: {
        fields: [{ field: "firebaseUid", value: decodedToken.uid }],
      },
    });

    let userRecord = userResults[0];

    const permissions: userPermissionEnum[] = [];

    // user not exists in db
    if (!userRecord) {
      // user not exists, must create

      // get the displayName, photoURL from firebase
      const firebaseUserRecord = await admin.auth().getUser(decodedToken.uid);

      const addUserResults = await sqlHelper.insertTableRow({
        table: User.typename,
        fields: {
          id: await User.generateRecordId([]),
          name: firebaseUserRecord.displayName,
          avatar: firebaseUserRecord.photoURL,
          email: decodedToken.email,
          firebaseUid: decodedToken.uid,
          createdBy: 0,
        },
      });

      // set createdBy to id
      await sqlHelper.updateTableRow({
        table: User.typename,
        fields: {
          createdBy: addUserResults[0].id,
        },
        where: {
          fields: [{ field: "id", value: addUserResults[0].id }],
        },
      });

      // fetch the user
      const createdUserResults = await sqlHelper.fetchTableRows({
        select: [{ field: "id" }, { field: "role" }, { field: "permissions" }],
        from: User.typename,
        where: {
          fields: [{ field: "id", value: addUserResults[0].id }],
        },
      });

      // should exist, as we have just created it
      userRecord = createdUserResults[0];
    }

    const id = userRecord.id;
    const role = userRoleKenum.fromUnknown(userRecord.role);

    if (userRoleToPermissionsMap[role.name]) {
      permissions.push(...userRoleToPermissionsMap[role.name]);
    }

    // if any extra permissions, also add those
    let parsedPermissions = userRecord.permissions
      ? userRecord.permissions
      : [];

    // convert permissions to enums
    parsedPermissions = parsedPermissions.map((ele) =>
      userPermissionEnum.fromName(ele)
    );
    permissions.push(...parsedPermissions);

    const contextUser: ContextUser = {
      id,
      role,
      permissions,
    };

    return contextUser;
  } catch (err) {
    if (!(err instanceof Error))
      throw new Error("An unspecified error has occurred");

    const message = "Token error: " + (err.message || err.name);
    throw new Error(message);
  }
}

export async function validateApiKey(auth: string): Promise<ContextUser> {
  if (!auth) {
    throw new Error("Invalid Api Key");
  }

  try {
    // lookup user by API key
    const apiKeyResults = await sqlHelper.fetchTableRows({
      select: [
        { field: "createdBy.id" },
        { field: "createdBy.role" },
        { field: "createdBy.permissions" },
      ],
      from: ApiKey.typename,
      where: {
        fields: [{ field: "code", value: auth }],
      },
    });

    if (apiKeyResults.length < 1) {
      throw new Error("Invalid Api Key");
    }

    let parsedPermissions = apiKeyResults[0]["createdBy.permissions"] ?? [];

    // convert permissions to enums
    parsedPermissions = parsedPermissions.map((ele) =>
      userPermissionEnum.fromName(ele)
    );

    const role = userRoleKenum.fromUnknown(apiKeyResults[0]["createdBy.role"]);

    return {
      id: apiKeyResults[0]["createdBy.id"],
      role,
      permissions: (userRoleToPermissionsMap[role.name] ?? []).concat(
        parsedPermissions
      ),
    };
  } catch (err: unknown) {
    if (!(err instanceof Error))
      throw new Error("An unspecified error has occurred");

    const message = "Token error: " + (err.message || err.name);
    throw new Error(message);
  }
}
