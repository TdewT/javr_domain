using System.Text;
using System.Text.Json;
using Core.Localization.Enums;
using Serilog;

namespace Core.Localization;

public class LanguagePackage
{
    public readonly LanguageCode LanguageCode;
    private Dictionary<StringCode, string> _strings = new();
    private readonly string _filePath;
    private readonly string _fileName;

    // Overload for string language codes for convenience
    public LanguagePackage(string languageCodeStr, string filePath)
        : this(ParseLanguageCode(languageCodeStr), filePath)
    {
    }

    // Method called when overloading with string
    private static LanguageCode ParseLanguageCode(string input)
    {
        if (!Enum.TryParse<LanguageCode>(input, out var result))
        {
            Log.Warning($"Unable to parse '{input}' into LanguageCode enum");
        }

        return result;
    }

    // Main constructor
    private LanguagePackage(LanguageCode languageCode, string filePath)
    {
        // Set basic parameters
        LanguageCode = languageCode;
        _filePath = filePath;
        _fileName = Path.GetFileName(filePath);

        // Load localization JSON
        ReadPackage();
    }

    private void ReadPackage()
    {
        // Check if file exists
        if (!File.Exists(_filePath))
        {
            Log.Warning($"File not found: {_filePath}");
            return;
        }
        
        // Read the file
        var json = File.ReadAllText(_filePath, Encoding.UTF8);
        
        // Configure serialization options
        var options = new JsonSerializerOptions
        {
            // Required for dictionary key conversion
            DictionaryKeyPolicy = JsonNamingPolicy.CamelCase,
            // Use custom converter for proper StringCode enum serializing
            Converters = { new LanguagePackConverter() },
        };

        // Deserialize the json
        var newPackage = JsonSerializer.Deserialize<Dictionary<StringCode, string>>(json, options);
        if (newPackage == null)
        {
            Log.Warning($"Unable to load json file '{_fileName}'.");
            return;
        }
        
        _strings = newPackage;
    }

    public string GetString(StringCode key)
    {
        _strings.TryGetValue(key, out var value);

        // If value was not found, return key
        return value ?? key.ToString();
    }
}