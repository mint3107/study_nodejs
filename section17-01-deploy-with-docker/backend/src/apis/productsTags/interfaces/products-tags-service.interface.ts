export interface IProductsTagsServiceFindByNames {
  productTags: string[];
}

export interface IProductsTagsServiceBulkInsert {
  productTags: {
    name: string;
  }[];
}

export interface IProductsTagsServiceDelete {
  productTagId: string[];
}
