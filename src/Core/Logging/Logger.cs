using Serilog;
using Serilog.Events;

namespace Core.Logging;

public static class Logger
{
    private const string LogTemplate = "{Timestamp:yyyy-MM-dd HH:mm:ss} [{Level}] {Message}{NewLine}{Exception}";
    private static ILogger? _logger;

    private static ILogger CreateLogger(string logPath)
    {
        return new LoggerConfiguration()
            .MinimumLevel.Debug() // Log everything from Debug and above
            .Enrich.FromLogContext()
            .WriteTo.Console(
                restrictedToMinimumLevel: LogEventLevel.Information,
                outputTemplate: LogTemplate
            )
            .WriteTo.File(
                path: logPath,
                rollingInterval: RollingInterval.Day, // New file each day
                retainedFileCountLimit: 7, // Keep logs for 7 days
                outputTemplate: LogTemplate
            )
            .CreateLogger();
    }

    public static void Initialize(string logPath)
    {
        if (_logger != null)
        {
            throw new InvalidOperationException("Logger has already been initialized.");
        }

        _logger = CreateLogger(logPath);
    }
    
    public static ILogger GetLogger()
    {
        if (_logger == null) throw new InvalidOperationException("Logger has not been initialized");
        return _logger;
    }
}