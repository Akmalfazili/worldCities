import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

export const AuthGuard: CanActivateFn = (
  next: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService: AuthService = inject(AuthService);
  const router: Router = inject(Router);

  //if the user is authenticated, return true
  if (authService.isAuthenticated()) {
    return true;
  }
  //otherswise redirect to login page
  return router.createUrlTree(['/login'], {
    queryParams: {
      returnUrl: state.url
    }
  });
}
