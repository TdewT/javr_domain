using System.Text.Json;
using System.Text.Json.Serialization;
using Core.Localization.Enums;

namespace Core.Localization;

public class LanguagePackConverter : JsonConverter<Dictionary<StringCode, string>>
{
    public override Dictionary<StringCode, string> Read(
        ref Utf8JsonReader reader,
        Type typeToConvert,
        JsonSerializerOptions options)
    {
        // Setup result dict
        var dictionary = new Dictionary<StringCode, string>();

        // Parse JSON document and populate dictionary
        using var doc = JsonDocument.ParseValue(ref reader);
        foreach (JsonProperty property in doc.RootElement.EnumerateObject())
        {
            // Try to parse property name to enum StringCode
            if (!Enum.TryParse(property.Name, ignoreCase: true, out StringCode key))
            {
                throw new JsonException($"Failed to parse key to enum: {property.Name}");
            }

            // Get value string, returns null if value is not a string
            var propValue = property.Value.GetString();

            // ReSharper disable once JoinNullCheckWithUsage
            if (propValue == null)
            {
                throw new JsonException($"Property value not a string: {property.Name}");
            }
            
            dictionary[key] = propValue;
        }

        return dictionary;
    }

    public override void Write(
        Utf8JsonWriter writer,
        Dictionary<StringCode, string> value,
        JsonSerializerOptions options)
    {
        writer.WriteStartObject();
        // Write keys and values to the dictionary
        foreach (var keyValuePair in value)
        {
            writer.WritePropertyName(keyValuePair.Key.ToString());
            writer.WriteStringValue(keyValuePair.Value);
        }
        writer.WriteEndObject();
    }
}