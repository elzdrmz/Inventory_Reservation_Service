import {
  Controller,
  Post,
  Get,
  Body, 
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { CreateReservationDto } from '../dto/create-reservation.dto';

@Controller()
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Post('reserve')
  @HttpCode(HttpStatus.CREATED)
  async createReservation(@Body() createReservationDto: CreateReservationDto) {
    return this.reservationService.createReservation(createReservationDto);
  }

  @Get('reservations/:id')
  async getReservation(@Param('id') id: string) {
    return this.reservationService.getReservation(id);
  }
}
