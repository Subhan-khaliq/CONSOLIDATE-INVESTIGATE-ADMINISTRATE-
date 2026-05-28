import {IsNotEmpty, Length, IsBoolean, IsInt, Min} from 'class-validator';
import {Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn} from 'typeorm';

@Entity()
export class Product {

  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  @Length(1, 200)
  public name: string;

  @Column({nullable: true})
  public category: string;

  @Column({type: 'text', nullable: true})
  public description: string;

  @Column('int')
  @IsInt()
  @Min(0)
  public amount: number;

  @Column('float')
  public price: number;

  @Column('boolean', {default: false})
  @IsBoolean()
  public hasExpiryDate: boolean;

  @Column()
  @CreateDateColumn()
  public createdAt: Date;

  @Column()
  @UpdateDateColumn()
  public updatedAt: Date;
}
