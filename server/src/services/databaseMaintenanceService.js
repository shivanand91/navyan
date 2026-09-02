import { Application } from "../models/Application.js";
import { ShareLink } from "../models/ShareLink.js";

const LEGACY_APPLICATION_UNIQUE_INDEX = "user_1_internship_1_durationKey_1";
const LEGACY_SHARE_LINK_UNIQUE_INDEX = "owner_1_internship_1";

const dropLegacyApplicationIndex = async () => {
  const collection = Application.collection;

  let indexes;
  try {
    indexes = await collection.indexes();
  } catch (error) {
    if (error?.code !== 26 && error?.codeName !== "NamespaceNotFound") {
      throw error;
    }

    await Application.createIndexes();
    return;
  }

  const legacyIndex = indexes.find(
    (index) =>
      index.name === LEGACY_APPLICATION_UNIQUE_INDEX &&
      index.unique === true
  );

  if (!legacyIndex) {
    return;
  }

  await collection.dropIndex(LEGACY_APPLICATION_UNIQUE_INDEX);
  await Application.createIndexes();
  console.log(`Dropped legacy unique index: ${LEGACY_APPLICATION_UNIQUE_INDEX}`);
};

export const runDatabaseMaintenance = async () => {
  await dropLegacyApplicationIndex();
  const indexes = await ShareLink.collection.indexes().catch((error) => {
    if (error?.code === 26 || error?.codeName === "NamespaceNotFound") return [];
    throw error;
  });
  if (indexes.some((index) => index.name === LEGACY_SHARE_LINK_UNIQUE_INDEX && index.unique)) {
    await ShareLink.collection.dropIndex(LEGACY_SHARE_LINK_UNIQUE_INDEX);
    console.log(`Dropped legacy unique index: ${LEGACY_SHARE_LINK_UNIQUE_INDEX}`);
  }
  await ShareLink.createIndexes();
};
