/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2190274710")

  // update collection data
  unmarshal({
    "createRule": "",
    "deleteRule": null
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2190274710")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.id != \"\" && user = @request.auth.id",
    "deleteRule": "user = @request.auth.id"
  }, collection)

  return app.save(collection)
})
