using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using worldCities.Server.Data;
using worldCities.Server.Data.Models;

namespace worldCities.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController:ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly JwtHandler _jwtHandler;

        public AccountController(ApplicationDbContext context, UserManager<ApplicationUser> userManager, JwtHandler jwtHandler)
        {
            _context = context;
            _userManager = userManager;
            _jwtHandler = jwtHandler;
        }

        [HttpPost("Login")]
        public async Task<IActionResult> Login(ApiLoginRequest loginRequest)
        {

            var user = await _userManager.FindByNameAsync(loginRequest.Email);
            if(user == null || !await _userManager.CheckPasswordAsync(user,loginRequest.Password))
            {
                return Unauthorized(new ApiLoginResult()
                {
                    Success = false,
                    Message = "Invalid Email or Password"
                });
            }
            var secToken = await _jwtHandler.GetTokenAsync(user);
            var jwt = new JwtSecurityTokenHandler().WriteToken(secToken);
            return Ok(new ApiLoginResult()
            {
                Success = true,
                Message = "Login successful",
                Token = jwt
            });
        }
        [HttpPost("SignUp")]
        public async Task<IActionResult> SignUp(ApiLoginRequest signUpRequest)
        {
            //var user = await _userManager.FindByNameAsync(signUpRequest.Email);
            //if (user != null)
            //{
            //    return Conflict(new ApiLoginResult()
            //    {
            //        Success = false,
            //        Message = "An account with this email already exists"
            //    });
            //}
            
            //create a new standard ApplicationUser account
            var userRegister = new ApplicationUser()
            {
                SecurityStamp = Guid.NewGuid().ToString(),
                UserName = signUpRequest.Email,
                Email = signUpRequest.Email
            };

            //insert the standard user into the db
            var result = await _userManager.CreateAsync(userRegister,signUpRequest.Password);
            
            if(!result.Succeeded)
            {
                var errors = result.Errors.Select(e => e.Description);
                return BadRequest(new ApiLoginResult()
                {
                    Success = false,
                    Message = string.Join(" ", errors)
                });
            }

            //assign the "RegisteredUser" role
            await _userManager.AddToRoleAsync(userRegister, "RegisteredUser");

            //confirm the email and remove Lockout
            userRegister.EmailConfirmed = true;
            userRegister.LockoutEnabled = false;

            await _context.SaveChangesAsync();

            return Ok(new ApiLoginResult()
            {
                Success = true,
                Message = "Account created successfully"
            });
        }
    }
}
