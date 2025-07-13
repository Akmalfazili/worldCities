namespace worldCities.Server.Data
{
    public class ApiLoginResult
    {
        //true if login attempt is successful, false otherwise
        public bool Success { get; set; }
        //login attempt result message
        public required string Message { get; set; }
        //the jwt token if login attempt is successful, or null if not
        public string? Token { get; set; }
    }
}
