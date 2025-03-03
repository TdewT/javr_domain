using System.Text.Json;
using System.Text.Json.Nodes;
using Core.Localization;
using Core.Localization.Enums;
using Xunit.Abstractions;

namespace tests;

// ReSharper disable once ClassNeverInstantiated.Global
public class LocalesFixture : IDisposable
{
    private static readonly string BaseDir = AppDomain.CurrentDomain.BaseDirectory;
    private readonly string _localizationFolder = Path.Combine(BaseDir, "Localization");

    public LocalesFixture()
    {
        Directory.CreateDirectory(_localizationFolder);
    }

    // Cleanup after tests are concluded
    public void Dispose()
    {
        Directory.Delete(_localizationFolder, true);
    }
}

public class LocalizationTests : IClassFixture<LocalesFixture>, IDisposable
{
    private readonly LocalesFixture _classFixture;
    private static readonly string BaseDir = AppDomain.CurrentDomain.BaseDirectory;
    private readonly string _localesFolder = Path.Combine(BaseDir, "Localization", "locales");

    private readonly JsonSerializerOptions _jsonSerializerOptions = new()
    {
        WriteIndented = true
    };

    public LocalizationTests(ITestOutputHelper testOutputHelper, LocalesFixture classFixture)
    {
        _classFixture = classFixture;
        // Delete directory imported from Core
        if (Directory.Exists(_localesFolder))
        {
            Directory.Delete(_localesFolder, true);
        }

        // Create new empty directory
        Directory.CreateDirectory(_localesFolder);
    }

    private void WriteLocale(string fileName, JsonObject content)
    {
        var filePath = Path.Combine(_localesFolder, $"{fileName}.json");

        using var stream = new FileStream(filePath, FileMode.Create);
        using var writer = new Utf8JsonWriter(stream, new JsonWriterOptions
        {
            Indented = _jsonSerializerOptions.WriteIndented,
            Encoder = _jsonSerializerOptions.Encoder
        });

        content.WriteTo(writer);
    }

    [Fact]
    public void GetString_DefaultLanguageReturnsString()
    {
        // Create test message in default language
        const string enMessage = "en message";
        var packageEn = new JsonObject
        {
            [StringCode.TestMessage.ToString()] = enMessage
        };
        WriteLocale("en_US", packageEn);

        // TODO: Add testing with config integration once it's implemented
        // For now en_US is set as default
        var testStr = Localization.Get(StringCode.TestMessage);

        Assert.Equal(enMessage, testStr);
    }

    [Fact]
    public void GetString_SelectedLanguageReturnsString()
    {
        // Create test message in default language
        const string enMessage = "en message";
        var packageEn = new JsonObject
        {
            [StringCode.TestMessage.ToString()] = enMessage
        };
        WriteLocale("en_US", packageEn);

        // Create test message in another language
        const string plMessage = "pl message";
        var packagePl = new JsonObject
        {
            [StringCode.TestMessage.ToString()] = plMessage
        };
        WriteLocale("pl_PL", packagePl);

        // Select language
        Localization.SetLanguage(LanguageCode.pl_PL);

        var testStr = Localization.Get(StringCode.TestMessage);

        Assert.Equal(plMessage, testStr);
    }

    [Fact]
    public void GetString_NonexistentLanguageReturnsKey()
    {
        // Select nonexistent language
        Localization.SetLanguage(LanguageCode.pl_PL);

        var testStr = Localization.Get(StringCode.TestMessage);

        Assert.Equal("TestMessage", testStr);
    }

    public void Dispose()
    {
        // Clean up locales directory after each test
        if (Directory.Exists(_localesFolder))
        {
            foreach (var file in Directory.GetFiles(_localesFolder))
            {
                File.Delete(file);
            }
        }
        
        // Reset static class
        Localization.ResetToDefaults();
        
    }
}