/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("stores");
  collection.listRule = "";
  collection.viewRule = "";
  collection.createRule = "@request.auth.role = 'vendor'";
  collection.updateRule = "vendorId = @request.auth.id || @request.auth.role = 'admin'";
  collection.deleteRule = "@request.auth.role = 'admin'";
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("stores");
  collection.listRule = "";
  collection.viewRule = "";
  collection.createRule = "@request.auth.role = 'vendor'";
  collection.updateRule = "vendorId = @request.auth.id";
  collection.deleteRule = "vendorId = @request.auth.id";
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})
