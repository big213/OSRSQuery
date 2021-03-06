import * as fs from "fs";

const typename = process.argv[2];

const isLink = false;

const capitalizedTypename =
  typename.charAt(0).toUpperCase() + typename.slice(1);

if (!typename) {
  throw new Error("argument required");
}

// parses templateString and replaces with any params
function processTemplate(
  templateString: string,
  params: { [x in string]: string }
) {
  let templateStringModified = templateString;
  Object.entries(params).forEach(([key, value]) => {
    const currentRegex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
    templateStringModified = templateStringModified.replace(
      currentRegex,
      value
    );
  });

  return templateStringModified;
}

// create the directory
if (!fs.existsSync(`src/schema/models/${typename}`)) {
  fs.mkdirSync(`src/schema/models/${typename}`);
}

const templateFiles = [
  {
    templateFilePath: "src/scripts/templates/rootResolver.txt",
    destFilePath: `src/schema/models/${typename}/rootResolver.ts`,
  },
  {
    templateFilePath: "src/scripts/templates/service.txt",
    destFilePath: `src/schema/models/${typename}/service.ts`,
  },
  {
    templateFilePath: "src/scripts/templates/typeDef.txt",
    destFilePath: `src/schema/models/${typename}/typeDef.ts`,
  },
];

// write the necessary files
templateFiles.forEach((templateFileObject) => {
  const template = fs.readFileSync(templateFileObject.templateFilePath, "utf8");

  fs.writeFileSync(
    templateFileObject.destFilePath,
    processTemplate(template, {
      typename,
      capitalizedTypename,
    })
  );
});

function insertStatementBefore(
  str: string,
  beforePhrase: string,
  statement: string
) {
  let strModified = str;
  const typepDefImportIndex = strModified.indexOf(beforePhrase);

  strModified =
    strModified.slice(0, typepDefImportIndex) +
    statement +
    "\n" +
    strModified.slice(typepDefImportIndex);

  return strModified;
}

const modifiersArray = [
  {
    filePath: "src/schema/index.ts",
    modifiers: [
      {
        section: "TypeDef Import",
        statement: `import ${typename} from "./models/${typename}/typeDef"`,
        linkStatement: `import ${typename} from "./links/${typename}/typeDef"`,
      },
      {
        section: "TypeDef Set",
        statement: `allServices.${capitalizedTypename}.setTypeDef(${typename})`,
        linkStatement: `allServices.${capitalizedTypename}.setTypeDef(${typename})`,
      },
      {
        section: "RootResolver Import",
        statement: `import ${capitalizedTypename} from "./models/${typename}/rootResolver"`,
        linkStatement: `import ${capitalizedTypename} from "./links/${typename}/rootResolver"`,
      },
      {
        section: "RootResolver Set",
        statement: `allServices.${capitalizedTypename}.setRootResolvers(${capitalizedTypename});`,
        linkStatement: `allServices.${capitalizedTypename}.setRootResolvers(${capitalizedTypename});`,
      },
    ],
  },
  {
    filePath: "src/schema/services.ts",
    modifiers: [
      {
        section: "Service Import",
        statement: `import { ${capitalizedTypename}Service } from "./models/${typename}/service"`,
        linkStatement: `import { ${capitalizedTypename}Service } from "./links/${typename}/service"`,
      },
      {
        section: "Service Set",
        statement: `export const ${capitalizedTypename} = new ${capitalizedTypename}Service();`,
        linkStatement: `export const ${capitalizedTypename} = new ${capitalizedTypename}Service();`,
      },
    ],
  },
];

modifiersArray.forEach((modifierObj) => {
  let fileContents = fs.readFileSync(modifierObj.filePath, "utf8");

  modifierObj.modifiers.forEach((modifier) => {
    fileContents = insertStatementBefore(
      fileContents,
      `/** END${isLink ? " LINK" : ""} ${modifier.section} */`,
      isLink ? modifier.linkStatement : modifier.statement
    );
  });

  // replace the file
  fs.writeFileSync(modifierObj.filePath, fileContents);
});

console.log(`Done adding ${typename} model`);
