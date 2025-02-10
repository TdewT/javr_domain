using System;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading;
using Core.Logging;
using Microsoft.Extensions.Configuration;
using Serilog;
using Xunit;
using Xunit.Abstractions;

namespace tests
{
    public class LoggerTests : IDisposable
    {
        private readonly ITestOutputHelper _testOutputHelper;
        private const string LogFilePattern = "tests-*.log";
        private const string LogPath = "logs";
        private const string LogFilePathPattern = $"{LogPath}/{LogFilePattern}";

        private static readonly string ConfigStr = @"{
                  ""Serilog"": {
                    ""Using"": [ ""Serilog.Sinks.Console"", ""Serilog.Sinks.File"" ],
                    ""MinimumLevel"": {
                      ""Default"": ""Debug"",
                      ""Override"": {
                        ""Microsoft"": ""Information"",
                        ""System"": ""Warning""
                      }
                    },
                    ""WriteTo"": [
                      {
                        ""Name"": ""Console"",
                        ""Args"": {
                          ""restrictedToMinimumLevel"": ""Information"",
                          ""outputTemplate"": ""{Timestamp:yyyy-MM-dd HH:mm:ss} [{Level}] {Message}{NewLine}{Exception}""
                        }
                      },
                      {
                        ""Name"": ""File"",
                        ""Args"": {
                          ""path"": ""./{LogFilePathPattern}"",
                          ""rollingInterval"": ""Day"",
                          ""retainedFileCountLimit"": 7,
                          ""outputTemplate"": ""{Timestamp:yyyy-MM-dd HH:mm:ss} [{Level}] {Message}{NewLine}{Exception}""
                        }
                      }
                    ],
                    ""Enrich"": [ ""FromLogContext"" ],
                    ""Properties"": {
                      ""Application"": ""Tests""
                    }
                  }
                }".Replace("{LogFilePathPattern}", LogFilePathPattern.Replace("-*", "-"));

        private static readonly MemoryStream ConfigStream = new MemoryStream(Encoding.UTF8.GetBytes(ConfigStr));

        private static readonly IConfiguration Config = new ConfigurationBuilder().AddJsonStream(ConfigStream).Build();

        public LoggerTests(ITestOutputHelper testOutputHelper)
        {
            _testOutputHelper = testOutputHelper;
        }

        [Fact]
        public void GetLogger_BeforeInitialisation()
        {
            // Skip DirectoryNotFoundException
            Directory.CreateDirectory("logs");

            // Assert
            var exception = Assert.Throws<InvalidOperationException>(() =>
            {
                // Act
                var logger = Logger.GetLogger();
            });
            Assert.Equal("Logger has not been initialized.", exception.Message);
        }

        [Fact]
        public void CreateLogger_ReturnsValidLogger()
        {
            // Act
            Logger.Initialize(Config);
            var logger = Logger.GetLogger();

            // Assert
            Assert.NotNull(logger);
        }

        [Fact]
        public void Logger_WritesToConsole_WithCorrectTemplate()
        {
            Logger.Initialize(Config);
            
            // Arrange
            var logMessage = "This is a test log message.";
            var logOutput = new StringWriter(); // Capture console output
            Console.SetOut(logOutput);

            var logger = Logger.GetLogger();
            Log.Logger = logger;

            // Act
            Log.Information(logMessage);
            // Ensure all logs are flushed and resources are released
            Log.CloseAndFlush();

            // Assert
            var consoleOutput = logOutput.ToString();
            Assert.Contains(logMessage, consoleOutput); // Ensure the log message is present
            Assert.Matches(@"\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} \[Information\] This is a test log message.",
                consoleOutput);
        }

