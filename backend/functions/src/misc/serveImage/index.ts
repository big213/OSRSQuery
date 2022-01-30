import * as functions from "firebase-functions";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { createHandler } = require("image-resizing");

export const serveImage = functions.https.onRequest(
  createHandler({
    sourceBucket: "osrs-records.appspot.com/source",
    cacheBucket: "osrs-records.appspot.com/cache",
  })
);
