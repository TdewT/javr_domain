using System.Text.Json;

namespace Core.Localization;

public class Localizer  
{  
    private readonly IReadOnlyDictionary<string, string>? _strings;  

    public Localizer(string languageCode = "en-US")  
    {  
        // Load JSON file for the language  
        var path = $"Localization/{languageCode}.json";  
        var json = File.ReadAllText(path);  
        _strings = JsonSerializer.Deserialize<Dictionary<string, string>>(json);  
    }  

    public string Get(string key, params object[] args)  
    {
        if (_strings == null)
        {
            return key; // Return key if localization file not found or is empty
        }
        
        if (_strings.TryGetValue(key, out var value))  
            return string.Format(value, args);  

        return key; // Fallback to key if missing  
    }  
}  