import { Module } from '@nestjs/common';
import {
  AdoptionRequestsController,
  AnimalAdoptionRequestsController,
} from './adoption-requests.controller.js';
import { AdoptionRequestsService } from './adoption-requests.service.js';

@Module({
  controllers: [AnimalAdoptionRequestsController, AdoptionRequestsController],
  providers: [AdoptionRequestsService],
})
export class AdoptionRequestsModule {}
