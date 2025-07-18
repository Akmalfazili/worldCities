﻿using System.ComponentModel.DataAnnotations;

namespace worldCities.Server.Data
{
    public class ApiLoginRequest
    {
        [Required(ErrorMessage ="Email is required.")]
        [EmailAddress(ErrorMessage = "Invalid email format.")]
        public required string Email { get; set; }
        [Required (ErrorMessage ="Password is required.")]
        public required string Password { get; set; }
    }
}
