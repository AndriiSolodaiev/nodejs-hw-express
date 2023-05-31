const { Contact, addScheme, updateFavScheme } = require("../../models/contact");
const { ctrlWrapper, HttpError } = require("../../helpers");

async function getListController(req, res) {
  const { _id: owner } = req.user;
  const { page = 1, limit = 10, favorite } = req.query;
  const findParams = favorite ? { owner, favorite } : { owner };
  const skip = (page - 1) * limit;

  const result = await Contact.find(findParams, "-createAt -updateAt", {
    skip,
    limit,
  }).populate("owner", "email subscription");

  if (result.length === 0) {
    return res.status(204).json({ message: "No Content" });
  }
  res.json(result);
}

async function getContactController(req, res, next) {
  const { contactId } = req.params;
  const { _id: owner } = req.user;

  const result = await Contact.findOne({ _id: contactId, owner });
  if (!result) {
    throw HttpError(404, "Not Found");
  }

  res.json(result);
}

async function postContactController(req, res, next) {
  const { error } = addScheme.validate(req.body);
  if (error) {
    throw HttpError(400, error.message);
  }
  const { _id: owner } = req.user;

  const result = await Contact.create({ ...req.body, owner });
  res.status(201).json(result);
}

async function deleteContactController(req, res, next) {
  const { contactId } = req.params;
  const result = await Contact.findByIdAndDelete(contactId);
  if (!result) {
    throw HttpError(404, "Not found");
  }
  res.json(result);
}

async function putContactController(req, res, next) {
  if (!req.body) {
    throw HttpError(400, "missing fields");
  }
  const { error } = addScheme.validate(req.body);
  if (error) {
    throw HttpError(400, error.message);
  }
  const { contactId } = req.params;
  const result = await Contact.findByIdAndUpdate(contactId, req.body, {
    new: true,
  });

  if (!result) {
    throw HttpError(404, "Not found");
  }
  res.json(result);
}

async function patchFavContactController(req, res, next) {
  const { error } = updateFavScheme.validate(req.body);
  if (error) {
    throw HttpError(400, error.message);
  }
  const { contactId } = req.params;

  const result = await Contact.findByIdAndUpdate(contactId, req.body, {
    new: true,
  });
  if (!result) {
    throw HttpError(404, "Not found");
  }
  res.json(result);
}

module.exports = {
  getListController: ctrlWrapper(getListController),
  getContactController: ctrlWrapper(getContactController),
  postContactController: ctrlWrapper(postContactController),
  deleteContactController: ctrlWrapper(deleteContactController),
  putContactController: ctrlWrapper(putContactController),
  patchFavContactController: ctrlWrapper(patchFavContactController),
};
