using Core.Logging;
using Serilog;

namespace tests
{
    public class LoggerTests : IDisposable
    {
        private const string LogFilePathPattern = "logs/log-.txt";

        public LoggerTests()
        {
            // Ensure the logs directory exists before running tests
            Directory.CreateDirectory("logs");
        }

        [Fact]
        public void CreateLogger_ReturnsValidLogger()
        {
            // Act
            var logger = Logger.CreateLogger();

            // Assert
            Assert.NotNull(logger);
        }

        [Fact]
        public void Logger_WritesToConsole_WithCorrectTemplate()
        {
            // Arrange
            var logMessage = "This is a test log message.";
            var logOutput = new StringWriter(); // Capture console output
            Console.SetOut(logOutput);

            var logger = Logger.CreateLogger();
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
            // Arrange
            var logMessage = "This is a test log message.";
            var logger = Logger.CreateLogger();
            Log.Logger = logger;

            // Act
            Log.Information(logMessage);

            // Ensure all logs are flushed and resources are released
            Log.CloseAndFlush();

            // Wait briefly to ensure the file is fully written
            System.Threading.Thread.Sleep(500);

            // Assert
            var logFiles = Directory.GetFiles("logs", "log-*.txt");
            Assert.NotEmpty(logFiles);

            foreach (var logFile in logFiles)
            {
                var fileContent = File.ReadAllText(logFile);
                Assert.Contains(logMessage, fileContent); // Ensure the log message is present
                Assert.Matches(@"\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} \[Information\] This is a test log message.", fileContent);
            }
        }

        [Fact]
        public void Logger_DoesNotLogDebugLevelToConsole_ByDefault()
        {
            // Arrange
            var logMessage = "This is a debug log message.";
            var logOutput = new StringWriter(); // Capture console output
            Console.SetOut(logOutput);

            var logger = Logger.CreateLogger();
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
            // Arrange
            var logMessage = "This is a debug log message.";
            var logger = Logger.CreateLogger();
            Log.Logger = logger;

            // Act
            Log.Debug(logMessage);
            
            // Ensure all logs are flushed and resources are released
            Log.CloseAndFlush();

            // Wait for the file to be written (to handle async file writing)
            System.Threading.Thread.Sleep(500);

            // Assert
            var logFiles = Directory.GetFiles("logs", "log-*.txt");
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
            // Arrange
            var logger = Logger.CreateLogger();
            Log.Logger = logger;

            // Act
            Log.Information("Test log to create files.");
            
            // Ensure all logs are flushed and resources are released
            Log.CloseAndFlush();

            // Wait for the file to be written (to handle async file writing)
            System.Threading.Thread.Sleep(500);

            // Assert
            var logFiles = Directory.GetFiles("logs", "log-*.txt");
            Assert.True(logFiles.Length <= 7); // Ensure no more than 7 log files exist
        }

        /// <summary>
        /// Cleans up log files after all tests are executed.
        /// </summary>
        public void Dispose()
        {
            // Clean up log files after tests
            var logFiles = Directory.GetFiles("logs", "log-*.txt");
            foreach (var logFile in logFiles)
            {
                File.Delete(logFile);
            }

            // Optionally delete the logs directory if it's empty
            if (Directory.Exists("logs") && !Directory.EnumerateFileSystemEntries("logs").Any())
            {
                Directory.Delete("logs");
            }
        }
    }
}