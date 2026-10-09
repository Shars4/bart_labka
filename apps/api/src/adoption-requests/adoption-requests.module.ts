import { Module } from '@nestjs/common';
import {
  AdoptionRequestsController,
  AnimalAdoptionRequestsController,
  MyAdoptionRequestsController,
} from './adoption-requests.controller.js';
import { AdoptionRequestsService } from './adoption-requests.service.js';

@Module({
  controllers: [
    AnimalAdoptionRequestsController,
    MyAdoptionRequestsController,
    AdoptionRequestsController,
  ],
  providers: [AdoptionRequestsService],
})
export class AdoptionRequestsModule {}
