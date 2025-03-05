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
    private readonly ITestOutputHelper _testOutputHelper;
    private static readonly string BaseDir = AppDomain.CurrentDomain.BaseDirectory;
    private readonly string _localesFolder = Path.Combine(BaseDir, "Localization", "locales");

    private readonly JsonSerializerOptions _jsonSerializerOptions = new()
    {
        WriteIndented = true
    };

    public LocalizationTests(ITestOutputHelper testOutputHelper, LocalesFixture classFixture)
    {
        _classFixture = classFixture;
        _testOutputHelper = testOutputHelper;
        // Delete directory imported from Core
        if (Directory.Exists(_localesFolder))
        {
            Directory.Delete(_localesFolder, true);
        }

        // Create new empty directory
        Directory.CreateDirectory(_localesFolder);
    }

    private void WriteLocale(LanguageCode languageCode, JsonObject content)
    {
        var filePath = Path.Combine(_localesFolder, $"{languageCode.ToString()}.json");
        
        using var stream = new FileStream(filePath, FileMode.Create);
        using var writer = new Utf8JsonWriter(stream, new JsonWriterOptions
        {
            Indented = _jsonSerializerOptions.WriteIndented,
            Encoder = _jsonSerializerOptions.Encoder
        });

        content.WriteTo(writer);
        writer.Flush(); // Forces buffer to stream
        stream.Flush(true); // Forces stream to disk
    }

    private string CreateDefaultLanguagePackage()
    {
        // Create test message in default language
        const string defaultMessage = "default message";
        var packageData = new JsonObject { [StringCode.TestMessage.ToString()] = defaultMessage };

        // Save to file
        WriteLocale(LanguageCode.en_US, packageData);
        
        // Load new packages
        Localization.ReloadPackages();
        return defaultMessage;
    }

    private string CreateOtherLanguagePackage()
    {
        // Create test message in other language
        const string otherMessage = "other message";
        var packageData = new JsonObject { [StringCode.TestMessage.ToString()] = otherMessage };

        // Save to file
        WriteLocale(LanguageCode.pl_PL, packageData);
        
        // Load new packages
        Localization.ReloadPackages();
        return otherMessage;
    }

    [Fact]
    public void GetString_DefaultLanguageReturnsString()
    {
        // Create test message in default language
        var defaultMessage = CreateDefaultLanguagePackage();

        // TODO: Add testing with config integration once it's implemented
        // For now en_US is set as default
        // var testStr = Localization.Get(StringCode.TestMessage);

        _testOutputHelper.WriteLine(File.Exists(Path.Combine(_localesFolder, "en_US.json")).ToString());
        _testOutputHelper.WriteLine(File.ReadAllText(Path.Combine(_localesFolder, "en_US.json")));
        var testStr = Localization.Get(StringCode.TestMessage);
        _testOutputHelper.WriteLine(testStr);
        // Assert.Equal(defaultMessage, testStr);
    }

    [Fact]
    public void GetString_SelectedLanguageReturnsString()
    {
        // Create test message in default language
        CreateDefaultLanguagePackage();

        // Create test message in another language
        var otherMessage = CreateOtherLanguagePackage();

        // Select language
        Localization.SetLanguage(LanguageCode.pl_PL);

        var testStr = Localization.Get(StringCode.TestMessage);

        Assert.Equal(otherMessage, testStr);
    }

    [Fact]
    public void GetString_SelectedLanguageReturnsString_NoOtherPackages()
    {
        // Create test message in another language
        var otherMessage = CreateOtherLanguagePackage();
        
        // Select language
        Localization.SetLanguage(LanguageCode.pl_PL);

        var testStr = Localization.Get(StringCode.TestMessage);

        Assert.Equal(otherMessage, testStr);
    }

    [Fact]
    public void GetString_NonexistentLanguageReturnsKey()
    {
        // Select nonexistent language
        Localization.SetLanguage(LanguageCode.pl_PL);

        var testStr = Localization.Get(StringCode.TestMessage);

        Assert.Equal(StringCode.TestMessage.ToString(), testStr);
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
        Localization.Reset();
    }
}