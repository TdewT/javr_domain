using System.Diagnostics.CodeAnalysis;
using System.Text.Json.Serialization;

namespace Core.Localization.Enums;

[JsonConverter(typeof(LanguagePackConverter))]
public enum StringCode
{
    TestMessage
}