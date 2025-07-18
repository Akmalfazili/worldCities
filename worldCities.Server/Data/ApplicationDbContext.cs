﻿using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using worldCities.Server.Data.Models;

namespace worldCities.Server.Data
{
    public class ApplicationDbContext:IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext() : base()
        {

        }
        public ApplicationDbContext(DbContextOptions options):base(options)
        {

        }

        public DbSet<City> Cities => Set<City>();
        public DbSet<Country> Countries => Set<Country>();

        //protected override void OnModelCreating(ModelBuilder modelBuilder)
        //{
        //    base.OnModelCreating(modelBuilder);

        //    modelBuilder.ApplyConfigurationsFromAssembly(
        //        typeof(ApplicationDbContext).Assembly );
        //}
    }
}
