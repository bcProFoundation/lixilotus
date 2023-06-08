import { Redis, Cluster } from 'ioredis';

export interface IItem<T> {
  id: string;
}

export interface IPaginatedItems<T> {
  items: IItem<T>[];
  count: number;
}

export interface IItemRepository<T> {
  name: string;
  redis: Redis | Cluster;
  set: (item: IItem<T>, expirationInSeconds?: number) => Promise<void>;
  getById: (id: string) => Promise<IItem<T> | null>;
  getAll: () => Promise<IItem<T>[]>;
  getPaginated: (page: number, pageSize: number) => Promise<IPaginatedItems<T>>;
  hasItem: (id: string) => Promise<boolean>;
  deleteById: (id: string) => Promise<void>;
  deleteAll: () => Promise<void>;
  count: () => Promise<number>;
}

/**
 * ISortedItemRepository is an interface that defines the methods for interacting with a
 * sorted item repository that uses Redis as the storage system.
 */
export interface ISortedItemRepository<T> {
  redis: Redis | Cluster;

  /**
   * Sets an item in the repository.
   * @param item - The item to be added.
   * @param score - The score of the item to be added
   */
  set: (item: IItem<T>, score: number) => Promise<void>;

  /**
   * Sets multiple items to the repository
   * @param items - The items to be added.
   * @param scores - The scores of the items to be added.
   */
  setItems: (items: IItem<T>[], scores: number[]) => Promise<void>;

  /**
   * Retrieves the index or the item inside the sorted
   * @param id The ID of the item to get the index in the sorted set
   * @returns The index of the item in the sorted set
   */
  indexOf: (id: string) => Promise<number | null>;

  /**
   * Retrieves an item from the repository by its ID.
   * @param id - The ID of the item to retrieve.
   * @returns The item if found, null otherwise.
   */
  getById: (id: string) => Promise<IItem<T> | null>;

  /**
   * Retrieves all items from the repository.
   * @returns An array of all items in the repository.
   */
  getAll: () => Promise<IItem<T>[]>;

  /**
   * Retrieves a paginated set of items from the repository.
   * @param page - The page number to retrieve.
   * @param pageSize - The number of items per page.
   * @returns An object containing the paginated items and the total count of items.
   */
  getPaginated: (page: number, pageSize: number) => Promise<IPaginatedItems<T>>;

  /**
   * Retrieves the score of an item by its ID.
   * @param id - The ID of the item.
   * @returns The score of the item if found, null otherwise.
   */
  getItemScoreById: (id: string) => Promise<number | null>;

  /**
   * Retrieves items by their scores within a specified range.
   * @param min - The minimum score value.
   * @param max - The maximum score value.
   * @returns An array of items with scores within the specified range.
   */
  getItemsByScore: (min: number, max: number) => Promise<IItem<T>[]>;

  /**
   * Deletes a page of items from the repository.
   * @param page - The page number of items to delete.
   * @param pageSize - The number of items per page.
   */
  deletePage: (page: number, pageSize: number) => Promise<void>;

  /**
   * Checks if an item exists in the repository by its ID.
   * @param id - The ID of the item.
   * @returns A boolean indicating whether the item exists.
   */
  hasItem: (id: string) => Promise<boolean>;

  /**
   * Deletes an item from the repository by its ID.
   * @param id - The ID of the item to delete.
   */
  deleteById: (id: string) => Promise<void>;

  /**
   * Deletes all items from the repository.
   */
  deleteAll: () => Promise<void>;

  /**
   * Retrieves the count of items in the repository.
   * @returns The count of items.
   */
  count: () => Promise<number>;

  /**
   * Retrieves the first N items from the repository.
   * @param n - The number of items to retrieve.
   * @returns An array of the first N items.
   */
  getFirstNItems: (n: number) => Promise<IItem<T>[]>;

  /**
   * Retrieves the last N items from the repository.
   * @param n - The number of items to retrieve.
   * @returns An array of the last N items.
   */
  getLastNItems: (n: number) => Promise<IItem<T>[]>;

  /**
   * Retrieves items within a specified index range.
   * @param start - The starting index.
   * @param end - The ending index.
   *
   * @returns An array of items within the specified index range.
   */
  getItemsInRange: (start: number, end: number) => Promise<IItem<T>[]>;

  /**
   *
   * Checks if any items exist within a specified score range.
   * @param min - The minimum score value.
   * @param max - The maximum score value.
   * @returns A boolean indicating whether any items exist within the specified score range.
   */
  existsInRange: (min: number, max: number) => Promise<boolean>;

  /**
   *
   * Retrieves the next N items with scores greater than a specified score.
   * @param score - The score to compare.
   * @param n - The number of items to retrieve.
   * @returns An array of the next N items with scores greater than the specified score.
   */
  getNextNItemsGreaterThanScore: (score: number, n: number) => Promise<IItem<T>[]>;
}
