using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;
using System.Threading.Tasks;
using worldCities.Server.Controllers;
using worldCities.Server.Data;
using worldCities.Server.Data.Models;
using Xunit;

namespace WorldCities.Server.Tests
{
    public class SeedController_Tests
    {
        ///Test the CreateDefaultUsers() method
        [Fact]
        public async Task CreateDefaultUsers()
        {
            //Arrange
            //create the option instances required by the ApplicationDbContext
            var options = new DbContextOptionsBuilder<ApplicationDbContext>().UseInMemoryDatabase(databaseName: "WorldCities")
                .Options;

            //create a IWebHost environment for mock instanc
            var mockEnv = Mock.Of<IWebHostEnvironment>();

            //create a IConfiguration mock instance
            var mockConfiguration = new Mock<IConfiguration>();
            mockConfiguration.SetupGet(x => x[It.Is<string>(s => s == "DefaultPasswords:RegisteredUser")]).Returns("M0ckP$$word");
            mockConfiguration.SetupGet(x => x[It.Is<string>(s => s == "DefaultPasswords:Administrator")]).Returns("M0ckP$$word");
            
            //create a ApplicationDbContext instance using the in memory db
            using var context = new ApplicationDbContext(options);
            
            //create a RoleManager instance
            var roleManager=IdentityHelper.GetRoleManager(new RoleStore<IdentityRole>(context));

            //create a UserManager instance
            var userManager = IdentityHelper.GetUserManager(new UserStore<ApplicationUser>(context));

            //create a seedController instance
            var controller = new SeedController(context, mockEnv,roleManager, userManager,mockConfiguration.Object);

            //define the variables for the users we want to test
            ApplicationUser user_Admin = null!;
            ApplicationUser user_User = null!;
            ApplicationUser user_NotExisting = null!;

            //Act
            //execute the SeedController's CreateDefaultUser() method to create the default users and roles
            await controller.CreateDefaultUsers();

            //retrieve the users
            user_Admin = await userManager.FindByEmailAsync("admin@email.com");
            user_User = await userManager.FindByEmailAsync("user@email.com");
            user_NotExisting = await userManager.FindByEmailAsync("notexisting@email.com");

            //Assert
            Assert.NotNull(user_Admin);
            Assert.NotNull(user_User);
            Assert.Null(user_NotExisting);
        }
    }
}
