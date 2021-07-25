import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type SearchDocument = Search & Document;

@Schema()
export class Search {
  @Prop()
  query: string;

  @Prop()
  results: number;
}

export const SearchSchema = SchemaFactory.createForClass(Search);