        [Fact]
        public void Logger_WritesToFile_WithCorrectTemplate()
        {
            Logger.Initialize(Config);
            
            // Arrange
            var logMessage = "This is a test log message.";
            var logger = Logger.GetLogger();
            Log.Logger = logger;

            // Act
            Log.Information(logMessage);

            // Ensure all logs are flushed and resources are released
            Log.CloseAndFlush();

            // Wait briefly to ensure the file is fully written
            System.Threading.Thread.Sleep(500);

            // Assert
            var logFiles = Directory.GetFiles(LogPath, LogFilePattern);
            Assert.NotEmpty(logFiles);

            foreach (var logFile in logFiles)
            {
                var fileContent = File.ReadAllText(logFile);
                Assert.Contains(logMessage, fileContent); // Ensure the log message is present
                Assert.Matches(@"\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} \[Information\] This is a test log message.",
                    fileContent);
            }
        }

        [Fact]
        public void Logger_DoesNotLogDebugLevelToConsole_ByDefault()
        {
            Logger.Initialize(Config);
            
            // Arrange
            var logMessage = "This is a debug log message.";
            var logOutput = new StringWriter(); // Capture console output
            Console.SetOut(logOutput);

            var logger = Logger.GetLogger();
            Log.Logger = logger;

            // Act
            Log.Debug(logMessage);

            // Ensure all logs are flushed and resources are released
            Log.CloseAndFlush();

            // Assert
            var consoleOutput = logOutput.ToString();
            Assert.DoesNotContain(logMessage, consoleOutput); // Debug messages should not appear in console
        }

        [Fact]
        public void Logger_LogsDebugLevelToFile_ByDefault()
        {
            Logger.Initialize(Config);
            
            // Arrange
            var logMessage = "This is a debug log message.";
            var logger = Logger.GetLogger();
            Log.Logger = logger;

            // Act
            Log.Debug(logMessage);

            // Ensure all logs are flushed and resources are released
            Log.CloseAndFlush();

            // Wait for the file to be written (to handle async file writing)
            Thread.Sleep(500);

            // Assert
            var logFiles = Directory.GetFiles(LogPath, LogFilePattern);
            Assert.NotEmpty(logFiles);
            
            foreach (var logFile in logFiles)
            {
                var fileContent = File.ReadAllText(logFile);
                Assert.Contains(logMessage, fileContent); // Debug messages should appear in the file
                Assert.Matches(@"\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} \[Debug\] This is a debug log message.",
                    fileContent);
            }
        }

        [Fact]
        public void Logger_RetainsLogsFor7Days()
        {
            Logger.Initialize(Config);
            
            // Arrange
            var logger = Logger.GetLogger();
            Log.Logger = logger;

            // Act
            Log.Information("Test log to create files.");

            // Ensure all logs are flushed and resources are released
            Log.CloseAndFlush();

            // Wait for the file to be written (to handle async file writing)
            System.Threading.Thread.Sleep(500);

            // Assert
            var logFiles = Directory.GetFiles(LogPath, LogFilePattern);
            Assert.True(logFiles.Length <= 7); // Ensure no more than 7 log files exist
        }

        /// <summary>
        /// Cleans up log files after all tests are executed.
        /// </summary>
        public void Dispose()
        {
            // Cleanup
            Logger.Close();
            
            // Log Disposal
            if (Directory.Exists("logs"))
            {
                // Clean up log files after tests
                var logFiles = Directory.GetFiles(LogPath, LogFilePattern);
                foreach (var logFile in logFiles)
                {
                    File.Delete(logFile);
                }

                // Delete the logs directory if it's empty
                if (!Directory.EnumerateFileSystemEntries("logs").Any())
                {
                    Directory.Delete("logs");
                }
            }
            
            // Config Disposal
            if (Directory.Exists("configs"))
            {
                // Clean up config files after tests
                var configFiles = Directory.GetFiles("configs", "*.json");
                foreach (var configFile in configFiles)
                {
                    File.Delete(configFile);
                }

                // Delete the configs directory if it's empty
                if (!Directory.EnumerateFileSystemEntries("configs").Any())
                {
                    Directory.Delete("configs");
                }
            }
        }
    }
}