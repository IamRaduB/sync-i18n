# Sync Translations
Command line tool that allows you to sync i18n json files

## Installation

## Usage

It provides several commands to process i18n files:
1. validation

Example: `st validate ./i18n en.json [ro.json nl.json de.json]`
    
Is used to ensure synchronization across all translation files in your project

| Command | Parameters | Description |
| ------- | ------ | ----------- |
| validate | \<i18nDir> | Location of the translation files |
|  | \<rootFile> | What is the root language file against which comparison will be made |
|  | [lang files] | Specific translation files to be tested. Space separated |

## Local setup
* `npm install`

Run the following commands to demo the **validate** command

`validate-all` executes the validate command against all files in the i18n directory
* `npm run validate-all`

`validate-some` executes the validate command only for the ro.json file, against the en.json file
* `npm run validate-some`

Run tests
* `npm run test`
