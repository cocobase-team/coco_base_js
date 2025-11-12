import { Cocobase } from "./core/core.js";
import type { CocobaseConfig, Document, Collection } from "./types/types.js";
import {
  getFromLocalStorage,
  mergeUserData,
  setToLocalStorage,
  buildFilterQuery,
  parseFilterKey,
} from "./utils/utils.js";
import { uploadFile } from "./core/file.js";

export {
  Cocobase,
  getFromLocalStorage,
  mergeUserData,
  setToLocalStorage,
  uploadFile,
  buildFilterQuery,
  parseFilterKey,
};
export type { TokenResponse, AppUser, Query } from "./types/types";
export type { CocobaseConfig, Document, Collection };
export type {
  FilterOperator,
  FilterCondition,
  OrGroup,
  ParsedQuery,
  ParsedFilterKey,
} from "./types/filter";
