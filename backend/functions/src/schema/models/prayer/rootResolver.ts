import { Prayer } from "../../services";
import { generateBaseRootResolvers } from "../../core/helpers/rootResolver";

export default {
  ...generateBaseRootResolvers(Prayer, [
    "get",
    "getMultiple",
    "delete",
    "create",
    "update",
  ]),
};
