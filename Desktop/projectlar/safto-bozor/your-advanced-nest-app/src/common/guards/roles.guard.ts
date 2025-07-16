import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator'; // Roles dekoratoridan kalitni import qilish

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // Agar rol talab qilinmasa, ruxsat berish
    }

    const { user } = context.switchToHttp().getRequest();
    // Foydalanuvchi mavjudligini va uning rolini tekshirish
    return user && user.role && requiredRoles.includes(user.role);
  }
}
