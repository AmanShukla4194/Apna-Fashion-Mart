/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("orders");
  collection.listRule = "customerId = @request.auth.id || @request.auth.role = 'admin'";
  collection.viewRule = "customerId = @request.auth.id || @request.auth.role = 'admin'";
  collection.createRule = "@request.auth.role = 'customer'";
  collection.updateRule = "@request.auth.role = 'admin'";
  collection.deleteRule = "@request.auth.role = 'admin'";
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("orders");
  collection.listRule = "customerId = @request.auth.id";
  collection.viewRule = "customerId = @request.auth.id";
  collection.createRule = "@request.auth.role = 'customer'";
  collection.updateRule = "@request.auth.role = 'admin'";
  collection.deleteRule = "@request.auth.role = 'admin'";
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})
