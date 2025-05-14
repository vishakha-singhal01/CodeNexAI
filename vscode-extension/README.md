# CodeNexAI - AI-Powered Code Documentation

## Overview

CodeNexAI is a VS Code extension that helps you generate high-quality documentation for your code using the power of AI.  It simplifies the process of documenting your code, making it easier to understand, maintain, and collaborate on projects.

## Features

*   **Supported Languages:**
    ![JavaScript](https://img.shields.io/badge/JavaScript-yellow?style=flat-square&logo=javascript)
    ![TypeScript](https://img.shields.io/badge/TypeScript-blue?style=flat-square&logo=typescript)
    ![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python)
    ![Java](https://img.shields.io/badge/Java-007396?style=flat-square&logo=java)
    ![C++](https://img.shields.io/badge/C++-00599C?style=flat-square&logo=c%2B%2B)
    ![C#](https://img.shields.io/badge/C#-239120?style=flat-square&logo=c-sharp)
    ![HTML](https://img.shields.io/badge/HTML-E34F26?style=flat-square&logo=html5)
    ![CSS](https://img.shields.io/badge/CSS-1572B6?style=flat-square&logo=css3)
    ![SCSS](https://img.shields.io/badge/SCSS-CC6699?style=flat-square&logo=sass)
    ![LESS](https://img.shields.io/badge/LESS-2B4C7A?style=flat-square&logo=less)
    ![JSON](https://img.shields.io/badge/JSON-000000?style=flat-square&logo=json)
    ![Markdown](https://img.shields.io/badge/Markdown-000000?style=flat-square&logo=markdown)
    ![Text](https://img.shields.io/badge/Text-000000?style=flat-square&logo=text)
    ![Shell](https://img.shields.io/badge/Shell-4EAA25?style=flat-square&logo=shell)
    ![Ruby](https://img.shields.io/badge/Ruby-CC342D?style=flat-square&logo=ruby)
    ![Go](https://img.shields.io/badge/Go-00ADD8?style=flat-square&logo=go)
    ![PHP](https://img.shields.io/badge/PHP-777BB4?style=flat-square&logo=php)

*   **AI-Powered Documentation:** Automatically generate documentation for selected code snippets.
*   **Easy to Use:** Simply select the code, right-click, and choose "CodenexAI: Generate Documentation for Selection".
*   **Context Menu Integration:** Seamlessly integrated into the VS Code editor via the context menu.
*   **Supports Multiple Languages:** Works with a wide range of programming languages.
*   **Improved Code Understanding:** Helps you and your team understand code faster and more effectively.
*   **Enhanced Collaboration:** Facilitates better collaboration by providing clear and concise documentation.

## Installation

1.  Open Visual Studio Code.
2.  Go to the Extensions view (`Ctrl+Shift+X` or `Cmd+Shift+X`).
3.  Search for "CodeNexAI".
4.  Click "Install".

## Usage

### 1. Sign Up and Verify Your Email

To use the extension, you need to sign up for an account at [codenexai.com](https://codenexai.com) and verify your email address. This step is crucial for accessing the AI-powered documentation generation service.

### Login

To login, use the command `CodeNexAI: Login` in the command palette (`Ctrl+Shift+P` or `Cmd+Shift+P`)

### Logout

To logout, use the command `CodeNexAI: Logout` in the command palette (`Ctrl+Shift+P` or `Cmd+Shift+P`)

### 2. Select Code

Open a code file in the editor and select the code snippet you want to document.

### 3. Generate Documentation

Right-click on the selected code and choose "CodeNexAI: Generate Documentation for Selection" from the context menu.

### 4. Review and Refine

The generated documentation will appear in a separate panel. Review the documentation and refine it as needed to ensure accuracy and clarity.

## Example

Let's say you have the following JavaScript function:

```javascript
function add(a, b) {
  return a + b;
}
```

1.  Select the code snippet.
2.  Right-click and select "CodeNexAI: Generate Documentation for Selection".
3.  CodeNexAI will generate documentation similar to this:

```javascript
/**
 * Adds two numbers together.
 *
 * @param {number} a The first number.
 * @param {number} b The second number.
 * @returns {number} The sum of the two numbers.
 */
function add(a, b) {
  return a + b;
}
```


## Release Notes

### 0.1.3

*   Added option for logout


### Contributors 

- [@Vishakha Singhal](https://github.com/vishakha-singhal01)
- [@Swadesh Kumar](https://github.com/swadesh0287)

**Enjoy using CodeNexAI!**
