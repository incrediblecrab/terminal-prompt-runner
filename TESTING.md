# Testing Instructions for Terminal Prompt Runner

## Prerequisites
- VS Code version 1.74.0 or higher
- Node.js and npm installed

## Development Testing

### 1. Open in VS Code
```bash
cd /Users/maxmarquardt/Documents/dev/terminal-prompt-runner
code .
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run in Debug Mode
1. Press `F5` or go to `Run and Debug` view
2. Select "Run Extension" from the dropdown
3. Click the green play button
4. This will open a new VS Code window with the extension loaded

### 4. Manual Testing Steps

#### A. Create a New Prompt
1. In the Explorer sidebar, find "Terminal Prompts" section
2. Click the "+" button to add a new prompt
3. Enter a name like "Test Commands"
4. Enter commands like:
   ```
   echo "Hello World"
   pwd
   ls -la
   ```
5. Click "Save"

#### B. Run the Prompt
1. Find your prompt in the "Terminal Prompts" list
2. Click the play button (▶️) next to it
3. Verify that:
   - A new terminal opens with the prompt name
   - Commands execute sequentially
   - Each command runs in the current workspace directory

#### C. Edit an Existing Prompt
1. Click the edit button (✏️) next to a prompt
2. Modify the name and/or commands
3. Click "Save"
4. Verify changes are reflected in the list

#### D. Delete a Prompt
1. Click the delete button (🗑️) next to a prompt
2. Confirm deletion when prompted
3. Verify prompt is removed from the list

### 5. Production Testing

#### Install from VSIX
```bash
# If you have VS Code CLI installed
code --install-extension terminal-prompt-runner-0.0.1.vsix

# Or manually:
# 1. Open VS Code
# 2. Go to Extensions view (Ctrl+Shift+X)
# 3. Click "..." menu > "Install from VSIX..."
# 4. Select the .vsix file
```

## Validation Checklist

- [ ] Extension appears in Explorer sidebar as "Terminal Prompts"
- [ ] Can create new prompts with multi-line commands
- [ ] Can edit existing prompts
- [ ] Can delete prompts with confirmation dialog
- [ ] Play button executes commands in terminal
- [ ] Commands execute in correct workspace directory
- [ ] Error handling works (empty names, duplicate names, etc.)
- [ ] Prompts persist between VS Code sessions
- [ ] Terminal shows proper naming convention
- [ ] Multiple commands execute sequentially with proper timing

## Known Limitations

- Commands execute with 100ms delay between them
- Terminal execution depends on shell environment
- Prompts are stored in VS Code global state
- Extension requires workspace for proper directory context

## Troubleshooting

1. **Extension not loading**: Check VS Code console for errors
2. **Commands not executing**: Verify terminal shell is responsive
3. **Prompts not persisting**: Check VS Code settings/storage permissions
4. **Build issues**: Run `npm run compile` to check TypeScript errors