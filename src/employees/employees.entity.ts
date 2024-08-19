// src/entities/User.ts
import { Entity, ObjectIdColumn, ObjectId, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class Employees {
  @Column()
  username!: string;

  @Column()
  firstname!: string;

  @Column()
  lastname!: string

  @Column()
  dateOfBirth!: Date

  @Column()
  emailAddress!: string

  @Column()
  primaryContactNumber!: number

  @Column()
  secondaryContactNumber!: number

  @Column('text')
  address!: string

  @Column()
  qualification!: string

  @Column()
  employmentStatus!: string

  @Column()
  salary!: number

  @Column({array: true})
  skillset!: string[]

  @Column()
  emergencyContact!: number

  @Column('text')
  emergencyAddress!: string

  @Column()
  emergencyRelationship!: string

  @Column('timestamptz')
  createdAt!: Date

  @Column('timestamptz')
  updatedAt!: Date
}
