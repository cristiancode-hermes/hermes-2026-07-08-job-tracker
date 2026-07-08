import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/guards/current-user.decorator';
import type { User } from '../users/entities/user.entity';
import { ApiTags } from '@nestjs/swagger';
import { map } from 'rxjs/operators';

@ApiTags('Events')
@Controller('api/events')
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @Get()
  stream(@CurrentUser() _user: User, @Res() res: Response) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    const subscription = this.eventsService.events$
      .pipe(
        map((event) => `event: ${event.type}\ndata: ${JSON.stringify(event.data)}\n\n`),
      )
      .subscribe({
        next: (message) => {
          res.write(message);
        },
        error: () => {},
        complete: () => {},
      });

    // Send initial connection event
    res.write(`event: connected\ndata: {}\n\n`);

    // Keep alive
    const keepAlive = setInterval(() => {
      res.write(': keepalive\n\n');
    }, 30000);

    // Cleanup on close
    res.on('close', () => {
      subscription.unsubscribe();
      clearInterval(keepAlive);
      res.end();
    });
  }
}
