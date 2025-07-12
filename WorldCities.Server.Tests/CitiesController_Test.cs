using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using worldCities.Server.Controllers;
using worldCities.Server.Data;
using worldCities.Server.Data.Models;
using Xunit;

namespace WorldCities.Server.Tests
{
    public class CitiesController_Test
    {
        ///<summary>
        ///test the GetCity() method
        ///</summary>

        [Fact]
        public async Task GetCity()
        {
            //Arrange
            //todo: define the required assets
            var options = new DbContextOptionsBuilder<ApplicationDbContext>().UseInMemoryDatabase(databaseName: "WorldCities")
                .Options;
            using var context = new ApplicationDbContext(options);
            context.Add(new City()
            {
                Id = 1,
                CountryId = 1,
                Lat = 1,
                Lon = 1,
                Name = "TestCity1"
            });
            context.SaveChanges();

            var controller = new CitiesController(context);
            City? city_existing = null;
            City? city_notExisting = null;
            //Act
            //todo: invoke the test
            city_existing = (await controller.GetCity(1)).Value;
            city_notExisting = (await controller.GetCity(2)).Value;

            //Assert
            //todo: verify that conditions are met
            Assert.NotNull(city_existing);
            Assert.Null(city_notExisting);
        }

        [Fact]
        public void CheckDuplicate()
        {
            //Arrange
            //todo:define the required assets
            var options = new DbContextOptionsBuilder<ApplicationDbContext>().UseInMemoryDatabase(databaseName: "WorldCities")
                .Options;
            using var context = new ApplicationDbContext(options);
            context.Add(new City()
            {
                Id = 1,
                CountryId = 1,
                Lat = 1,
                Lon = 1,
                Name = "TestCity1"
            });
            context.SaveChanges();
            var controller = new CitiesController(context);
            City? city_dupe = new City(){
                Id = 2,CountryId = 1,Lat = 1, Lon = 1,Name="TestCity1"
            };
            City? city_not_dupe = new City() { Id=3,CountryId=1,Lat=2,Lon=2,Name="TestCity1"};

            //Act
            //todo:invoke the test
            bool test1 = controller.IsDupeCity(city_dupe);
            bool test2 = controller.IsDupeCity(city_not_dupe);

            //Assert
            //todo:verify the conditions are met
            Assert.True(test1);
            Assert.False(test2);
        }
    }
}
