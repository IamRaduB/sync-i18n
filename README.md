# Sync Translations

Command line tool that takes the hassle out of keeping your JSON i18n files in sync

## Installation

`npm i -g @hovrcat/i18n-sync`

#### Local setup
`npm install`

#### Run tests
`npm run test`


## Usage

### insync

| Parameters | Required | Default | Description | 
| --- | --- | --- | --- |
| -d, --debug | ❌ | false | Enables debug logging |
| --dir <dir> | ❌ | ./i18n | Specify the directory where the i18n files exist |

#### Commands

###### **validate**

Compare some or all translation files against one provided as root

| Parameters | Required | Description |
| --- | --- | --- |
| rootFile | ✔ | The root language file against which comparison will be made |
| lang files | ❌ | Translation file names to be validated, space separated. If no file names are passed, all in the provided **i18n** directory will be validated (except for the root file) |

Example:
`insync [--dir path/to/i18n] validate en.json [xx.json yy.json zz.json ...]`

###### **add**
Launches an interactive prompt that guides you through adding new keys in the files

| Prompt | Description |
| --- | --- |
| New key path | A valid JSON path to be created. If the paths already exists, the value will be overwritten |
| Value for **[i18n file].json** file | Parses the i18n dir and asks for values for the specified key path, for all i18n files |
| Is this correct? | Confirmation of validity of the provided information |

Example:
`insync [--dir path/to/i18n] add`

## Upcoming features
1. root file and i18n files to be validated should be passed with flags, to improve readability
   - `insync [--dir path/to/i18n] validate --root en.json [--files xx.json yy.json zz.json ...]`
2. Remove command - like **add** the command, it would receive a key path and remove it from all i18n files in the provided i18n dir
3. Fix command - at the moment, the **validate** command outputs the any inconsistencies between files. You should have the option of fixing the issues
    - if a key path is missing, start the prompt and request a value
    - if an orphan key is present, remove it automatically
    - output a report of the actions taken

