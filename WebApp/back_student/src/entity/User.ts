import  {compareSync, hashSync} from 'bcryptjs';
import {IsNotEmpty, Length, Matches} from 'class-validator';
import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
@Unique(['username'])
export class User {

  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  @Length(4, 20)
  public username: string;

  @Column()
  @Exclude()
  @Length(8, 100)
  @Matches(/(?=.*[a-z])(?=.*[A-Z]).*/, {
    message: 'Password must contain at least one uppercase and one lowercase letter',
  })
  public password: string;

  @Column()
  @IsNotEmpty()
  public role: string;

  @Column()
  @CreateDateColumn()
  public createdAt: Date;

  @Column()
  @UpdateDateColumn()
  public updatedAt: Date;

  public hashPassword() {
    const rounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);
    this.password = hashSync(this.password, rounds);
  }

  public checkIfUnencryptedPasswordIsValid(unencryptedPassword: string) {
    return compareSync(unencryptedPassword, this.password);
  }
}
