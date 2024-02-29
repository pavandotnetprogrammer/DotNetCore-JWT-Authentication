using AngularAuthAPI.Context;
using AngularAuthAPI.DTO;
using AngularAuthAPI.Helpers;
using AngularAuthAPI.Models;
using AngularAuthAPI.UtlityServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;

namespace AngularAuthAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _appDbContext;
        private readonly IEmailService _emailService;

        public IConfiguration _configuration { get; }

        public UserController(AppDbContext appDbContext, IConfiguration configuration, IEmailService emailService)
        {
            _appDbContext = appDbContext;
            _configuration = configuration;
            _emailService = emailService;
        }
        [Authorize]
        [HttpGet]
        public async Task<ActionResult<User>> GetAllUsers()
        {
            return Ok(await _appDbContext.Users.ToListAsync());
        }

        [HttpPost("authenticate")]
        public async Task<IActionResult> Authenticate([FromBody] User objUser)
        {
            if (objUser == null)
            {
                return BadRequest();
            }

            var user=await _appDbContext.Users.FirstOrDefaultAsync(x=>x.Username == objUser.Username);

            if (user == null)
            {
                return NotFound(new { Message = "User Not Found!!!" });
            }

            if (!PasswordHasher.VerifyPassword(objUser?.Password, user.Password))
            {
                return BadRequest(new { Message = "Password in incorrect" });
            }

            user.Token = CreateJWT(user);
            var newAccessToken = user.Token;
            var newRefreshToken = CreateRefreshToken();
            user.RefreshToken=newRefreshToken;
            user.RefreshTokenExpiryTime = DateTime.Now.AddDays(5);
            await _appDbContext.SaveChangesAsync();
            //return Ok(new {
            //    Token=user.Token,
            //    Message = "Login Success"
            //});
            return Ok(new TokenApiDto()
            {
                AccessToken=newAccessToken,
                RefreshToken=newRefreshToken
            });
        }

        [HttpPost("register")]
        public async Task<IActionResult> RegisterUser([FromBody]User objUser)
        {
            if (objUser == null)
            {
                return BadRequest();
            }
            if(await CheckUserNameExistsAsync(objUser.Username))
            {
                return BadRequest(new { Message = "Username already exists!" });
            }
            if (await CheckEmailExistsAsync(objUser.Email))
            {
                return BadRequest(new { Message = "Email already exists!" });
            }
            string pass = CheckPasswordStrength(objUser.Password);
            if(!string.IsNullOrEmpty(pass))
            {
                return BadRequest(new { Message = pass });
            }



            objUser.Password=PasswordHasher.HashPassword(objUser.Password);
            objUser.Role = "User";
            objUser.Token = "";
            await _appDbContext.Users.AddAsync(objUser);
            await _appDbContext.SaveChangesAsync();
            return Ok(new { Message = "User Registered." });
        }

        private Task<bool> CheckUserNameExistsAsync(string userName) => _appDbContext.Users.AnyAsync(w=>w.Username==userName);

        private Task<bool> CheckEmailExistsAsync(string email) => _appDbContext.Users.AnyAsync(w => w.Email == email);

        private string CheckPasswordStrength(string password)
        {
            StringBuilder sb = new StringBuilder();
            if (password.Length < 8)
                sb.Append("Minimum password length should be 8" + Environment.NewLine);
            if (!(Regex.IsMatch(password, "[a-z]") && Regex.IsMatch(password, "[A-Z]") && Regex.IsMatch(password, "[0-9]")))
                sb.Append("Password should be Alphanumeric" + Environment.NewLine);
            if (!Regex.IsMatch(password, "[<,>,@,!,#,$,%,^,&,*,(,),_,+,\\[,\\],{,},?,:,;,|,',\\,.,/,~,`,-,=]"))
                sb.Append("Password should contain any special characters" + Environment.NewLine);
            return sb.ToString();
        }

        private string CreateJWT(User user)
        {
            var jwtTokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes("ThisIsMySecretKey1234567891011@123456789");
            var identity = new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.Role, user.Role),
                //new Claim(ClaimTypes.Name, $"{user.FirstName} {user.LastName}")
                new Claim(ClaimTypes.Name, $"{user.Username}")
            });
            var credentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256);
            //var tokendescriptor = new SecurityTokenDescriptor { Subject = identity, Expires = DateTime.Now.AddDays(1), SigningCredentials = credentials };
            var tokendescriptor = new SecurityTokenDescriptor { Subject = identity, Expires = DateTime.Now.AddSeconds(10), SigningCredentials = credentials };
            var token = jwtTokenHandler.CreateToken(tokendescriptor);
            return jwtTokenHandler.WriteToken(token);
        }

        private string CreateRefreshToken()
        {
            var tokenBytes = RandomNumberGenerator.GetBytes(64);
            var refreshToken=Convert.ToBase64String(tokenBytes);

            var tokenInUser=_appDbContext.Users.Any(a=>a.RefreshToken== refreshToken);

            if(tokenInUser)
            {
                return CreateRefreshToken();
            }
            return refreshToken;
        }

        private ClaimsPrincipal GetPrincipleFromExpiredToken(string token)
        {
            var key = Encoding.ASCII.GetBytes("ThisIsMySecretKey1234567891011@123456789");
            var tokenValidationParameters=new TokenValidationParameters
            {
                ValidateAudience=false,
                ValidateIssuer=false,
                ValidateIssuerSigningKey=true,
                IssuerSigningKey= new SymmetricSecurityKey(key),
                ValidateLifetime=false
            };
            var tokenHandler = new JwtSecurityTokenHandler();
            SecurityToken securityToken;
            var principle=tokenHandler.ValidateToken(token,tokenValidationParameters, out securityToken);
            var jwtSecurityToken=securityToken as JwtSecurityToken;
            if(jwtSecurityToken==null || !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256,StringComparison.InvariantCultureIgnoreCase))
            {
                throw new SecurityTokenException("This is invalid token!!!");
            }
            return principle;
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh(TokenApiDto tokenApiDto)
        {
            if (tokenApiDto is null)
                return BadRequest("Invalid Client Request");

            string accessToken=tokenApiDto.AccessToken;
            string refreshToken=tokenApiDto.RefreshToken;

            var pripnciple = GetPrincipleFromExpiredToken(accessToken);
            var username = pripnciple?.Identity?.Name;
            var user = await _appDbContext.Users.FirstOrDefaultAsync(u => u.Username == username);
            if (user is null || user.RefreshToken != refreshToken || user.RefreshTokenExpiryTime <= DateTime.Now)
                return BadRequest("Invalid Request");
            var newAccessToken = CreateJWT(user);
            var newRefreshToken = CreateRefreshToken();
            user.RefreshToken = newRefreshToken;
            await _appDbContext.SaveChangesAsync();
            return Ok(new TokenApiDto()
            {
                AccessToken = newAccessToken,
                RefreshToken = newRefreshToken
            });
        }
        [HttpPost("send-reset-email/{email}")]
        public async Task<IActionResult> SendEmail(string email)
        {
            var user = await _appDbContext.Users.FirstOrDefaultAsync(a => a.Email == email);
            if(user is null)
            {
                return NotFound(new
                {
                    StatusCode = 404,
                    Message = "email doesn't exist!!!"
                });
            }
            var tokenBytes = RandomNumberGenerator.GetBytes(64);
            var emailToken = Convert.ToBase64String(tokenBytes);
            user.ResetPasswordToken = emailToken;
            user.ResetPasswordExpiry = DateTime.Now.AddMinutes(15);
            string from = _configuration["EmailSettings:From"];
            var emailModel = new EmailModel(email, "Reset Password!!", EmailBody.EmailStringBody(email, emailToken));
            _emailService.SendEmail(emailModel);
            _appDbContext.Entry(user).State = EntityState.Modified;
            await _appDbContext.SaveChangesAsync();
            return Ok(new
            {
                StatusCode = 200,
                Message = "Email Sent!!"
            });
        }
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword(ResetPasswordDTO resetPasswordDTO)
        {
            var newToken = resetPasswordDTO.EmailToken.Replace(" ", "+");
            var user = await _appDbContext.Users.AsNoTracking().FirstOrDefaultAsync(a => a.Email == resetPasswordDTO.Email);
            if (user is null)
            {
                return NotFound(new
                {
                    StatusCode = 404,
                    Message = "user doesn't exist!!!"
                });
            }
            var tokenCode = user.ResetPasswordToken;
            DateTime emailTokenExpiry = user.ResetPasswordExpiry;
            if(tokenCode != resetPasswordDTO.EmailToken || emailTokenExpiry < DateTime.Now)
            {
                return BadRequest(new
                {
                    StatusCode = 400,
                    Message = "Invalid Reset Link"
                });
            }
            user.Password = PasswordHasher.HashPassword(resetPasswordDTO.NewPassword);
            _appDbContext.Entry(user).State=EntityState.Modified;
            await _appDbContext.SaveChangesAsync();
            return Ok(new
            {
                StatusCode = 200,
                Message = "Password Reset Successfully!"
            });
        }
    }
}
