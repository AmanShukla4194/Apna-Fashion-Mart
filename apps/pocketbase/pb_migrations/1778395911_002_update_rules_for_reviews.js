/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("reviews");
  collection.listRule = "";
  collection.viewRule = "";
  collection.createRule = "@request.auth.role = 'customer'";
  collection.updateRule = "userId = @request.auth.id || @request.auth.role = 'admin'";
  collection.deleteRule = "userId = @request.auth.id || @request.auth.role = 'admin'";
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("reviews");
  collection.listRule = "";
  collection.viewRule = "";
  collection.createRule = "@request.auth.role = 'customer'";
  collection.updateRule = "userId = @request.auth.id";
  collection.deleteRule = "userId = @request.auth.id || @request.auth.role = 'admin'";
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})
