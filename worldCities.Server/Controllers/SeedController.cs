using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using worldCities.Server.Data;
using System.Security;
using OfficeOpenXml;
using worldCities.Server.Data.Models;
using Microsoft.EntityFrameworkCore;

namespace worldCities.Server.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class SeedController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _env;

        public SeedController(ApplicationDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        [HttpGet]
        public async Task<ActionResult> Import()
        {
            //prevents non development environments from running this method
            if (!_env.IsDevelopment())
            {
                throw new SecurityException("Not allowed");
            }

            var path = Path.Combine(_env.ContentRootPath, "Data/Source/worldcities.xlsx");

            using var stream = System.IO.File.OpenRead(path);
            using var excelPackage = new ExcelPackage(stream);

            //get first worksheet
            var worksheet = excelPackage.Workbook.Worksheets[0];

            //define how many rows we want to process
            var nEndRow = worksheet.Dimension.End.Row;

            //initialize the record counters
            var numberOfCountriesAdded = 0;
            var numberOfCitiesAdded = 0;

            //create a lookup dictionary containing all the countries existing into the database
            //(will be empty on the first run)
            var countriesByName = _context.Countries.AsNoTracking().ToDictionary(
                x => x.Name, StringComparer.OrdinalIgnoreCase);
            
            //iterates through all rows, skipping the first one
            for(int nRow = 2; nRow <= nEndRow; nRow++)
            {
                var row = worksheet.Cells[nRow,1,nRow,worksheet.Dimension.End.Column];
                var countryName = row[nRow,5].GetValue<string>();
                var iso2 = row[nRow,6].GetValue<string>();
                var iso3 = row[nRow,7].GetValue<string>();

                //skip country if it already exists in db
                if (countriesByName.ContainsKey(countryName))
                {
                    continue;
                }

                var country = new Country
                {
                    Name = countryName,
                    ISO2 = iso2,
                    ISO3 = iso3
                };

                //add the new country to the db
                await _context.Countries.AddAsync(country);

                countriesByName.Add(countryName, country);

                numberOfCountriesAdded++;
            }

            if(numberOfCountriesAdded > 0)
            {
                await _context.SaveChangesAsync();
            }

            //create a lookup dictionary containing all the cities existing into the database
            //(will be empty on the first run)
            var cities = _context.Cities.AsNoTracking().ToDictionary(
                x => (
                Name: x.Name,
                Lat: x.Lat,
                Lon: x.Lon,
                CountryId: x.CountryId));
            
            //iterates through all rows skipping the first one
            for(int nRow = 2;nRow <= nEndRow; nRow++)
            {
                var row = worksheet.Cells[nRow,1,nRow,worksheet.Dimension.End.Column];
                var name = row[nRow,1].GetValue<string>();
                var lat = row[nRow,3].GetValue<decimal>();
                var lon = row [nRow,4].GetValue<decimal>();
                var countryName = row[nRow,5].GetValue<string>();

                //retrieve country id by country name
                var countryId = countriesByName[countryName].Id;

                //skip this if city is already in database
                if(cities.ContainsKey(
                    (
                    Name:name,
                    Lat:lat,
                    Lon:lon,
                    CountryId:countryId)))
                    continue;

                //create city entity and fill it with the data
                var city = new City
                {
                    Name = name,
                    Lat = lat,
                    Lon = lon,
                    CountryId = countryId
                };

                //add the new city into db context
                _context.Cities.Add(city);

                numberOfCitiesAdded++;
            }
            if(numberOfCitiesAdded > 0)
            {
                await _context.SaveChangesAsync();
            }

            return new JsonResult(new
            {
                Cities = numberOfCitiesAdded,
                Countries = numberOfCountriesAdded
            });
        }
    }
}
