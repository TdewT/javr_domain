using Serilog;
using Serilog.Events;

namespace Core.Logging;

public static class Logger
{
    private const string LogTemplate = "{Timestamp:yyyy-MM-dd HH:mm:ss} [{Level}] {Message}{NewLine}{Exception}";

    public static ILogger CreateLogger()
    {
        return new LoggerConfiguration()
            .MinimumLevel.Debug() // Log everything from Debug and above
            .Enrich.FromLogContext()
            .WriteTo.Console(
                restrictedToMinimumLevel: LogEventLevel.Information,
                outputTemplate: LogTemplate
                )
            .WriteTo.File(
                path: "logs/log-.txt",
                rollingInterval: RollingInterval.Day, // New file each day
                retainedFileCountLimit: 7, // Keep logs for 7 days
                outputTemplate: LogTemplate
            )
            .CreateLogger();
    }
}