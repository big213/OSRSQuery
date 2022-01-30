import * as allServices from "./services";
import "./scalars"; // initialize scalars
export * as Scalars from "./scalars";

import user from "./models/user/typeDef";
import apiKey from "./models/apiKey/typeDef";
import file from "./models/file/typeDef";
import prayer from "./models/prayer/typeDef"
/** END TypeDef Import */

/** END LINK TypeDef Import */

// add the objectTypeDefs for the services with objectTypeDefs
allServices.User.setTypeDef(user);
allServices.ApiKey.setTypeDef(apiKey);
allServices.File.setTypeDef(file);
allServices.Prayer.setTypeDef(prayer)
/** END TypeDef Set */

/** END LINK TypeDef Set */

import User from "./models/user/rootResolver";
import ApiKey from "./models/apiKey/rootResolver";
import Github from "./models/github/rootResolver";
import File from "./models/file/rootResolver";
import Prayer from "./models/prayer/rootResolver"
/** END RootResolver Import */

/** END LINK RootResolver Import */

allServices.User.setRootResolvers(User);
allServices.ApiKey.setRootResolvers(ApiKey);
allServices.Github.setRootResolvers(Github);
allServices.File.setRootResolvers(File);
allServices.Prayer.setRootResolvers(Prayer);
/** END RootResolver Set */

/** END LINK RootResolver Set */
