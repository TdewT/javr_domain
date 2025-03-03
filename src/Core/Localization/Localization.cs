﻿using System.Runtime.CompilerServices;
using Core.Localization.Enums;
using Serilog;

namespace Core.Localization;

public static class Localization
{
    private static Dictionary<LanguageCode, LanguagePackage> _languages = new();
    // TODO: Change to readonly once config is implemented
    public readonly static LanguageCode DefaultLanguage;
    private static LanguagePackage? _currentLanguage;

    static Localization()
    {
        var baseDir = AppDomain.CurrentDomain.BaseDirectory;
        var localesPath = Path.Combine(baseDir, "Localization", "locales");

        // Check if locales dir exists
        if (!Directory.Exists(localesPath))
        {
            Log.Error("Localization folder not found");
            return;
        }

        // Check if localization files are present
        var languageFiles = Directory.GetFiles(localesPath, "*_*.json");
        if (languageFiles.Length == 0)
        {
            Log.Error($"No language pack files found at '{localesPath}'.");
            return;
        }

        // Load language packs and store them in dictionary
        foreach (var path in languageFiles)
        {
            var languagePackFileName = Path.GetFileName(path);

            var languageCodeStr = languagePackFileName.Replace(".json", "");

            var languagePackage = new LanguagePackage(
                languageCodeStr,
                path
            );

            _languages[languagePackage.LanguageCode] = languagePackage;
        }

        // If no languages were error to logs
        if (_languages.Count == 0)
        {
            Log.Error($"No language pack files found");
        }

        // TODO: Read from config when config handling is implemented
        DefaultLanguage = LanguageCode.en_US;

        SetLanguage(DefaultLanguage);
    }
    
    public static void SetLanguage(LanguageCode language)
    {
        // Try to get loaded language
        if (!_languages.TryGetValue(language, out var loadedLanguage))
        {
            Log.Warning($"Language '{language}' is not loaded.");
        }

        _currentLanguage = loadedLanguage;
    }

    public static string Get(StringCode key, params object[] args)
    {
        // Make sure that language is set
        if (_currentLanguage == null)
        {
            Log.Error("Localization system not initialized");
            return key.ToString();
        }
        
        // Get string value and format
        return string.Format(_currentLanguage.GetString(key), args);
    }

    public static void ResetToDefaults()
    {
        SetLanguage(DefaultLanguage);
        _languages = new Dictionary<LanguageCode, LanguagePackage>();
        RuntimeHelpers.RunClassConstructor(typeof(Localization).TypeHandle);
    }
}