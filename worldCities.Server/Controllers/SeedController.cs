﻿using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using worldCities.Server.Data;
using System.Security;
using OfficeOpenXml;
using worldCities.Server.Data.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authorization;

namespace worldCities.Server.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    [Authorize(Roles ="Administrator")]
    public class SeedController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _env;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IConfiguration _configuration;

        public SeedController(ApplicationDbContext context, IWebHostEnvironment env, RoleManager<IdentityRole> roleManager, UserManager<ApplicationUser> userManager, IConfiguration configuration)
        {
            _context = context;
            _env = env;
            _roleManager = roleManager;
            _userManager = userManager;
            _configuration = configuration;
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

        [HttpGet]
        public async Task<IActionResult> CreateDefaultUsers()
        {
            //setup default role names
            string role_RegisteredUser = "RegisteredUser";
            string role_Administrator = "Administrator";

            //create the default roles (if they dont exist yet)
            if(await _roleManager.FindByNameAsync(role_RegisteredUser) == null)
            {
                await _roleManager.CreateAsync(new IdentityRole(role_RegisteredUser));
            }
            if(await _roleManager.FindByNameAsync(role_Administrator) == null)
            {
                await _roleManager.CreateAsync(new IdentityRole(role_Administrator));
            }

            //create a list to track the newly added users
            var addedUserList = new List<ApplicationUser>();

            //check if admin user already exists
            var email_Admin = "admin@email.com";

            if(await _userManager.FindByNameAsync(email_Admin) == null)
            {
                var user_Admin = new ApplicationUser()
                {
                    SecurityStamp = Guid.NewGuid().ToString(),
                    UserName = email_Admin,
                    Email = email_Admin
                };

                //insert the admin user into the db
                await _userManager.CreateAsync(user_Admin, _configuration["DefaultPasswords:Administrator"]);

                //assign the "RegisteredUser" and "Administrator" roles
                await _userManager.AddToRoleAsync(user_Admin,role_RegisteredUser);
                await _userManager.AddToRoleAsync(user_Admin, role_Administrator);

                //add the admin user to the added users list
                addedUserList.Add(user_Admin);
            }

            //check if standard user already exist
            var email_User = "user@email.com";
            if(await _userManager.FindByNameAsync(email_User) == null)
            {
                //create a new standard ApplicationUser account
                var user_User = new ApplicationUser()
                {
                    SecurityStamp = Guid.NewGuid().ToString(),
                    UserName = email_User,
                    Email = email_User
                };

                //insert the standard user into the db
                await _userManager.CreateAsync(user_User, _configuration["DefaultPasswords:RegisteredUser"]);

                //assign the "RegisteredUser" role
                await _userManager.AddToRoleAsync(user_User,role_RegisteredUser);

                //confirm the email and remove Lockout
                user_User.EmailConfirmed = true;
                user_User.LockoutEnabled = false;

                //add the standard user to the added users list
                addedUserList.Add(user_User);   
            }
            //if we added at least one user, persist the changes into the db
            if(addedUserList.Count > 0)
            {
                await _context.SaveChangesAsync();
            }
            return new JsonResult(new
            {
                Count = addedUserList.Count,
                Users = addedUserList
            });
        }
    }
}
