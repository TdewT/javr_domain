import os
import json
import re


def read_language_files(directory):
    """
    Reads all language pack JSON files from the given directory.
    Files should match the pattern like 'en-US.json', 'fr-FR.json'.
    Uses UTF-8-SIG encoding to handle BOM if present.
    """
    pattern = re.compile(r'([a-z]{2}-[A-Z]{2})\.json')
    language_files = {}
    string_keys = set()

    for filename in os.listdir(directory):
        match = pattern.match(filename)
        if match:
            locale = match.group(1)
            file_path = os.path.join(directory, filename)
            with open(file_path, 'r', encoding='utf-8-sig') as f:
                strings = json.load(f)
                language_files[locale] = strings
                string_keys.update(strings.keys())

    return language_files, sorted(string_keys)


def generate_csharp_class(language_files, string_keys, output_file):
    """
    Generates a C# class from the language pack JSON files.
    Also generates LanguageKey and StringKey enums, and a mapping for LanguageKey.
    """
    class_name = "LanguageStrings"

    with open(output_file, 'w', encoding='utf-8') as f:
        # Write the header
        f.write("namespace Core.Localization.Generated;\n")

        # Generate LanguageKey enum and its mapping
        f.write("public enum LanguageKey\n")
        f.write("{\n")
        for i, locale in enumerate(sorted(language_files.keys())):
            enum_value = locale.replace('-', '_').upper()
            f.write(f"    {enum_value}{(',' if i < len(language_files) - 1 else '')}\n")
        f.write("}\n\n")

        f.write("public static class LanguageKeyExtensions\n")
        f.write("{\n")
        f.write("    public static string ToLocaleString(this LanguageKey languageKey)\n")
        f.write("    {\n")
        f.write("        switch (languageKey)\n")
        f.write("        {\n")
        for locale in sorted(language_files.keys()):
            enum_value = locale.replace('-', '_').upper()
            f.write(f"            case LanguageKey.{enum_value}: return \"{locale}\";\n")
        f.write("            default: throw new ArgumentOutOfRangeException(nameof(languageKey), languageKey, null);\n")
        f.write("        }\n")
        f.write("    }\n")
        f.write("}\n\n")

        # Generate StringKey enum
        f.write("public enum StringKey\n")
        f.write("{\n")
        for i, key in enumerate(string_keys):
            f.write(f"    {key}{(',' if i < len(string_keys) - 1 else '')}\n")
        f.write("}\n\n")

        # Generate the main class
        f.write(f"public static class {class_name}\n")
        f.write("{\n")

        # Write the dictionary declaration
        f.write(
            "    public static Dictionary<string, Dictionary<string, string>> Strings = new Dictionary<string, Dictionary<string, string>>\n")
        f.write("    {\n")

        # Write each locale's data
        for i, (locale, strings) in enumerate(language_files.items()):
            f.write(f'        {{ "{locale}", new Dictionary<string, string>\n')
            f.write("        {\n")

            # Write key-value pairs
            for key, value in strings.items():
                # Escape any special characters in the string
                escaped_value = value.replace('"', '\\"').replace("\n", "\\n")
                f.write(f'            {{ "{key}", "{escaped_value}" }},\n')

            # Remove the trailing comma after the last item in the dictionary
            f.seek(f.tell() - 2, os.SEEK_SET)  # Move the cursor back by 2 characters
            f.write("\n")

            f.write("        }\n")
            f.write("        }" + ("," if i < len(language_files) - 1 else "") + "\n")

        f.write("    };\n\n")

        # Add a helper method to get a string by LanguageKey and StringKey
        f.write("    public static string GetString(LanguageKey languageKey, StringKey stringKey)\n")
        f.write("    {\n")
        f.write("        string language = languageKey.ToLocaleString();\n")
        f.write("        string key = stringKey.ToString();\n")
        f.write("        if (Strings.ContainsKey(language) && Strings[language].ContainsKey(key))\n")
        f.write("        {\n")
        f.write("            return Strings[language][key];\n")
        f.write("        }\n")
        f.write(
            "        return stringKey.ToString();\n")
        f.write("    }\n")

        f.write("}\n")


if __name__ == "__main__":
    # Directory containing the language pack JSON files
    directory = "./locales"

    # Output C# file
    output_file = "./Generated/LanguageStrings.cs"

    # Read the language files
    language_files, string_keys = read_language_files(directory)

    # Generate the C# class
    generate_csharp_class(language_files, string_keys, output_file)

    print(f"C# class generated successfully at {output_file}")
