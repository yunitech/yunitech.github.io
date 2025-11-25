# Projects Data Structure

## Overview
The projects data has been restructured from a single monolithic `projects.json` file to a modular directory-based system for better maintainability and reduced risk of accidental data corruption.

## Directory Structure
```
data/
└── projects/
    ├── index.json          # Master index of all project files
    ├── 1-fps-gas-core.json
    ├── 2-heli-with-dynamic-dust.json
    ├── 3-bird-ai-system.json
    ├── 4-pcg-cave-interior.json
    ├── 5-labyrinth-system.json
    ├── 6-top-down-zombie-apocalypse-survival.json
    ├── 7-yunieos.json
    ├── 8-customizable-weapon.json
    ├── 9-true-fps-template.json
    └── 10-yunilingo-tts-plugin.json
```

## File Naming Convention
Individual project files follow the pattern: `{id}-{project-slug}.json`

- `id`: Numeric identifier (1, 2, 3, etc.)
- `project-slug`: URL-friendly version of the project name (lowercase, hyphens instead of spaces/special chars)

## Index File Format
`data/projects/index.json` contains:
```json
{
  "projects": [
    "1-fps-gas-core.json",
    "2-heli-with-dynamic-dust.json",
    // ... all project filenames in order
  ],
  "featured": [
    "1",
    "7",
    "8"
    // ... IDs of projects to feature on home page (any order, any projects)
  ]
}
```

## Loading Mechanism
The JavaScript loading system (`js/projects.js`) now:
1. Fetches the index file to get the list of project files
2. Loads each project file asynchronously
3. Extracts the ID from the filename
4. Builds the projectsData object with proper IDs

## Benefits
- **Modularity**: Each project is in its own file, reducing risk of corrupting other projects
- **Maintainability**: Easier to add, remove, or modify individual projects
- **Version Control**: Better git diffs for individual project changes
- **Performance**: Projects can be loaded on-demand if needed in the future
- **Backup Safety**: Individual project files can be backed up separately

## Adding a New Project
1. Create a new JSON file following the naming convention: `{next-id}-{project-slug}.json`
2. Add the filename to the `projects` array in `index.json`
3. Ensure the project data structure matches existing projects

## Migration Notes
- The old `projects.json` file has been preserved for reference but is no longer used
- All project data has been validated to ensure no data loss during migration
- The loading mechanism is backward-compatible in terms of data structure

## Future Enhancements
- Consider implementing lazy loading for project details
- Add validation schema for project data structure
- Implement caching mechanisms for better performance