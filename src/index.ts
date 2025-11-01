import { Cocobase } from "./core/core";
import type { CocobaseConfig, Document, Collection } from "./types/types";
import {
  getFromLocalStorage,
  mergeUserData,
  setToLocalStorage,
  buildFilterQuery,
  parseFilterKey,
} from "./utils/utils";
import { uploadFile } from "./core/file";

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
