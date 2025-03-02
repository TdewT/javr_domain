using System.Text;
using Microsoft.Extensions.Configuration;
using Serilog;

namespace Core.Logging
{
    public static class Logger
    {
        private static bool _isInitialized;

        public static void Initialize(string configPath = "serilog.json")
        {
            Console.OutputEncoding = Encoding.UTF8;
            
            if (_isInitialized) return;

            if (!Path.Exists("logs"))
            {
                Directory.CreateDirectory("logs");
            }

            var configuration = new ConfigurationBuilder()
                .AddJsonFile(configPath, optional: false, reloadOnChange: true)
                .Build();

            Log.Logger = new LoggerConfiguration()
                .ReadFrom.Configuration(configuration)
                .CreateLogger();

            _isInitialized = true;
        }

        public static void Initialize(IConfiguration configuration)
        {
            Log.Logger = new LoggerConfiguration()
                .ReadFrom.Configuration(configuration)
                .CreateLogger();

            _isInitialized = true;
        }

        public static void Close()
        {
            Log.CloseAndFlush();
            _isInitialized = false;
        }

        public static ILogger GetLogger()
        {
            if (!_isInitialized) throw new InvalidOperationException("Logger has not been initialized.");
            return Log.Logger;
        }
    }
}