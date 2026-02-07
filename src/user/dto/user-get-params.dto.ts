import { MongooseStringFilter } from 'core';

export class UserGetParamsDto {
  @MongooseStringFilter()
  name: any;
}