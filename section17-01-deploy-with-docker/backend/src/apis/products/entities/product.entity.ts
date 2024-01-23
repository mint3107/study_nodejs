import { ProductSaleslocation } from 'src/apis/productsSaleslocations/entities/productSaleslocation.entity';
import { ProductCategory } from 'src/apis/productsCategories/entities/productCategory.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  DeleteDateColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/apis/users/entities/user.entity';
import { ProductTag } from 'src/apis/productsTags/entities/productTag.entity';
import { Field, Int, ObjectType } from '@nestjs/graphql';

@Entity()
@ObjectType()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id: string;

  @Column()
  @Field(() => String)
  name: string;

  @Column()
  @Field(() => String)
  description: string;

  @Column()
  @Field(() => Int)
  price: number;

  @Column({ default: false }) // tinyint
  @Field(() => Boolean)
  isSoldout: boolean;

  @ManyToOne(() => ProductCategory)
  @Field(() => ProductCategory, { nullable: true })
  productCategory: ProductCategory;

  @JoinColumn()
  @OneToOne(() => ProductSaleslocation)
  @Field(() => ProductSaleslocation, { nullable: true })
  productSaleslocation: ProductSaleslocation;

  @JoinTable()
  @ManyToMany(() => ProductTag, (productTags) => productTags.products)
  @Field(() => [ProductTag], { nullable: true })
  productTags: ProductTag[];

  @ManyToOne(() => User)
  @Field(() => User)
  user: User;

  // @CreateDateColumn() // 데이터 등록시 시간 자동 등록
  // createdAt: Date;

  // @UpdateDateColumn() // 데이터 수정시 시간 자동 등록
  // updatedAt: Date;

  @DeleteDateColumn() // 소프트 삭제 시간 기록
  deletedAt: Date;
}
