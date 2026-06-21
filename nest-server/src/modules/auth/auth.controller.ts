import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('user')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() body: { userName: string; userPwd: string }) {
    return this.authService.login(body.userName, body.userPwd);
  }
}
