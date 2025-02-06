namespace Core.Localization.Generated;
public enum LanguageKey
{
    EN_US,
    PL_PL
}

public static class LanguageKeyExtensions
{
    public static string ToLocaleString(this LanguageKey languageKey)
    {
        switch (languageKey)
        {
            case LanguageKey.EN_US: return "en-US";
            case LanguageKey.PL_PL: return "pl-PL";
            default: throw new ArgumentOutOfRangeException(nameof(languageKey), languageKey, null);
        }
    }
}

public enum StringKey
{
    TestMessage,
    abcd
}

public static class LanguageStrings
{
    public static Dictionary<string, Dictionary<string, string>> Strings = new Dictionary<string, Dictionary<string, string>>
    {
        { "en-US", new Dictionary<string, string>
        {
            { "TestMessage", "Test Message" },
        }
        },
        { "pl-PL", new Dictionary<string, string>
        {
            { "TestMessage", "Wiadomość testowa" },
            { "abcd", "aaa" },
        }
        }
    };

    public static string GetString(LanguageKey languageKey, StringKey stringKey)
    {
        string language = languageKey.ToLocaleString();
        string key = stringKey.ToString();
        if (Strings.ContainsKey(language) && Strings[language].ContainsKey(key))
        {
            return Strings[language][key];
        }
        return stringKey.ToString();
    }
}
