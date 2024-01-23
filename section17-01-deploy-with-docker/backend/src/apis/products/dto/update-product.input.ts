import { InputType, PartialType } from '@nestjs/graphql';
import { CreateProductInput } from './create-product.input';

@InputType()
export class UpdateProductInput extends PartialType(CreateProductInput) {
  // 아래 내용을 상속받음
  // name?: string;
  // description?: string;
  // price?: number;
}

// pickType(CreateProductInput, ['name'], ['price']); // 특정 컬럼 꺼내기
// OmitType(CreateProductInput, ['description']);
// PartialType(CreateProductInput); // 값을 전부 필수값 빼기
