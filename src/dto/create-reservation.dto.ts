import { IsString, IsInt, Min } from 'class-validator';

export class CreateReservationDto {
  @IsString()
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number; 
}
