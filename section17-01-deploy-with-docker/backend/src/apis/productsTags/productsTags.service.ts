import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  IProductsTagsServiceBulkInsert,
  IProductsTagsServiceDelete,
  IProductsTagsServiceFindByNames,
} from './interfaces/products-tags-service.interface';
import { ProductTag } from './entities/productTag.entity';

@Injectable()
export class ProductsTagsService {
  constructor(
    @InjectRepository(ProductTag)
    private readonly productsTagsRepository: Repository<ProductTag>,
  ) {}

  findByNames({ productTags }: IProductsTagsServiceFindByNames) {
    const tagNames = productTags.map((el) => el.replace('#', ''));
    return this.productsTagsRepository.find({
      where: { name: In(tagNames) },
    });
  }

  bulkInsert({ productTags }: IProductsTagsServiceBulkInsert) {
    return this.productsTagsRepository.insert(productTags); // bulk-insert는 save()로는 안됨
  }

  deleteAll({ productTagId }: IProductsTagsServiceDelete) {
    const temp = [];
    productTagId.map((el) => {
      temp.push({ id: el });
    });
    return this.productsTagsRepository.softRemove(temp);
  }
}
