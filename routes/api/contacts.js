const express = require("express");

const router = express.Router();
const controllers = require("../../controllers/contacts");
const { isValidId } = require("../../helpers");
const { authenticate } = require("../../midleware");

router.use(authenticate);
router.get("/", controllers.getListController);

router.get("/:contactId", isValidId, controllers.getContactController);

router.post("/", controllers.postContactController);

router.delete("/:contactId", isValidId, controllers.deleteContactController);

router.put("/:contactId", isValidId, controllers.putContactController);

router.patch(
  "/:contactId/favorite",
  isValidId,
  controllers.patchFavContactController
);

module.exports = router;
