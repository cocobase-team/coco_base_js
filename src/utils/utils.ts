import { Query } from "../types/types";

function getFromLocalStorage(key: string): string | null {
  try {
    if (
      typeof window !== "undefined" &&
      typeof window.localStorage !== "undefined"
    ) {
      const value = localStorage.getItem(key);
      return value !== null ? value : null;
    }
  } catch (err) {
    console.warn("Error accessing localStorage:", err);
  }
  return null;
}

function setToLocalStorage(key: string, value: string): void {
  try {
    if (
      typeof window !== "undefined" &&
      typeof window.localStorage !== "undefined"
    ) {
      localStorage.setItem(key, value);
    }
  } catch (err) {
    console.warn("Error setting localStorage:", err);
  }
}

function mergeUserData(
  currentData: Record<string, any>,
  newData: Record<string, any>
): Record<string, any> {
  return {
    ...currentData,
    ...Object.fromEntries(
      Object.entries(newData).filter(
        ([_, value]) => value !== null && value !== undefined
      )
    ),
  };
}

function buildFilterQuery({
  filters = {},
  limit = 100,
  offset = 0,
}: Query = {}): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    params.set(key, value);
  }

  params.set("limit", limit.toString());
  params.set("offset", offset.toString());

  return params.toString();
}

const BASEURL = "https://cocobase.pxxl.click";
export {
  getFromLocalStorage,
  setToLocalStorage,
  mergeUserData,
  BASEURL,
  buildFilterQuery,
};
