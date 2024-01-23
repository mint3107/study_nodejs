import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  IProductsServiceCreate,
  IProductsServiceFindOne,
  IProductsServiceUpdate,
  IProductsServiceCheckSoldout,
  IProductsServiceDelete,
} from './interfaces/products-service.interface';
import { ProductsSaleslocationsService } from '../productsSaleslocations/productsSaleslocations.service';
import { ProductsTagsService } from '../productsTags/productsTags.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,

    private readonly productsSaleslocationsService: ProductsSaleslocationsService,

    private readonly productsTagsService: ProductsTagsService,
  ) {}

  findAll(): Promise<Product[]> {
    return this.productsRepository.find({
      relations: ['productSaleslocation', 'productCategory'],
    });
  }

  findOne({ productId }: IProductsServiceFindOne): Promise<Product> {
    return this.productsRepository.findOne({
      where: { id: productId },
      relations: ['productSaleslocation', 'productCategory'],
    });
  }

  async create({
    createProductInput,
  }: IProductsServiceCreate): Promise<Product> {
    // 1. 상품 하나만 등록할 때 사용하는 방법
    // const result = this.productsRepository.save({
    //   ...createProductInput,
    // });

    // 2. 상품과 상품거래위치 테이블 두개에 같이 등록하는 방법
    const { productSaleslocation, productCategoryId, productTags, ...product } =
      createProductInput;

    // 검증 체크를 위해 서비스를 이용
    // 상품위치 테이블에서 데이터 등록
    const saleslocation = await this.productsSaleslocationsService.create({
      productSaleslocation,
    });

    // 상품태그 등록
    const tagNames = productTags.map((el) => el.replace('#', ''));
    const prevTags = await this.productsTagsService.findByNames({
      productTags,
    });

    // 등록되지 않은 태그 찾기
    const temp = [];
    tagNames.forEach((el) => {
      const isExists = prevTags.find((prevEl) => el === prevEl.name);
      if (!isExists) {
        temp.push({ name: el });
      }
    });

    const newTags = await this.productsTagsService.bulkInsert({
      productTags: temp,
    });
    const tags = [...prevTags, ...newTags.identifiers];

    const result = this.productsRepository.save({
      ...product,
      // productSaleslocation: { id: saleslocation.id },
      productSaleslocation: saleslocation, // 리턴값 받아오기 위해 한꺼번에 등록
      productCategory: {
        id: productCategoryId,
        // 카테고리 name까지 받고 싶으면?
        // => createProductInput에 name까지 포함해서 받아오기
      },
      productTags: tags, // id 배열
    });

    return result;
  }

  async update({
    productId,
    updateProductInput,
  }: IProductsServiceUpdate): Promise<Product> {
    const product = await this.findOne({ productId });
    // const product = await this.productsRepository.findOne({
    //   where: { id: productId },
    // });

    // 검증은 서비스에서 한다
    this.checkSoldout({ product });

    const { productTags, ...ProductInput } = updateProductInput;

    // 태그 찾기
    const tags = productTags.map((el) => el.replace('#', ''));
    const prevTags = await this.productsTagsService.findByNames({
      productTags: tags,
    });

    const temp = [];
    tags.forEach((el) => {
      const isExists = prevTags.find((prevEl) => el === prevEl.name);
      if (!isExists) {
        temp.push({ name: el });
      }
    });

    // 없는 태그 생성
    const newTags = await this.productsTagsService.bulkInsert({
      productTags: temp,
    });

    const tagAll = [...newTags.identifiers, ...prevTags];

    const result = this.productsRepository.save({
      ...product, // 수정 후 수정되지 않은 다른 결과값까지 모두 객체로 돌려 받고 싶을 때
      ...ProductInput,
      productTags: tagAll,
    });

    // save : DB에 저장하고 저장한 데이터를 가져옴
    // insert : 저장한 결과를 객체로 못 돌려받음
    // update : 수정된 결과를 객체로 못 돌려받음
    // create : DB접속과 연관 없음. 등록을 위한 빈 껍데기 객체를 만들기 위함.

    return result;
  }

  async delete({ productId }: IProductsServiceDelete): Promise<boolean> {
    // 1. 실제 DB에서 삭제
    // const result = await this.productsRepository.delete({ id: productId });

    // 2. 소프트 삭제(직접구현) - DB에 데이터가 남아있고 삭제했다고 가정 처리(isDeleted)
    // const result = await this.productsRepository.update({ id: productId }, {isDeleted:true});

    // 3. 소프트 삭제(직접구현) - DB에 삭제날짜를 넣어서 값 존재시 삭제했다고 가정 처리(deletedAt)
    // const result = await this.productsRepository.update({ id: productId }, {deletedAt:new Date()});

    // 4. 소프트 삭제(TypeORM 제공) - softRemove
    // 장점 : 여러ID 한번에 지우기 가능 .softRemove([{id:1},{id:2},{id:3}])
    // 단점 : ID로만 삭제 가능
    // const result = await this.productsRepository.softRemove({ id: productId });

    // 5. 소프트 삭제(TypeORM 제공) - softDelete
    // 장점 : 다른 컬럼으로 삭제 가능
    // 단점 : 한번에 여러개 지우기 불가능(한개만)
    const result = await this.productsRepository.softDelete({ id: productId });
    return result.affected ? true : false;
  }

  // 상품 판매 검증
  checkSoldout({ product }: IProductsServiceCheckSoldout): void {
    if (product.isSoldout) {
      throw new UnprocessableEntityException('이미 판매가 완료된 상품 입니다.');
    }

    // if (product.isSoldout) {
    //   throw new HttpException(
    //     '이미 판매 완료된 상품 입니다.',
    //     HttpStatus.UNPROCESSABLE_ENTITY,
    //   );
    // }
  }
}
