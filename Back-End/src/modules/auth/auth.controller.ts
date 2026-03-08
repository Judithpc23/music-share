import { Controller, Post, Body, Get } from '@nestjs/common'
import { AuthService } from './auth.service'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-in')
  async signIn(
    @Body() body: { email: string; password: string }
  ) {
    return this.authService.signInWithEmailPassword(
      body.email,
      body.password
    )
  }

  @Post('sign-up')
  async signUp(
    @Body() body: {
      email: string
      password: string
      username: string
      firstName: string
      lastName: string
      bio: string
      privacity: 'public' | 'private'
      mood: string
      img?: string
      favoriteGenres: string[]
      favoriteSong?: string
    }
  ) {
    return this.authService.registerWithEmailPassword(body)
  }

  @Post('sign-out')
  async signOut() {
    return this.authService.signOutUser()
  }

  @Get('session')
  async getSession() {
    return this.authService.getCurrentSession()
  }

  @Get('user')
  async getCurrentUser() {
    return this.authService.getCurrentUser()
  }

  @Get('catalogs')
  async getCatalogs() {
    return this.authService.loadAuthCatalogs()
  }
}
